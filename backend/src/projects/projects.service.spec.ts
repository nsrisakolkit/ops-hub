import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../database';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectQueryDto,
  ProjectMemberDto,
  UpdateProjectMemberDto,
} from './projects.dto';

// Define enum types locally since Prisma client export might not be available
type ProjectStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'COMPLETED';
type ProjectRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

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
  status: 'ACTIVE' as ProjectStatus,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  members: [
    {
      id: '1',
      role: 'OWNER' as ProjectRole,
      joinedAt: new Date('2023-01-01'),
      userId: '1',
      projectId: '1',
      user: {
        id: '1',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      },
    },
  ],
  _count: {
    tasks: 5,
    files: 2,
  },
};

const mockProjects = [
  mockProject,
  {
    id: '2',
    name: 'Another Project',
    description: 'Another project description',
    status: 'INACTIVE' as ProjectStatus,
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
    members: [
      {
        id: '2',
        role: 'OWNER' as ProjectRole,
        joinedAt: new Date('2023-01-02'),
        userId: '1',
        projectId: '2',
        user: {
          id: '1',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
        },
      },
    ],
    _count: {
      tasks: 0,
      files: 1,
    },
  },
];

const mockProjectMember = {
  id: '2',
  role: 'MEMBER' as ProjectRole,
  joinedAt: new Date('2023-01-03'),
  userId: '2',
  projectId: '1',
  user: {
    id: '2',
    username: 'newmember',
    firstName: 'New',
    lastName: 'Member',
    email: 'newmember@example.com',
    avatar: null,
  },
};

const mockDetailedProject = {
  ...mockProject,
  tasks: [
    {
      id: '1',
      title: 'Test Task',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: new Date('2023-12-31'),
      assignee: {
        id: '1',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      },
    },
  ],
  files: [
    {
      id: '1',
      filename: 'test.pdf',
      size: 1024,
      mimetype: 'application/pdf',
      createdAt: new Date('2023-01-01'),
      uploader: {
        id: '1',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      },
    },
  ],
};

// Mock PrismaService
const mockPrismaService = {
  project: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  projectMember: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createProjectDto = {
      name: 'Test Project',
      description: 'Test project description',
      creatorId: '1',
    };

    it('should create a new project successfully', async () => {
      mockPrismaService.project.create.mockResolvedValue(mockProject);

      const result = await service.create(createProjectDto);

      expect(mockPrismaService.project.create).toHaveBeenCalledWith({
        data: {
          name: createProjectDto.name,
          description: createProjectDto.description,
          status: undefined,
          members: {
            create: {
              userId: createProjectDto.creatorId,
              role: 'OWNER',
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockProject);
    });

    it('should create a project with status', async () => {
      const createProjectWithStatus = {
        ...createProjectDto,
        status: 'ACTIVE' as ProjectStatus,
      };
      mockPrismaService.project.create.mockResolvedValue(mockProject);

      await service.create(createProjectWithStatus);

      expect(mockPrismaService.project.create).toHaveBeenCalledWith({
        data: {
          name: createProjectWithStatus.name,
          description: createProjectWithStatus.description,
          status: 'ACTIVE',
          members: {
            create: {
              userId: createProjectWithStatus.creatorId,
              role: 'OWNER',
            },
          },
        },
        include: expect.any(Object),
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated projects without filters', async () => {
      const expectedResult = {
        data: mockProjects,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockPrismaService.project.findMany.mockResolvedValue(mockProjects);
      mockPrismaService.project.count.mockResolvedValue(2);

      const result = await service.findAll();

      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
      expect(mockPrismaService.project.count).toHaveBeenCalledWith({
        where: {},
      });
      expect(result).toEqual(expectedResult);
    });

    it('should return filtered projects by status', async () => {
      const query: ProjectQueryDto = {
        status: 'ACTIVE' as ProjectStatus,
        page: 1,
        limit: 10,
      };

      mockPrismaService.project.findMany.mockResolvedValue([mockProject]);
      mockPrismaService.project.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
      expect(result.data).toEqual([mockProject]);
    });

    it('should return filtered projects by search term', async () => {
      const query: ProjectQueryDto = {
        search: 'test',
        page: 1,
        limit: 10,
      };

      mockPrismaService.project.findMany.mockResolvedValue([mockProject]);
      mockPrismaService.project.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
      expect(result.data).toEqual([mockProject]);
    });

    it('should handle pagination correctly', async () => {
      const query: ProjectQueryDto = {
        page: 2,
        limit: 5,
      };

      mockPrismaService.project.findMany.mockResolvedValue([]);
      mockPrismaService.project.count.mockResolvedValue(10);

      const result = await service.findAll(query);

      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith({
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
      const query: ProjectQueryDto = {
        sortBy: 'name',
        sortOrder: 'ASC',
        page: 1,
        limit: 10,
      };

      mockPrismaService.project.findMany.mockResolvedValue(mockProjects);
      mockPrismaService.project.count.mockResolvedValue(2);

      await service.findAll(query);

      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' },
        include: expect.any(Object),
      });
    });

    it('should handle multiple filters simultaneously', async () => {
      const query: ProjectQueryDto = {
        search: 'test',
        status: 'ACTIVE' as ProjectStatus,
        page: 1,
        limit: 5,
      };

      mockPrismaService.project.findMany.mockResolvedValue([mockProject]);
      mockPrismaService.project.count.mockResolvedValue(1);

      await service.findAll(query);

      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
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
    it('should return a project by id', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(
        mockDetailedProject,
      );

      const result = await service.findOne('1');

      expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockDetailedProject);
    });

    it('should throw NotFoundException if project not found', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(
        new NotFoundException('Project with ID 999 not found'),
      );
    });
  });

  describe('update', () => {
    const updateProjectDto: UpdateProjectDto = {
      name: 'Updated Project',
      description: 'Updated description',
    };

    it('should update a project successfully', async () => {
      const updatedProject = { ...mockProject, ...updateProjectDto };

      mockPrismaService.project.findUnique.mockResolvedValue(
        mockDetailedProject,
      );
      mockPrismaService.project.update.mockResolvedValue(updatedProject);

      const result = await service.update('1', updateProjectDto);

      expect(mockPrismaService.project.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateProjectDto,
        include: expect.any(Object),
      });
      expect(result).toEqual(updatedProject);
    });

    it('should throw NotFoundException if project not found', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.update('999', updateProjectDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a project successfully', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(
        mockDetailedProject,
      );
      mockPrismaService.project.delete.mockResolvedValue(mockProject);

      const result = await service.remove('1');

      expect(mockPrismaService.project.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException if project not found', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addMember', () => {
    const memberDto: ProjectMemberDto = {
      userId: '2',
      role: 'MEMBER' as ProjectRole,
    };

    it('should add a member to project successfully', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(
        mockDetailedProject,
      );
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.projectMember.findUnique.mockResolvedValue(null);
      mockPrismaService.projectMember.create.mockResolvedValue(
        mockProjectMember,
      );

      const result = await service.addMember('1', memberDto);

      expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object),
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '2' },
      });
      expect(mockPrismaService.projectMember.findUnique).toHaveBeenCalledWith({
        where: {
          userId_projectId: {
            userId: '2',
            projectId: '1',
          },
        },
      });
      expect(mockPrismaService.projectMember.create).toHaveBeenCalledWith({
        data: {
          projectId: '1',
          userId: '2',
          role: 'MEMBER',
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockProjectMember);
    });

    it('should add a member with default role', async () => {
      const memberDtoWithoutRole = { userId: '2' };

      mockPrismaService.project.findUnique.mockResolvedValue(
        mockDetailedProject,
      );
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.projectMember.findUnique.mockResolvedValue(null);
      mockPrismaService.projectMember.create.mockResolvedValue(
        mockProjectMember,
      );

      await service.addMember('1', memberDtoWithoutRole);

      expect(mockPrismaService.projectMember.create).toHaveBeenCalledWith({
        data: {
          projectId: '1',
          userId: '2',
          role: 'MEMBER', // Default role
        },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if project not found', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.addMember('999', memberDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(
        mockDetailedProject,
      );
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.addMember('1', memberDto)).rejects.toThrow(
        new NotFoundException('User with ID 2 not found'),
      );
    });

    it('should throw ConflictException if user is already a member', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(
        mockDetailedProject,
      );
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.projectMember.findUnique.mockResolvedValue(
        mockProjectMember,
      );

      await expect(service.addMember('1', memberDto)).rejects.toThrow(
        new ConflictException('User is already a member of this project'),
      );
    });
  });

  describe('updateMemberRole', () => {
    const updateDto: UpdateProjectMemberDto = {
      role: 'ADMIN' as ProjectRole,
    };

    it('should update member role successfully', async () => {
      const existingMember = {
        ...mockProjectMember,
        role: 'MEMBER' as ProjectRole,
      };
      const updatedMember = {
        ...mockProjectMember,
        role: 'ADMIN' as ProjectRole,
      };

      mockPrismaService.project.findUnique.mockResolvedValue(
        mockDetailedProject,
      );
      mockPrismaService.projectMember.findUnique.mockResolvedValue(
        existingMember,
      );
      mockPrismaService.projectMember.update.mockResolvedValue(updatedMember);

      const result = await service.updateMemberRole('1', '2', updateDto);

      expect(mockPrismaService.projectMember.update).toHaveBeenCalledWith({
        where: {
          userId_projectId: {
            userId: '2',
            projectId: '1',
          },
        },
        data: {
          role: 'ADMIN',
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(updatedMember);
    });

    it('should throw NotFoundException if project not found', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(
        service.updateMemberRole('999', '2', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(
        mockDetailedProject,
      );
      mockPrismaService.projectMember.findUnique.mockResolvedValue(null);

      await expect(
        service.updateMemberRole('1', '999', updateDto),
      ).rejects.toThrow(
        new NotFoundException('User is not a member of this project'),
      );
    });

    it('should throw BadRequestException when trying to change last owner role', async () => {
      const ownerMember = {
        ...mockProjectMember,
        role: 'OWNER' as ProjectRole,
      };
      const updateOwnerDto = { role: 'ADMIN' as ProjectRole };

      mockPrismaService.project.findUnique.mockResolvedValue(
        mockDetailedProject,
      );
      mockPrismaService.projectMember.findUnique.mockResolvedValue(ownerMember);
      mockPrismaService.projectMember.count.mockResolvedValue(1); // Only one owner

      await expect(
        service.updateMemberRole('1', '2', updateOwnerDto),
      ).rejects.toThrow(
        new BadRequestException('Cannot change role of the last project owner'),
      );

      expect(mockPrismaService.projectMember.count).toHaveBeenCalledWith({
        where: {
          projectId: '1',
          role: 'OWNER',
        },
      });
    });

    it('should allow changing owner role when there are multiple owners', async () => {
      const ownerMember = {
        ...mockProjectMember,
        role: 'OWNER' as ProjectRole,
      };
      const updateOwnerDto = { role: 'ADMIN' as ProjectRole };
      const updatedMember = {
        ...mockProjectMember,
        role: 'ADMIN' as ProjectRole,
      };

      mockPrismaService.project.findUnique.mockResolvedValue(
        mockDetailedProject,
      );
      mockPrismaService.projectMember.findUnique.mockResolvedValue(ownerMember);
      mockPrismaService.projectMember.count.mockResolvedValue(2); // Multiple owners
      mockPrismaService.projectMember.update.mockResolvedValue(updatedMember);

      const result = await service.updateMemberRole('1', '2', updateOwnerDto);

      expect(result).toEqual(updatedMember);
    });
  });

  describe('removeMember', () => {
    it('should remove member successfully', async () => {
      const memberToRemove = {
        ...mockProjectMember,
        role: 'MEMBER' as ProjectRole,
      };

      mockPrismaService.project.findUnique.mockResolvedValue(
        mockDetailedProject,
      );
      mockPrismaService.projectMember.findUnique.mockResolvedValue(
        memberToRemove,
      );
      mockPrismaService.projectMember.delete.mockResolvedValue(memberToRemove);

      const result = await service.removeMember('1', '2');

      expect(mockPrismaService.projectMember.delete).toHaveBeenCalledWith({
        where: {
          userId_projectId: {
            userId: '2',
            projectId: '1',
          },
        },
      });
      expect(result).toEqual({ message: 'Member removed successfully' });
    });

    it('should throw NotFoundException if project not found', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.removeMember('999', '2')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(
        mockDetailedProject,
      );
      mockPrismaService.projectMember.findUnique.mockResolvedValue(null);

      await expect(service.removeMember('1', '999')).rejects.toThrow(
        new NotFoundException('User is not a member of this project'),
      );
    });

    it('should throw BadRequestException when trying to remove last owner', async () => {
      const ownerMember = {
        ...mockProjectMember,
        role: 'OWNER' as ProjectRole,
      };

      mockPrismaService.project.findUnique.mockResolvedValue(
        mockDetailedProject,
      );
      mockPrismaService.projectMember.findUnique.mockResolvedValue(ownerMember);
      mockPrismaService.projectMember.count.mockResolvedValue(1); // Only one owner

      await expect(service.removeMember('1', '2')).rejects.toThrow(
        new BadRequestException('Cannot remove the last project owner'),
      );

      expect(mockPrismaService.projectMember.count).toHaveBeenCalledWith({
        where: {
          projectId: '1',
          role: 'OWNER',
        },
      });
    });

    it('should allow removing owner when there are multiple owners', async () => {
      const ownerMember = {
        ...mockProjectMember,
        role: 'OWNER' as ProjectRole,
      };

      mockPrismaService.project.findUnique.mockResolvedValue(
        mockDetailedProject,
      );
      mockPrismaService.projectMember.findUnique.mockResolvedValue(ownerMember);
      mockPrismaService.projectMember.count.mockResolvedValue(2); // Multiple owners
      mockPrismaService.projectMember.delete.mockResolvedValue(ownerMember);

      const result = await service.removeMember('1', '2');

      expect(result).toEqual({ message: 'Member removed successfully' });
    });
  });

  describe('getProjectMembers', () => {
    const mockMembers = [
      {
        ...mockProjectMember,
        role: 'OWNER' as ProjectRole,
        user: { ...mockProjectMember.user, isActive: true },
      },
      {
        ...mockProjectMember,
        id: '3',
        role: 'MEMBER' as ProjectRole,
        user: { ...mockProjectMember.user, id: '3', isActive: true },
      },
    ];

    it('should return project members', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(
        mockDetailedProject,
      );
      mockPrismaService.projectMember.findMany.mockResolvedValue(mockMembers);

      const result = await service.getProjectMembers('1');

      expect(mockPrismaService.projectMember.findMany).toHaveBeenCalledWith({
        where: { projectId: '1' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
              isActive: true,
            },
          },
        },
        orderBy: [
          { role: 'asc' }, // OWNER first, then ADMIN, etc.
          { joinedAt: 'asc' },
        ],
      });
      expect(result).toEqual(mockMembers);
    });

    it('should throw NotFoundException if project not found', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.getProjectMembers('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // Test edge cases and error scenarios
  describe('Edge Cases', () => {
    it('should handle empty search query gracefully', async () => {
      const query: ProjectQueryDto = { search: '' };

      mockPrismaService.project.findMany.mockResolvedValue(mockProjects);
      mockPrismaService.project.count.mockResolvedValue(2);

      await service.findAll(query);

      // Empty search should not add OR condition
      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should handle project creation without description', async () => {
      const createProjectWithoutDesc = {
        name: 'Test Project',
        creatorId: '1',
      };

      mockPrismaService.project.create.mockResolvedValue(mockProject);

      await service.create(createProjectWithoutDesc);

      expect(mockPrismaService.project.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Project',
          description: undefined,
          status: undefined,
          members: {
            create: {
              userId: '1',
              role: 'OWNER',
            },
          },
        },
        include: expect.any(Object),
      });
    });
  });
});
