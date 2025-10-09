import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database';
import { CreateProjectDto, UpdateProjectDto, ProjectQueryDto, ProjectMemberDto, UpdateProjectMemberDto } from './projects.dto';

// Define enum types locally since Prisma client export might not be available
type ProjectRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

interface CreateProjectServiceDto extends CreateProjectDto {
  creatorId: string; // Make it required for service
}

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectServiceDto) {
    const project = await this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        description: createProjectDto.description,
        status: createProjectDto.status,
        // Automatically add the creator as project owner
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

    return project;
  }

  async findAll(query?: ProjectQueryDto) {
    const {
      status,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query || {};

    const where: any = {};

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Search in name and description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder.toLowerCase() },
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
          _count: {
            select: {
              tasks: true,
              files: true,
            },
          },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data: projects,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
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
                avatar: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
            assignee: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        files: {
          select: {
            id: true,
            filename: true,
            size: true,
            mimetype: true,
            createdAt: true,
            uploader: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    // Check if project exists
    await this.findOne(id);
    
    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
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
  }

  async remove(id: string) {
    // Check if project exists
    await this.findOne(id);
    
    return this.prisma.project.delete({
      where: { id },
    });
  }

  async addMember(projectId: string, memberDto: ProjectMemberDto) {
    // Check if project exists
    await this.findOne(projectId);

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: memberDto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${memberDto.userId} not found`);
    }

    // Check if user is already a member
    const existingMember = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: memberDto.userId,
          projectId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException(`User is already a member of this project`);
    }

    // Add member to project
    const projectMember = await this.prisma.projectMember.create({
      data: {
        projectId,
        userId: memberDto.userId,
        role: memberDto.role || 'MEMBER',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return projectMember;
  }

  async updateMemberRole(projectId: string, userId: string, updateDto: UpdateProjectMemberDto) {
    // Check if project exists
    await this.findOne(projectId);

    // Check if member exists in project
    const existingMember = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
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
    });

    if (!existingMember) {
      throw new NotFoundException(`User is not a member of this project`);
    }

    // Prevent changing the last owner's role
    if (existingMember.role === 'OWNER' && updateDto.role !== 'OWNER') {
      const ownerCount = await this.prisma.projectMember.count({
        where: {
          projectId,
          role: 'OWNER',
        },
      });

      if (ownerCount === 1) {
        throw new BadRequestException(`Cannot change role of the last project owner`);
      }
    }

    // Update member role
    const updatedMember = await this.prisma.projectMember.update({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
      data: {
        role: updateDto.role,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return updatedMember;
  }

  async removeMember(projectId: string, userId: string) {
    // Check if project exists
    await this.findOne(projectId);

    // Check if member exists in project
    const existingMember = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (!existingMember) {
      throw new NotFoundException(`User is not a member of this project`);
    }

    // Prevent removing the last owner
    if (existingMember.role === 'OWNER') {
      const ownerCount = await this.prisma.projectMember.count({
        where: {
          projectId,
          role: 'OWNER',
        },
      });

      if (ownerCount === 1) {
        throw new BadRequestException(`Cannot remove the last project owner`);
      }
    }

    // Remove member from project
    await this.prisma.projectMember.delete({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    return { message: 'Member removed successfully' };
  }

  async getProjectMembers(projectId: string) {
    // Check if project exists
    await this.findOne(projectId);

    return this.prisma.projectMember.findMany({
      where: { projectId },
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
  }
}