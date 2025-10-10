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
import { Priority, ProjectRole, TaskStatus } from '@prisma/client';

interface ResponseEnvelope<T> {
  data: T;
  statusCode: number;
  message: string;
  timestamp: string;
}

interface TaskUserSummary {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
}

interface TaskProjectSummary {
  id: string;
  name: string;
}

interface TaskPayload {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | null;
  projectId: string;
  creatorId: string;
  assigneeId?: string | null;
  createdAt: string;
  updatedAt: string;
  project: TaskProjectSummary;
  creator: TaskUserSummary;
  assignee?: TaskUserSummary | null;
}

interface PaginatedTasksPayload {
  data: TaskPayload[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

describe('TasksController (e2e)', () => {
  let app: INestApplication;
  let httpServer: Parameters<typeof request>[0];
  let prisma: PrismaService;

  const tokens: Partial<Record<TestRole, string>> = {};
  const userIds: Partial<Record<TestRole, string>> = {};

  let projectId: string;
  let projectName: string;
  const createdTaskIds: Set<string> = new Set();
  let deletedTaskId: string | null = null;

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

    const unique = Date.now();
    const project = await prisma.project.create({
      data: {
        name: `Tasks Project ${unique}`,
        description: 'Project created for tasks e2e tests',
        members: {
          create: [
            {
              userId: userIds.USER!,
              role: ProjectRole.OWNER,
            },
            {
              userId: userIds.ADMIN!,
              role: ProjectRole.MEMBER,
            },
          ],
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    projectId = project.id;
    projectName = project.name;
  });

  afterAll(async () => {
    if (createdTaskIds.size) {
      await prisma.task
        .deleteMany({
          where: { id: { in: Array.from(createdTaskIds) } },
        })
        .catch(() => undefined);
    }

    if (projectId) {
      await prisma.project
        .delete({ where: { id: projectId } })
        .catch(() => undefined);
    }

    await shutdownTestingApp(app);
  });

  const parseResponse = <T>(res: request.Response) =>
    res.body as ResponseEnvelope<T>;

  let createdTaskId: string | null = null;

  describe('POST /api/tasks', () => {
    it('allows a user to create a task within a project', async () => {
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const payload = {
        title: `Initial task ${Date.now()}`,
        description: 'Task created via e2e test',
        projectId,
        assigneeId: userIds.USER,
        priority: Priority.MEDIUM,
        dueDate,
      };

      const res = await request(httpServer)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokens.USER}`)
        .send(payload);

      expect(res.status).toBe(201);
      const body = parseResponse<TaskPayload>(res);
      expect(body.data).toMatchObject({
        title: payload.title,
        project: { id: projectId, name: projectName },
        assignee: { id: userIds.USER },
        priority: Priority.MEDIUM,
      });

      createdTaskId = body.data.id;
      createdTaskIds.add(body.data.id);
    });
  });

  describe('GET /api/tasks', () => {
    it('returns paginated tasks with filters', async () => {
      const res = await request(httpServer)
        .get('/api/tasks')
        .query({ projectId })
        .set('Authorization', `Bearer ${tokens.USER}`);

      expect(res.status).toBe(200);
      const body = parseResponse<PaginatedTasksPayload>(res);
      expect(Array.isArray(body.data.data)).toBe(true);
      expect(body.data.meta).toMatchObject({
        page: expect.any(Number),
        limit: expect.any(Number),
      });

      const task = body.data.data.find((item) => item.id === createdTaskId);
      expect(task?.project.id).toBe(projectId);
    });

    it('returns tasks for a specific project', async () => {
      const res = await request(httpServer)
        .get(`/api/tasks/project/${projectId}`)
        .set('Authorization', `Bearer ${tokens.USER}`);

      expect(res.status).toBe(200);
      const body = parseResponse<PaginatedTasksPayload>(res);
      expect(
        body.data.data.some((item) => item.project.id === projectId),
      ).toBe(true);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('retrieves task details', async () => {
      const res = await request(httpServer)
        .get(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${tokens.USER}`);

      expect(res.status).toBe(200);
      const body = parseResponse<TaskPayload>(res);
      expect(body.data.id).toBe(createdTaskId);
      expect(body.data.project.id).toBe(projectId);
    });
  });

  describe('Task listing shortcuts', () => {
    it('returns tasks assigned to the current user', async () => {
      const res = await request(httpServer)
        .get('/api/tasks/my-tasks')
        .set('Authorization', `Bearer ${tokens.USER}`);

      expect(res.status).toBe(200);
      const body = parseResponse<PaginatedTasksPayload>(res);
      expect(
        body.data.data.some((task) => task.id === createdTaskId),
      ).toBe(true);
    });

    it('returns tasks created by the current user', async () => {
      const res = await request(httpServer)
        .get('/api/tasks/created-by-me')
        .set('Authorization', `Bearer ${tokens.USER}`);

      expect(res.status).toBe(200);
      const body = parseResponse<PaginatedTasksPayload>(res);
      expect(
        body.data.data.some((task) => task.id === createdTaskId),
      ).toBe(true);
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('updates mutable task fields', async () => {
      const updatedTitle = `Updated task title ${Date.now()}`;
      const res = await request(httpServer)
        .patch(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${tokens.USER}`)
        .send({
          title: updatedTitle,
          priority: Priority.HIGH,
        });

      expect(res.status).toBe(200);
      const body = parseResponse<TaskPayload>(res);
      expect(body.data.title).toBe(updatedTitle);
      expect(body.data.priority).toBe(Priority.HIGH);
    });

    it('updates task status independently', async () => {
      const res = await request(httpServer)
        .patch(`/api/tasks/${createdTaskId}/status`)
        .set('Authorization', `Bearer ${tokens.USER}`)
        .send({ status: TaskStatus.IN_PROGRESS });

      expect(res.status).toBe(200);
      const body = parseResponse<TaskPayload>(res);
      expect(body.data.status).toBe(TaskStatus.IN_PROGRESS);
    });
  });

  describe('Task assignment flow', () => {
    it('reassigns a task to another user', async () => {
      const res = await request(httpServer)
        .patch(`/api/tasks/${createdTaskId}/assign`)
        .set('Authorization', `Bearer ${tokens.USER}`)
        .send({ assigneeId: userIds.ADMIN });

      expect(res.status).toBe(200);
      const body = parseResponse<TaskPayload>(res);
      expect(body.data.assignee?.id).toBe(userIds.ADMIN);
    });

    it('lists tasks for the new assignee', async () => {
      const res = await request(httpServer)
        .get(`/api/tasks/assignee/${userIds.ADMIN}`)
        .set('Authorization', `Bearer ${tokens.ADMIN}`);

      expect(res.status).toBe(200);
      const body = parseResponse<PaginatedTasksPayload>(res);
      expect(
        body.data.data.some((task) => task.id === createdTaskId),
      ).toBe(true);
    });

    it('returns reassigned tasks in admin my-tasks view', async () => {
      const res = await request(httpServer)
        .get('/api/tasks/my-tasks')
        .set('Authorization', `Bearer ${tokens.ADMIN}`);

      expect(res.status).toBe(200);
      const body = parseResponse<PaginatedTasksPayload>(res);
      expect(
        body.data.data.some((task) => task.id === createdTaskId),
      ).toBe(true);
    });

    it('allows unassigning a task', async () => {
      const res = await request(httpServer)
        .patch(`/api/tasks/${createdTaskId}/assign`)
        .set('Authorization', `Bearer ${tokens.ADMIN}`)
        .send({ assigneeId: null });

      expect(res.status).toBe(200);
      const body = parseResponse<TaskPayload>(res);
      expect(body.data.assignee).toBeNull();
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('removes the task', async () => {
      const targetTaskId = createdTaskId!;
      const res = await request(httpServer)
        .delete(`/api/tasks/${targetTaskId}`)
        .set('Authorization', `Bearer ${tokens.USER}`);

      expect(res.status).toBe(204);
      createdTaskIds.delete(targetTaskId);
      createdTaskId = null;
      deletedTaskId = targetTaskId;
    });

    it('returns 404 when fetching deleted task', async () => {
      const res = await request(httpServer)
        .get(`/api/tasks/${deletedTaskId}`)
        .set('Authorization', `Bearer ${tokens.USER}`);

      expect(res.status).toBe(404);
    });
  });
});
