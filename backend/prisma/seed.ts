import { PrismaClient, Role, ProjectRole, TaskStatus, Priority } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Reset existing data to keep seeds idempotent
  await prisma.file.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.webhook.deleteMany();

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@opshub.com' },
    update: {},
    create: {
      email: 'admin@opshub.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
    },
  });

  // Create regular users
  const user1 = await prisma.user.upsert({
    where: { email: 'john.doe@opshub.com' },
    update: {},
    create: {
      email: 'john.doe@opshub.com',
      username: 'johndoe',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: Role.USER,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane.smith@opshub.com' },
    update: {},
    create: {
      email: 'jane.smith@opshub.com',
      username: 'janesmith',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: Role.USER,
    },
  });

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete redesign of the company website',
      members: {
        create: [
          {
            userId: adminUser.id,
            role: ProjectRole.OWNER,
          },
          {
            userId: user1.id,
            role: ProjectRole.ADMIN,
          },
          {
            userId: user2.id,
            role: ProjectRole.MEMBER,
          },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'Development of the mobile application',
      members: {
        create: [
          {
            userId: user1.id,
            role: ProjectRole.OWNER,
          },
          {
            userId: user2.id,
            role: ProjectRole.MEMBER,
          },
        ],
      },
    },
  });

  // Create tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Design Homepage',
        description: 'Create wireframes and mockups for the homepage',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        projectId: project1.id,
        creatorId: adminUser.id,
        assigneeId: user2.id,
        dueDate: new Date('2025-11-15'),
      },
      {
        title: 'Setup Development Environment',
        description: 'Configure development environment for the project',
        status: TaskStatus.DONE,
        priority: Priority.MEDIUM,
        projectId: project1.id,
        creatorId: adminUser.id,
        assigneeId: user1.id,
      },
      {
        title: 'API Integration',
        description: 'Integrate with third-party APIs',
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        projectId: project2.id,
        creatorId: user1.id,
        assigneeId: user2.id,
        dueDate: new Date('2025-12-01'),
      },
    ],
  });

  // Create webhooks
  await prisma.webhook.create({
    data: {
      name: 'GitHub Integration',
      url: 'https://api.github.com/webhook',
      events: ['push', 'pull_request', 'issues'],
      creatorId: adminUser.id,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
