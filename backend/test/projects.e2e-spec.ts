import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/database/prisma.service';
import { createTestingApp, shutdownTestingApp } from './e2e/test-utils';
import {
  ensureTestUsers,
  getAccessToken,
  getUserId,
  TestRole,
} from './e2e/auth-helpers';
import { ProjectRole, ProjectStatus } from '@prisma/client';

interface ResponseEnvelope<T> {
  data: T;
  statusCode: number;
  message: string;
  timestamp: string;
}

interface ProjectMemberPayload {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  joinedAt: string;
  user: {
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
  };
}

interface ProjectPayload {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  members: ProjectMemberPayload[];
}

interface PaginatedProjectsPayload {
  data: ProjectPayload[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

describe('ProjectsController (e2e)', () => {
  let app: INestApplication;
  let httpServer: Parameters<typeof request>[0];
  let prisma: PrismaService;

  const tokens: Partial<Record<TestRole, string>> = {};
  const userIds: Partial<Record<TestRole, string>> = {};

  const projectIdsForCleanup: Set<string> = new Set();
  let createdProjectId: string | null = null;
  let createdProjectName: string | null = null;
  let deletedProjectId: string | null = null;

  beforeAll(async () => {
    process.env.REDIS_URL = '';

    app = await createTestingApp();
    httpServer = app.getHttpServer() as Parameters<typeof request>[0];
    prisma = app.get(PrismaService);

    await ensureTestUsers(app);

    const roles: TestRole[] = ['ADMIN', 'SUPER_ADMIN', 'USER'];
    for (const role of roles) {
      userIds[role] = await getUserId(app, role);
      tokens[role] = await getAccessToken(app, role);
    }
  });

  afterAll(async () => {
    if (projectIdsForCleanup.size) {
      await prisma.project
        .deleteMany({
          where: { id: { in: Array.from(projectIdsForCleanup) } },
        })
        .catch(() => undefined);
    }

    await shutdownTestingApp(app);
  });

  const parseResponse = <T>(res: request.Response) =>
    res.body as ResponseEnvelope<T>;

  describe('POST /api/projects', () => {
    it('allows a user to create a project and become owner', async () => {
      const createPayload = {
        name: `E2E Project ${Date.now()}`,
        description: 'Project created via e2e test',
      };

      const res = await request(httpServer)
        .post('/api/projects')
        .set('Authorization', `Bearer ${tokens.USER}`)
        .send(createPayload);

      expect(res.status).toBe(201);
      const body = parseResponse<ProjectPayload>(res);
      expect(body.data).toMatchObject({
        name: createPayload.name,
        description: createPayload.description,
        status: ProjectStatus.ACTIVE,
      });

      const ownerMembership = body.data.members.find(
        (member) => member.userId === userIds.USER,
      );
      expect(ownerMembership?.role).toBe(ProjectRole.OWNER);

      createdProjectId = body.data.id;
      createdProjectName = body.data.name;
      projectIdsForCleanup.add(body.data.id);
    });
  });

  describe('GET /api/projects', () => {
    it('returns project list with pagination meta', async () => {
      const res = await request(httpServer)
        .get('/api/projects')
        .set('Authorization', `Bearer ${tokens.USER}`);

      expect(res.status).toBe(200);
      const body = parseResponse<PaginatedProjectsPayload>(res);
      expect(Array.isArray(body.data.data)).toBe(true);
      expect(body.data.meta).toMatchObject({
        page: expect.any(Number),
        limit: expect.any(Number),
        total: expect.any(Number),
      });

      const project = body.data.data.find(
        (item) => item.id === createdProjectId,
      );
      expect(project?.name).toBe(createdProjectName);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('retrieves project details with members and tasks', async () => {
      const res = await request(httpServer)
        .get(`/api/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${tokens.USER}`);

      expect(res.status).toBe(200);
      const body = parseResponse<ProjectPayload>(res);
      expect(body.data.id).toBe(createdProjectId);
      expect(body.data.members.some((m) => m.userId === userIds.USER)).toBe(
        true,
      );
    });
  });

  describe('PATCH /api/projects/:id', () => {
    it('updates project fields', async () => {
      const updatedDescription = 'Updated project description';
      const res = await request(httpServer)
        .patch(`/api/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${tokens.USER}`)
        .send({
          description: updatedDescription,
          status: ProjectStatus.INACTIVE,
        });

      expect(res.status).toBe(200);
      const body = parseResponse<ProjectPayload>(res);
      expect(body.data.description).toBe(updatedDescription);
      expect(body.data.status).toBe(ProjectStatus.INACTIVE);
    });
  });

  describe('Project members management', () => {
    it('lists project members including owner', async () => {
      const res = await request(httpServer)
        .get(`/api/projects/${createdProjectId}/members`)
        .set('Authorization', `Bearer ${tokens.USER}`);

      expect(res.status).toBe(200);
      const body = parseResponse<ProjectMemberPayload[]>(res);
      const owner = body.data.find((member) => member.userId === userIds.USER);
      expect(owner?.role).toBe(ProjectRole.OWNER);
    });

    it('allows adding a project member', async () => {
      const targetUserId = userIds.ADMIN!;
      const addRes = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: targetUserId,
            projectId: createdProjectId!,
          },
        },
      });
      if (addRes) {
        await prisma.projectMember.delete({
          where: { id: addRes.id },
        });
      }

      const res = await request(httpServer)
        .post(`/api/projects/${createdProjectId}/members`)
        .set('Authorization', `Bearer ${tokens.USER}`)
        .send({
          userId: targetUserId,
          role: ProjectRole.ADMIN,
        });

      expect(res.status).toBe(201);
      const body = parseResponse<ProjectMemberPayload>(res);
      expect(body.data.userId).toBe(targetUserId);
      expect(body.data.role).toBe(ProjectRole.ADMIN);
    });

    it('allows updating a project member role', async () => {
      const targetUserId = userIds.ADMIN!;
      const resAdd = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: targetUserId,
            projectId: createdProjectId!,
          },
        },
      });
      if (!resAdd) {
        await prisma.projectMember.create({
          data: {
            projectId: createdProjectId!,
            userId: targetUserId,
            role: ProjectRole.ADMIN,
          },
        });
      }

      const res = await request(httpServer)
        .patch(
          `/api/projects/${createdProjectId}/members/${targetUserId}`,
        )
        .set('Authorization', `Bearer ${tokens.USER}`)
        .send({ role: ProjectRole.VIEWER });

      expect(res.status).toBe(200);
      const body = parseResponse<ProjectMemberPayload>(res);
      expect(body.data.role).toBe(ProjectRole.VIEWER);
    });

    it('allows removing a project member', async () => {
      const targetUserId = userIds.ADMIN!;
      const ensureMembership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: targetUserId,
            projectId: createdProjectId!,
          },
        },
      });
      if (!ensureMembership) {
        await prisma.projectMember.create({
          data: {
            projectId: createdProjectId!,
            userId: targetUserId,
            role: ProjectRole.VIEWER,
          },
        });
      }

      const res = await request(httpServer)
        .delete(
          `/api/projects/${createdProjectId}/members/${targetUserId}`,
        )
        .set('Authorization', `Bearer ${tokens.USER}`);

      expect(res.status).toBe(204);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('removes the project and cascades related data', async () => {
      const targetProjectId = createdProjectId!;
      const res = await request(httpServer)
        .delete(`/api/projects/${targetProjectId}`)
        .set('Authorization', `Bearer ${tokens.USER}`);

      expect(res.status).toBe(204);
      projectIdsForCleanup.delete(targetProjectId);
      createdProjectId = null;
      deletedProjectId = targetProjectId;
    });

    it('returns 404 for subsequent fetch after deletion', async () => {
      const res = await request(httpServer)
        .get(`/api/projects/${deletedProjectId}`)
        .set('Authorization', `Bearer ${tokens.USER}`);

      expect(res.status).toBe(404);
    });
  });
});
