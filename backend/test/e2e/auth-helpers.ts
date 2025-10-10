import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/database/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export type TestRole = 'ADMIN' | 'SUPER_ADMIN' | 'USER';

interface RoleCredential {
  email: string;
  password: string;
  role: Role;
  username: string;
}

interface ResponseEnvelope<T> {
  data: T;
  statusCode: number;
  message: string;
  timestamp: string;
}

const DEFAULT_PASSWORD = 'password123';

const ROLE_CREDENTIALS: Record<TestRole, RoleCredential> = {
  ADMIN: {
    email: 'admin@opshub.com',
    password: DEFAULT_PASSWORD,
    role: Role.ADMIN,
    username: 'admin',
  },
  USER: {
    email: 'john.doe@opshub.com',
    password: DEFAULT_PASSWORD,
    role: Role.USER,
    username: 'johndoe',
  },
  SUPER_ADMIN: {
    email: 'super.admin@opshub.com',
    password: DEFAULT_PASSWORD,
    role: Role.SUPER_ADMIN,
    username: 'superadmin',
  },
};

export const TEST_USER_PASSWORD = DEFAULT_PASSWORD;

export async function ensureTestUsers(app: INestApplication): Promise<void> {
  const prisma = app.get(PrismaService);

  for (const { email, password, role, username } of Object.values(
    ROLE_CREDENTIALS,
  )) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      const hashed = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          email,
          username,
          password: hashed,
          role,
          isActive: true,
          firstName: username,
          lastName: 'E2E',
        },
      });
    }
  }
}

export async function getAccessToken(
  app: INestApplication,
  role: TestRole,
): Promise<string> {
  const credentials = ROLE_CREDENTIALS[role];
  const response = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email: credentials.email, password: credentials.password });

  if (response.status >= 400) {
    throw new Error(
      `Failed to login as ${role}: ${response.status} ${JSON.stringify(response.body)}`,
    );
  }

  const body = response.body as ResponseEnvelope<{
    accessToken: string;
    refreshToken: string;
  }>;

  return body.data.accessToken;
}

export async function getUserId(
  app: INestApplication,
  role: TestRole,
): Promise<string> {
  const prisma = app.get(PrismaService);
  const credentials = ROLE_CREDENTIALS[role];
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
    select: { id: true },
  });

  if (!user) {
    throw new Error(`Test user for role ${role} not found`);
  }

  return user.id;
}
