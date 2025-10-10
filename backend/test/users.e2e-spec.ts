import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../src/database/prisma.service';
import { createTestingApp, shutdownTestingApp } from './e2e/test-utils';
import {
  ensureTestUsers,
  getAccessToken,
  getUserId,
  TestRole,
  TEST_USER_PASSWORD,
} from './e2e/auth-helpers';
import { Role } from '@prisma/client';

interface UserPayload {
  id: string;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedUsersPayload {
  data: UserPayload[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ProjectSummaryPayload {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    tasks: number;
    members: number;
  };
}

interface UserProjectMembershipPayload {
  id: string;
  role: string;
  joinedAt: string;
  projectId: string;
  userId: string;
  project: ProjectSummaryPayload;
}

interface TaskAssigneeSummaryPayload {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
}

interface UserTaskPayload {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
  };
  assignee?: TaskAssigneeSummaryPayload | null;
}

// Utility function to generate random alphanumeric string
const generateRandomId = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};


describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let httpServer: Parameters<typeof request>[0];
  let prisma: PrismaService;

  const tokens: Partial<Record<TestRole, string>> = {};
  const userIds: Partial<Record<TestRole, string>> = {};
  const createdUserIds: string[] = [];
  const createdProjectIds: string[] = [];
  const createdTaskIds: string[] = [];

  let managedUserId: string;
  let managedUserEmail: string;
  let managedUsername: string;
  let managedProjectId: string;
  let managedProjectName: string;
  let userProjectId: string;
  let userProjectName: string;
  let managedTaskId: string;
  let managedTaskTitle: string;
  let userTaskId: string;
  let userTaskTitle: string;
  let originalUserEmail: string | null = null;
  let originalUserFirstName: string | null = null;
  let originalUserLastName: string | null = null;
  let originalUserAvatar: string | null = null;

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

    const uniqueSuffix = Date.now();
    const managedUser = await prisma.user.create({
      data: {
        email: `managed.user.${uniqueSuffix}@opshub.com`,
        username: `managed_user_${uniqueSuffix}`,
        password: await bcrypt.hash(TEST_USER_PASSWORD, 10),
        role: Role.USER,
        firstName: 'Managed',
        lastName: 'User',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
      },
    });

    managedUserId = managedUser.id;
    managedUserEmail = managedUser.email;
    managedUsername = `managed_user_${uniqueSuffix}`;

    const regularUserId = userIds.USER;
    if (!regularUserId) {
      throw new Error('Regular test user ID not initialized');
    }

    const baselineUser = await prisma.user.findUnique({
      where: { id: regularUserId },
      select: { email: true, firstName: true, lastName: true, avatar: true },
    });

    if (!baselineUser) {
      throw new Error('Baseline test user not found in database');
    }

    originalUserEmail = baselineUser.email;
    originalUserFirstName = baselineUser.firstName ?? null;
    originalUserLastName = baselineUser.lastName ?? null;
    originalUserAvatar = baselineUser.avatar ?? null;

    managedProjectName = `Managed Project ${Date.now()}`;
    const managedProject = await prisma.project.create({
      data: {
        name: managedProjectName,
        description: 'E2E managed user project',
        members: {
          create: { userId: managedUserId },
        },
      },
      select: { id: true },
    });
    managedProjectId = managedProject.id;
    createdProjectIds.push(managedProjectId);

    userProjectName = `User Project ${Date.now()}`;
    const userProject = await prisma.project.create({
      data: {
        name: userProjectName,
        description: 'E2E regular user project',
        members: {
          create: { userId: regularUserId },
        },
      },
      select: { id: true },
    });
    userProjectId = userProject.id;
    createdProjectIds.push(userProjectId);

    managedTaskTitle = `Managed Task ${Date.now()}`;
    const managedTask = await prisma.task.create({
      data: {
        title: managedTaskTitle,
        description: 'E2E task for managed user',
        projectId: managedProjectId,
        creatorId: managedUserId,
        assigneeId: managedUserId,
      },
      select: { id: true },
    });
    managedTaskId = managedTask.id;
    createdTaskIds.push(managedTaskId);

    userTaskTitle = `User Task ${Date.now()}`;
    const userTask = await prisma.task.create({
      data: {
        title: userTaskTitle,
        description: 'E2E task for default user',
        projectId: userProjectId,
        creatorId: regularUserId,
        assigneeId: regularUserId,
      },
      select: { id: true },
    });
    userTaskId = userTask.id;
    createdTaskIds.push(userTaskId);
  });

  afterAll(async () => {
    if (createdTaskIds.length) {
      await prisma.task.deleteMany({
        where: { id: { in: createdTaskIds } },
      });
    }

    if (createdProjectIds.length) {
      await prisma.project.deleteMany({
        where: { id: { in: createdProjectIds } },
      });
    }

    if (managedUserId) {
      await prisma.user.delete({ where: { id: managedUserId } }).catch(() => undefined);
    }

    if (createdUserIds.length) {
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
    }

    await shutdownTestingApp(app);
  });

  const expectForbidden = (response: request.Response) => {
    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      statusCode: 403,
    });
  };

  const parseResponse = <T>(res: request.Response) =>
    res.body as ResponseEnvelope<T>;

  interface ResponseEnvelope<T> {
    data: T;
    statusCode: number;
    message: string;
    timestamp: string;
  }

  describe('GET /api/users', () => {
    test.each<TestRole>(['ADMIN', 'SUPER_ADMIN'])(
      'allows %s to list users',
      async (role) => {
        const res = await request(httpServer)
          .get('/api/users')
          .set('Authorization', `Bearer ${tokens[role]}`);

        expect(res.status).toBe(200);
        const body = parseResponse<PaginatedUsersPayload>(res);
        expect(Array.isArray(body.data.data)).toBe(true);
        expect(body.data.meta).toMatchObject({
          page: expect.any(Number),
          limit: expect.any(Number),
        });
      },
    );

    it('forbids USER from listing users', async () => {
      const res = await request(httpServer)
        .get('/api/users')
        .set('Authorization', `Bearer ${tokens.USER}`);

      expectForbidden(res);
    });
  });

  describe('POST /api/users', () => {
    const payloadForRole = (role: TestRole) => {
      const unique = `${Date.now()}`;
      return {
        email: `created.${unique}@opshub.com`,
        username: `c_${unique}`,
        password: TEST_USER_PASSWORD,
        firstName: 'Created',
        lastName: role,
        role: Role.USER,
      };
    };

    test.each<TestRole>(['ADMIN', 'SUPER_ADMIN'])(
      'allows %s to create a user',
      async (role) => {
        const payload = payloadForRole(role);
        const res = await request(httpServer)
          .post('/api/users')
          .set('Authorization', `Bearer ${tokens[role]}`)
          .send(payload);

        if (res.status !== 201) {
          throw new Error(
            `Create user failed for role ${role}: ${res.status} ${JSON.stringify(res.body)}`,
          );
        }
        const body = parseResponse<UserPayload>(res);
        expect(body.data).toMatchObject({
          email: payload.email,
          username: payload.username,
        });

        createdUserIds.push(body.data.id);
      },
    );

    it('forbids USER from creating a user', async () => {
      const payload = payloadForRole('USER');
      const res = await request(httpServer)
        .post('/api/users')
        .set('Authorization', `Bearer ${tokens.USER}`)
        .send(payload);

      expectForbidden(res);
      await prisma.user.deleteMany({ where: { email: payload.email } });
    });
  });

  describe('GET /api/users/me', () => {
    test.each<TestRole>(['ADMIN', 'SUPER_ADMIN', 'USER'])(
      'returns profile for %s',
      async (role) => {
        const res = await request(httpServer)
          .get('/api/users/me')
          .set('Authorization', `Bearer ${tokens[role]}`);

        expect(res.status).toBe(200);
        const body = parseResponse<UserPayload>(res);
        expect(body.data).toMatchObject({
          id: userIds[role],
        });
      },
    );
  });

  describe('GET /api/users/:id', () => {
    test.each<TestRole>(['ADMIN', 'SUPER_ADMIN', 'USER'])(
      '%s can retrieve a user by id',
      async (role) => {
        const res = await request(httpServer)
          .get(`/api/users/${managedUserId}`)
          .set('Authorization', `Bearer ${tokens[role]}`);

        expect(res.status).toBe(200);
        const body = parseResponse<UserPayload>(res);
        expect(body.data).toMatchObject({
          id: managedUserId,
          email: managedUserEmail,
        });
      },
    );
  });

  describe('PATCH /api/users/me', () => {
    it('allows user to update own profile fields while ignoring restricted fields', async () => {
      const userId = userIds.USER!;
      const newEmail = `self.update.${Date.now()}@opshub.com`;
      const res = await request(httpServer)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${tokens.USER}`)
        .send({
          email: newEmail,
          firstName: 'Self',
          lastName: 'Updater',
          role: 'ADMIN',
          username: 'attempt_change_username',
        });

      expect(res.status).toBe(200);
      const body = parseResponse<UserPayload>(res);
      expect(body.data.email).toBe(newEmail);
      expect(body.data.firstName).toBe('Self');
      expect(body.data.lastName).toBe('Updater');
      // Ensure restricted fields remain unchanged
      expect(body.data.role).toBe(Role.USER);
      expect(body.data.username).toBeDefined();

      // revert changes to avoid side effects
      await prisma.user.update({
        where: { id: userId },
        data: {
          email: originalUserEmail ?? undefined,
          firstName: originalUserFirstName ?? undefined,
          lastName: originalUserLastName ?? undefined,
          avatar: originalUserAvatar ?? undefined,
        },
      });
    });

    it('rejects updates that would violate email uniqueness', async () => {
      const res = await request(httpServer)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${tokens.USER}`)
        .send({
          email: managedUserEmail,
        });

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        message: expect.stringContaining('Email already exists'),
      });
    });
  });

  describe('PATCH /api/users/:id', () => {
    test.each<TestRole>(['ADMIN', 'SUPER_ADMIN', 'USER'])(
      '%s can update user profile fields',
      async (role) => {
        const updatedName = `${role}-updated-${Date.now()}`;
        const res = await request(httpServer)
          .patch(`/api/users/${managedUserId}`)
          .set('Authorization', `Bearer ${tokens[role]}`)
          .send({ firstName: updatedName });

        expect(res.status).toBe(200);
        const body = parseResponse<UserPayload>(res);
        expect(body.data.firstName).toBe(updatedName);
      },
    );
  });

  describe('PATCH /api/users/me/password', () => {
    const newPassword = 'SelfNewPassword123!';

    it('allows user to change own password', async () => {
      const res = await request(httpServer)
        .patch('/api/users/me/password')
        .set('Authorization', `Bearer ${tokens.USER}`)
        .send({
          currentPassword: TEST_USER_PASSWORD,
          newPassword,
        });

      expect(res.status).toBe(200);

      await prisma.user.update({
        where: { id: userIds.USER! },
        data: { password: await bcrypt.hash(TEST_USER_PASSWORD, 10) },
      });
    });

    it('rejects password update when current password is incorrect', async () => {
      const res = await request(httpServer)
        .patch('/api/users/me/password')
        .set('Authorization', `Bearer ${tokens.USER}`)
        .send({
          currentPassword: 'WrongPassword!',
          newPassword: 'AnotherPass123!',
        });

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        message: expect.stringContaining('Current password is incorrect'),
      });
    });
  });

  describe('GET /api/users/:id/projects', () => {
    it('allows ADMIN to list projects for a user', async () => {
      const res = await request(httpServer)
        .get(`/api/users/${managedUserId}/projects`)
        .set('Authorization', `Bearer ${tokens.ADMIN}`);

      expect(res.status).toBe(200);
      const body = parseResponse<UserProjectMembershipPayload[]>(res);
      expect(Array.isArray(body.data)).toBe(true);

      const membership = body.data.find(
        (item) => item.projectId === managedProjectId,
      );
      expect(membership).toBeDefined();
      expect(membership?.project.name).toBe(managedProjectName);
    });

    it('allows USER to list their own projects', async () => {
      const userId = userIds.USER!;
      const res = await request(httpServer)
        .get(`/api/users/${userId}/projects`)
        .set('Authorization', `Bearer ${tokens.USER}`);

      expect(res.status).toBe(200);
      const body = parseResponse<UserProjectMembershipPayload[]>(res);

      const membership = body.data.find(
        (item) => item.projectId === userProjectId,
      );
      expect(membership).toBeDefined();
      expect(membership?.userId).toBe(userId);
      expect(membership?.project.id).toBe(userProjectId);
    });
  });

  describe('GET /api/users/:id/tasks', () => {
    it('allows ADMIN to list tasks for a user', async () => {
      const res = await request(httpServer)
        .get(`/api/users/${managedUserId}/tasks`)
        .set('Authorization', `Bearer ${tokens.ADMIN}`);

      expect(res.status).toBe(200);
      const body = parseResponse<UserTaskPayload[]>(res);
      expect(Array.isArray(body.data)).toBe(true);

      const task = body.data.find((item) => item.id === managedTaskId);
      expect(task).toBeDefined();
      expect(task?.title).toBe(managedTaskTitle);
      expect(task?.project.id).toBe(managedProjectId);
    });

    it('allows USER to list their own tasks', async () => {
      const userId = userIds.USER!;
      const res = await request(httpServer)
        .get(`/api/users/${userId}/tasks`)
        .set('Authorization', `Bearer ${tokens.USER}`);

      expect(res.status).toBe(200);
      const body = parseResponse<UserTaskPayload[]>(res);

      const task = body.data.find((item) => item.id === userTaskId);
      expect(task).toBeDefined();
      expect(task?.project.id).toBe(userProjectId);
    });
  });

  describe('GET /api/users/me/projects', () => {
    it('lists projects for authenticated user', async () => {
      const res = await request(httpServer)
        .get('/api/users/me/projects')
        .set('Authorization', `Bearer ${tokens.USER}`);

      expect(res.status).toBe(200);
      const body = parseResponse<UserProjectMembershipPayload[]>(res);

      const membership = body.data.find(
        (item) => item.projectId === userProjectId,
      );
      if (!membership) {
        throw new Error(
          `Expected user project ${userProjectId} for USER, got ${JSON.stringify(body.data)}`,
        );
      }
      expect(membership?.project.name).toBe(userProjectName);
    });
  });

  describe('GET /api/users/me/tasks', () => {
    it('lists tasks for authenticated user', async () => {
      const res = await request(httpServer)
        .get('/api/users/me/tasks')
        .set('Authorization', `Bearer ${tokens.USER}`);

      expect(res.status).toBe(200);
      const body = parseResponse<UserTaskPayload[]>(res);

      const task = body.data.find((item) => item.id === userTaskId);
      if (!task) {
        throw new Error(
          `Expected task ${userTaskId} for USER, got ${JSON.stringify(body.data)}`,
        );
      }
      expect(task?.title).toBe(userTaskTitle);
    });
  });

  describe('PATCH /api/users/:id/status', () => {
    test.each<TestRole>(['ADMIN', 'SUPER_ADMIN'])(
      '%s can toggle user status',
      async (role) => {
        const res = await request(httpServer)
          .patch(`/api/users/${managedUserId}/status`)
          .set('Authorization', `Bearer ${tokens[role]}`)
          .send({ isActive: false });

        expect(res.status).toBe(200);
        const body = parseResponse<UserPayload>(res);
        expect(body.data.isActive).toBe(false);

        await prisma.user.update({
          where: { id: managedUserId },
          data: { isActive: true },
        });
      },
    );

    it('forbids USER from toggling status', async () => {
      const res = await request(httpServer)
        .patch(`/api/users/${managedUserId}/status`)
        .set('Authorization', `Bearer ${tokens.USER}`)
        .send({ isActive: false });

      expectForbidden(res);
    });
  });

  describe('GET /api/users/email/:email', () => {
    test.each<TestRole>(['ADMIN', 'SUPER_ADMIN'])(
      '%s can find user by email',
      async (role) => {
        const res = await request(httpServer)
          .get(`/api/users/email/${encodeURIComponent(managedUserEmail)}`)
          .set('Authorization', `Bearer ${tokens[role]}`);

        expect(res.status).toBe(200);
        const body = parseResponse<UserPayload | null>(res);
        expect(body.data?.email).toBe(managedUserEmail);
      },
    );

    it('forbids USER from finding by email', async () => {
      const res = await request(httpServer)
        .get(`/api/users/email/${encodeURIComponent(managedUserEmail)}`)
        .set('Authorization', `Bearer ${tokens.USER}`);

      expectForbidden(res);
    });
  });

  describe('GET /api/users/username/:username', () => {
    test.each<TestRole>(['ADMIN', 'SUPER_ADMIN', 'USER'])(
      '%s can find user by username',
      async (role) => {
        const res = await request(httpServer)
          .get(`/api/users/username/${encodeURIComponent(managedUsername)}`)
          .set('Authorization', `Bearer ${tokens[role]}`);

        expect(res.status).toBe(200);
        const body = parseResponse<UserPayload | null>(res);
        expect(body.data?.username?.toLowerCase()).toBe(
          managedUsername.toLowerCase(),
        );
      },
    );
  });

  describe('PATCH /api/users/:id/password', () => {
    const newPassword = 'NewPassword123!';

    it('allows user to change own password', async () => {
      const userId = userIds.USER!;
      const res = await request(httpServer)
        .patch(`/api/users/${userId}/password`)
        .set('Authorization', `Bearer ${tokens.USER}`)
        .send({
          currentPassword: TEST_USER_PASSWORD,
          newPassword,
        });

      expect(res.status).toBe(200);

      await prisma.user.update({
        where: { id: userId },
        data: { password: await bcrypt.hash(TEST_USER_PASSWORD, 10) },
      });
    });

    it('prevents user from changing another user password', async () => {
      const res = await request(httpServer)
        .patch(`/api/users/${managedUserId}/password`)
        .set('Authorization', `Bearer ${tokens.USER}`)
        .send({
          currentPassword: TEST_USER_PASSWORD,
          newPassword,
        });

      expectForbidden(res);
    });

    test.each<TestRole>(['ADMIN', 'SUPER_ADMIN'])(
      '%s can change another user password',
      async (role) => {
        const res = await request(httpServer)
          .patch(`/api/users/${managedUserId}/password`)
          .set('Authorization', `Bearer ${tokens[role]}`)
          .send({
            currentPassword: TEST_USER_PASSWORD,
            newPassword: newPassword,
          });

        expect(res.status).toBe(200);

        await prisma.user.update({
          where: { id: managedUserId },
          data: { password: await bcrypt.hash(TEST_USER_PASSWORD, 10) },
        });
      },
    );
  });

  describe('DELETE /api/users/:id', () => {
    const createDisposableUser = async () => {
      const unique = `disposable-${Date.now()}`;
      const user = await prisma.user.create({
        data: {
          email: `${unique}@opshub.com`,
          username: unique,
          password: await bcrypt.hash(TEST_USER_PASSWORD, 10),
          role: Role.USER,
          firstName: 'Disposable',
          lastName: 'User',
        },
        select: { id: true },
      });
      return user.id;
    };

    test.each<TestRole>(['ADMIN', 'SUPER_ADMIN'])(
      '%s can delete a user',
      async (role) => {
        const userId = await createDisposableUser();
        const res = await request(httpServer)
          .delete(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${tokens[role]}`);

        expect(res.status).toBe(200);
        const body = parseResponse<UserPayload>(res);
        expect(body.data.id).toBe(userId);
      },
    );

    it('forbids USER from deleting a user', async () => {
      const userId = await createDisposableUser();
      const res = await request(httpServer)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${tokens.USER}`);

      expectForbidden(res);

      await prisma.user.delete({ where: { id: userId } });
    });
  });
});
