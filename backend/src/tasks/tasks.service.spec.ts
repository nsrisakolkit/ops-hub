import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../database';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './tasks.dto';

// Define enum types locally since Prisma client export might not be available
type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Mock data
const mockUser = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  avatar: null,
  role: 'USER',
  isActive: true,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

const mockProject = {
  id: '1',
  name: 'Test Project',
  description: 'Test project description',
  status: 'ACTIVE',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'Test task description',
  status: 'TODO' as TaskStatus,
  priority: 'MEDIUM' as Priority,
  projectId: '1',
  creatorId: '1',
  assigneeId: '2',
  dueDate: new Date('2023-12-31'),
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  project: {
    id: '1',
    name: 'Test Project',
    description: 'Test project description',
    status: 'ACTIVE',
  },
  creator: {
    id: '1',
    username: 'creator',
    firstName: 'Creator',
    lastName: 'User',
    avatar: null,
  },
  assignee: {
    id: '2',
    username: 'assignee',
    firstName: 'Assignee',
    lastName: 'User',
    avatar: null,
  },
  _count: {
    files: 0,
  },
};

const mockTasks = [
  mockTask,
  {
    id: '2',
    title: 'Another Task',
    description: 'Another task description',
    status: 'IN_PROGRESS' as TaskStatus,
    priority: 'HIGH' as Priority,
    projectId: '1',
    creatorId: '1',
    assigneeId: null,
    dueDate: null,
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
    project: {
      id: '1',
      name: 'Test Project',
      description: 'Test project description',
      status: 'ACTIVE',
    },
    creator: {
      id: '1',
      username: 'creator',
      firstName: 'Creator',
      lastName: 'User',
      avatar: null,
    },
    assignee: null,
    _count: {
      files: 2,
    },
  },
];

// Mock PrismaService
const mockPrismaService = {
  task: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  project: {
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
};

describe('TasksService', () => {
  let service: TasksService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createTaskDto = {
      title: 'Test Task',
      description: 'Test task description',
      projectId: '1',
      assigneeId: '2',
      creatorId: '1',
    };

    it('should create a new task successfully', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.task.create.mockResolvedValue(mockTask);

      const result = await service.create(createTaskDto);

      expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: createTaskDto.projectId },
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: createTaskDto.assigneeId },
      });
      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data: createTaskDto,
        include: expect.any(Object),
      });
      expect(result).toEqual(mockTask);
    });

    it('should create a task without assignee', async () => {
      const taskWithoutAssignee = { ...createTaskDto, assigneeId: undefined };
      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.task.create.mockResolvedValue(mockTask);

      await service.create(taskWithoutAssignee);

      expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: createTaskDto.projectId },
      });
      expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
      expect(mockPrismaService.task.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if project does not exist', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.create(createTaskDto)).rejects.toThrow(
        new NotFoundException(`Project with ID ${createTaskDto.projectId} not found`),
      );

      expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: createTaskDto.projectId },
      });
    });

    it('should throw NotFoundException if assignee does not exist', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.create(createTaskDto)).rejects.toThrow(
        new NotFoundException(`User with ID ${createTaskDto.assigneeId} not found`),
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: createTaskDto.assigneeId },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks without filters', async () => {
      const expectedResult = {
        data: mockTasks,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaService.task.count.mockResolvedValue(2);

      const result = await service.findAll();

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
      expect(mockPrismaService.task.count).toHaveBeenCalledWith({
        where: {},
      });
      expect(result).toEqual(expectedResult);
    });

    it('should return filtered tasks by status', async () => {
      const query: TaskQueryDto = {
        status: 'TODO' as TaskStatus,
        page: 1,
        limit: 10,
      };

      mockPrismaService.task.findMany.mockResolvedValue([mockTask]);
      mockPrismaService.task.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: { status: 'TODO' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
      expect(result.data).toEqual([mockTask]);
    });

    it('should return filtered tasks by priority', async () => {
      const query: TaskQueryDto = {
        priority: 'HIGH' as Priority,
        page: 1,
        limit: 10,
      };

      mockPrismaService.task.findMany.mockResolvedValue([mockTasks[1]]);
      mockPrismaService.task.count.mockResolvedValue(1);

      await service.findAll(query);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: { priority: 'HIGH' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should return filtered tasks by project', async () => {
      const query: TaskQueryDto = {
        projectId: '1',
        page: 1,
        limit: 10,
      };

      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaService.task.count.mockResolvedValue(2);

      await service.findAll(query);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: { projectId: '1' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should return filtered tasks by assignee', async () => {
      const query: TaskQueryDto = {
        assigneeId: '2',
        page: 1,
        limit: 10,
      };

      mockPrismaService.task.findMany.mockResolvedValue([mockTask]);
      mockPrismaService.task.count.mockResolvedValue(1);

      await service.findAll(query);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: { assigneeId: '2' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should return filtered tasks by search term', async () => {
      const query: TaskQueryDto = {
        search: 'test',
        page: 1,
        limit: 10,
      };

      mockPrismaService.task.findMany.mockResolvedValue([mockTask]);
      mockPrismaService.task.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
      expect(result.data).toEqual([mockTask]);
    });

    it('should handle pagination correctly', async () => {
      const query: TaskQueryDto = {
        page: 2,
        limit: 5,
      };

      mockPrismaService.task.findMany.mockResolvedValue([]);
      mockPrismaService.task.count.mockResolvedValue(10);

      const result = await service.findAll(query);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 5, // (page - 1) * limit = (2 - 1) * 5 = 5
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
      expect(result.meta).toEqual({
        total: 10,
        page: 2,
        limit: 5,
        totalPages: 2,
      });
    });

    it('should handle custom sorting', async () => {
      const query: TaskQueryDto = {
        sortBy: 'title',
        sortOrder: 'ASC',
        page: 1,
        limit: 10,
      };

      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaService.task.count.mockResolvedValue(2);

      await service.findAll(query);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { title: 'asc' },
        include: expect.any(Object),
      });
    });

    it('should use default sorting for invalid sort field', async () => {
      const query: TaskQueryDto = {
        sortBy: 'invalidField',
        sortOrder: 'ASC',
        page: 1,
        limit: 10,
      };

      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaService.task.count.mockResolvedValue(2);

      await service.findAll(query);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'asc' }, // Falls back to createdAt
        include: expect.any(Object),
      });
    });

    it('should handle multiple filters simultaneously', async () => {
      const query: TaskQueryDto = {
        search: 'test',
        status: 'TODO' as TaskStatus,
        priority: 'HIGH' as Priority,
        projectId: '1',
        assigneeId: '2',
        page: 1,
        limit: 5,
      };

      mockPrismaService.task.findMany.mockResolvedValue([mockTask]);
      mockPrismaService.task.count.mockResolvedValue(1);

      await service.findAll(query);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: {
          status: 'TODO',
          priority: 'HIGH',
          projectId: '1',
          assigneeId: '2',
          OR: [
            { title: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);

      const result = await service.findOne('1');

      expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(
        new NotFoundException('Task with ID 999 not found'),
      );
    });
  });

  describe('update', () => {
    const updateTaskDto: UpdateTaskDto = {
      title: 'Updated Task',
      description: 'Updated description',
    };

    it('should update a task successfully', async () => {
      const updatedTask = { ...mockTask, ...updateTaskDto };
      
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.task.update.mockResolvedValue(updatedTask);

      const result = await service.update('1', updateTaskDto);

      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateTaskDto,
        include: expect.any(Object),
      });
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.update('999', updateTaskDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should validate project when updating projectId', async () => {
      const updateDto = { ...updateTaskDto, projectId: '2' };
      
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.update('1', updateDto)).rejects.toThrow(
        new NotFoundException('Project with ID 2 not found'),
      );

      expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: '2' },
      });
    });

    it('should validate assignee when updating assigneeId', async () => {
      const updateDto = { ...updateTaskDto, assigneeId: '3' };
      
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update('1', updateDto)).rejects.toThrow(
        new NotFoundException('User with ID 3 not found'),
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '3' },
      });
    });

    it('should allow unsetting assignee', async () => {
      const updateDto = { ...updateTaskDto, assigneeId: undefined };
      const updatedTask = { ...mockTask, assigneeId: null };
      
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.task.update.mockResolvedValue(updatedTask);

      const result = await service.update('1', updateDto);

      expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
      expect(result).toEqual(updatedTask);
    });
  });

  describe('remove', () => {
    it('should delete a task successfully', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.task.delete.mockResolvedValue(mockTask);

      const result = await service.remove('1');

      expect(mockPrismaService.task.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTasksByProject', () => {
    it('should return tasks filtered by project', async () => {
      const query: TaskQueryDto = { page: 1, limit: 10 };
      const expectedResult = {
        data: mockTasks,
        meta: { total: 2, page: 1, limit: 10, totalPages: 1 },
      };

      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaService.task.count.mockResolvedValue(2);

      const result = await service.getTasksByProject('1', query);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: { projectId: '1' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getTasksByAssignee', () => {
    it('should return tasks filtered by assignee', async () => {
      const query: TaskQueryDto = { page: 1, limit: 10 };
      
      mockPrismaService.task.findMany.mockResolvedValue([mockTask]);
      mockPrismaService.task.count.mockResolvedValue(1);

      await service.getTasksByAssignee('2', query);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: { assigneeId: '2' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });
  });

  describe('getTasksByCreator', () => {
    it('should return tasks filtered by creator', async () => {
      const query: TaskQueryDto = { page: 1, limit: 10 };
      
      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaService.task.count.mockResolvedValue(2);

      await service.getTasksByCreator('1', query);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: { creatorId: '1' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status', async () => {
      const updatedTask = { ...mockTask, status: 'DONE' as TaskStatus };

      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.task.update.mockResolvedValue(updatedTask);

      const result = await service.updateTaskStatus('1', 'DONE');

      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'DONE' },
        include: expect.any(Object),
      });
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.updateTaskStatus('999', 'DONE')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('assignTask', () => {
    it('should assign task to user', async () => {
      const updatedTask = { ...mockTask, assigneeId: '3' };

      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.task.update.mockResolvedValue(updatedTask);

      const result = await service.assignTask('1', '3');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '3' },
      });
      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { assigneeId: '3' },
        include: expect.any(Object),
      });
      expect(result).toEqual(updatedTask);
    });

    it('should unassign task when assigneeId is null', async () => {
      const updatedTask = { ...mockTask, assigneeId: null };

      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.task.update.mockResolvedValue(updatedTask);

      const result = await service.assignTask('1', null);

      expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { assigneeId: null },
        include: expect.any(Object),
      });
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException if assignee not found', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.assignTask('1', '999')).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });

    it('should throw NotFoundException if task not found', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.assignTask('999', '1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // Test edge cases and error scenarios
  describe('Edge Cases', () => {
    it('should handle empty search query gracefully', async () => {
      const query: TaskQueryDto = { search: '' };

      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaService.task.count.mockResolvedValue(2);

      await service.findAll(query);

      // Empty search should not add OR condition
      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should handle updating to same project gracefully', async () => {
      const updateDto = { title: 'Updated', projectId: '1' }; // Same project
      const updatedTask = { ...mockTask, ...updateDto };
      
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.task.update.mockResolvedValue(updatedTask);

      const result = await service.update('1', updateDto);

      // Should not validate project since it's the same
      expect(mockPrismaService.project.findUnique).not.toHaveBeenCalled();
      expect(result).toEqual(updatedTask);
    });

    it('should handle updating to same assignee gracefully', async () => {
      const updateDto = { title: 'Updated', assigneeId: '2' }; // Same assignee
      const updatedTask = { ...mockTask, ...updateDto };
      
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.task.update.mockResolvedValue(updatedTask);

      const result = await service.update('1', updateDto);

      // Should not validate assignee since it's the same
      expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
      expect(result).toEqual(updatedTask);
    });
  });
});