import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../database';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './users.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock data
const mockUser = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  avatar: null,
  role: Role.USER,
  isActive: true,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

const mockUsers = [
  mockUser,
  {
    id: '2',
    email: 'admin@example.com',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    avatar: null,
    role: Role.ADMIN,
    isActive: true,
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  },
];

const mockProject = {
  id: '1',
  name: 'Test Project',
  description: 'Test project description',
  status: 'ACTIVE',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  _count: {
    tasks: 5,
    members: 3,
  },
};

const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'Test task description',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: null,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  project: {
    id: '1',
    name: 'Test Project',
  },
  assignee: {
    id: '1',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
  },
};

const mockProjectMembership = {
  id: '1',
  role: 'MEMBER',
  joinedAt: new Date('2023-01-01'),
  projectId: '1',
  userId: '1',
  project: mockProject,
};

// Mock PrismaService
const mockPrismaService = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  projectMember: {
    findMany: jest.fn(),
  },
  task: {
    findMany: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup bcrypt mocks
    mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
    mockedBcrypt.compare.mockResolvedValue(true as never);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should create a new user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: createUserDto.username },
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          password: 'hashedPassword',
        },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('Email already exists'),
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if username already exists', async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce(mockUser); // username check

      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('Username already exists'),
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(2);
      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated users without filters', async () => {
      const expectedResult = {
        data: mockUsers,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(2);

      const result = await service.findAll();

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object),
      });
      expect(mockPrismaService.user.count).toHaveBeenCalledWith({
        where: {},
      });
      expect(result).toEqual(expectedResult);
    });

    it('should return filtered users by search term', async () => {
      const query: UserQueryDto = {
        search: 'test',
        page: 1,
        limit: 10,
      };

      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);
      mockPrismaService.user.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: { contains: 'test', mode: 'insensitive' } },
            { username: { contains: 'test', mode: 'insensitive' } },
            { firstName: { contains: 'test', mode: 'insensitive' } },
            { lastName: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object),
      });
      expect(result.data).toEqual([mockUser]);
    });

    it('should return filtered users by role', async () => {
      const query: UserQueryDto = {
        role: Role.ADMIN,
        page: 1,
        limit: 10,
      };

      mockPrismaService.user.findMany.mockResolvedValue([mockUsers[1]]);
      mockPrismaService.user.count.mockResolvedValue(1);

      await service.findAll(query);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { role: Role.ADMIN },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object),
      });
    });

    it('should return filtered users by active status', async () => {
      const query: UserQueryDto = {
        isActive: false,
        page: 1,
        limit: 10,
      };

      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { isActive: false },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object),
      });
    });

    it('should handle pagination correctly', async () => {
      const query: UserQueryDto = {
        page: 2,
        limit: 5,
      };

      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(10);

      const result = await service.findAll(query);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 5, // (page - 1) * limit = (2 - 1) * 5 = 5
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object),
      });
      expect(result.meta).toEqual({
        total: 10,
        page: 2,
        limit: 5,
        totalPages: 2,
      });
    });

    it('should handle empty search query gracefully', async () => {
      const query: UserQueryDto = { search: '', page: 1, limit: 10 };

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(2);

      await service.findAll(query);

      // Empty search should not add OR condition
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object),
      });
    });

    it('should handle multiple filters simultaneously', async () => {
      const query: UserQueryDto = {
        search: 'admin',
        role: Role.ADMIN,
        isActive: true,
        page: 1,
        limit: 5,
      };

      mockPrismaService.user.findMany.mockResolvedValue([mockUsers[1]]);
      mockPrismaService.user.count.mockResolvedValue(1);

      await service.findAll(query);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          role: Role.ADMIN,
          OR: [
            { email: { contains: 'admin', mode: 'insensitive' } },
            { username: { contains: 'admin', mode: 'insensitive' } },
            { firstName: { contains: 'admin', mode: 'insensitive' } },
            { lastName: { contains: 'admin', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object),
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      firstName: 'Updated',
      lastName: 'User',
    };

    it('should update a user successfully', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('1', updateUserDto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateUserDto,
        select: expect.any(Object),
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update('999', updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if email is being updated and already exists', async () => {
      const updateDto = { email: 'existing@example.com' };
      const existingUserWithEmail = { ...mockUser, id: '2' };

      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockUser) // findOne call
        .mockResolvedValueOnce(existingUserWithEmail); // email check

      await expect(service.update('1', updateDto)).rejects.toThrow(
        new ConflictException('Email already exists'),
      );
    });

    it('should throw ConflictException if username is being updated and already exists', async () => {
      const updateDto = { username: 'existinguser' };
      const existingUserWithUsername = {
        ...mockUser,
        id: '2',
        username: 'existinguser',
      };

      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockUser) // findOne call
        .mockResolvedValueOnce(existingUserWithUsername); // username check

      await expect(service.update('1', updateDto)).rejects.toThrow(
        new ConflictException('Username already exists'),
      );
    });

    it('should allow updating email to the same value', async () => {
      const updateDto = { email: mockUser.email };
      const updatedUser = { ...mockUser, ...updateDto };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(updatedUser);
      // Should not check for email conflict since it's the same
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should allow updating username to the same value', async () => {
      const updateDto = { username: mockUser.username };
      const updatedUser = { ...mockUser, ...updateDto };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(updatedUser);
      // Should not check for username conflict since it's the same
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove('1');

      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('TEST@EXAMPLE.COM');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByUsername('TESTUSER');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getUserProjects', () => {
    it('should return user projects with member details', async () => {
      const mockProjectMembers = [mockProjectMembership];

      mockPrismaService.projectMember.findMany.mockResolvedValue(
        mockProjectMembers,
      );

      const result = await service.getUserProjects('1');

      expect(mockPrismaService.projectMember.findMany).toHaveBeenCalledWith({
        where: { userId: '1' },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              _count: {
                select: {
                  tasks: true,
                  members: true,
                },
              },
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
      });
      expect(result).toEqual(mockProjectMembers);
    });
  });

  describe('getUserTasks', () => {
    it('should return tasks created by or assigned to the user', async () => {
      const mockTasks = [mockTask];

      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);

      const result = await service.getUserTasks('1');

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ creatorId: '1' }, { assigneeId: '1' }],
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          assignee: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockTasks);
    });
  });

  describe('updateUserStatus', () => {
    it('should update user active status', async () => {
      const updatedUser = { ...mockUser, isActive: false };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateUserStatus('1', false);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isActive: false },
        select: expect.any(Object),
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.updateUserStatus('999', false)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePassword', () => {
    const mockUserWithPassword = {
      ...mockUser,
      password: 'hashedCurrentPassword',
    };

    it('should update password successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUserWithPassword);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedBcrypt.hash.mockResolvedValue('hashedNewPassword' as never);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.updatePassword('1', 'currentPassword', 'newPassword');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'currentPassword',
        'hashedCurrentPassword',
      );
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { password: 'hashedNewPassword' },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePassword('999', 'currentPassword', 'newPassword'),
      ).rejects.toThrow(new NotFoundException('User with ID 999 not found'));
    });

    it('should throw ConflictException if current password is incorrect', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUserWithPassword);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        service.updatePassword('1', 'wrongPassword', 'newPassword'),
      ).rejects.toThrow(new ConflictException('Current password is incorrect'));

      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });
});
