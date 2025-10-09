import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './tasks.dto';

interface CreateTaskServiceDto extends CreateTaskDto {
  creatorId: string; // Make it required for service
}

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskServiceDto) {
    // Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: createTaskDto.projectId },
    });

    if (!project) {
      throw new NotFoundException(
        `Project with ID ${createTaskDto.projectId} not found`,
      );
    }

    // Verify assignee exists if provided
    if (createTaskDto.assigneeId) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: createTaskDto.assigneeId },
      });

      if (!assignee) {
        throw new NotFoundException(
          `User with ID ${createTaskDto.assigneeId} not found`,
        );
      }
    }

    return this.prisma.task.create({
      data: createTaskDto,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            files: true,
          },
        },
      },
    });
  }

  async findAll(query?: TaskQueryDto) {
    const {
      search,
      status,
      priority,
      projectId,
      assigneeId,
      creatorId,
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

    // Filter by priority
    if (priority) {
      where.priority = priority;
    }

    // Filter by project
    if (projectId) {
      where.projectId = projectId;
    }

    // Filter by assignee
    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    // Filter by creator
    if (creatorId) {
      where.creatorId = creatorId;
    }

    // Search in title and description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    // Define valid sort fields
    const validSortFields = [
      'createdAt',
      'updatedAt',
      'title',
      'status',
      'priority',
      'dueDate',
    ];
    const orderByField = validSortFields.includes(sortBy)
      ? sortBy
      : 'createdAt';
    const orderByDirection = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderByField]: orderByDirection },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
            },
          },
          creator: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          assignee: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              files: true,
            },
          },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        files: {
          select: {
            id: true,
            originalName: true,
            filename: true,
            mimetype: true,
            size: true,
            createdAt: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    // Check if task exists
    const existingTask = await this.findOne(id);

    // Verify project exists if being updated
    if (
      updateTaskDto.projectId &&
      updateTaskDto.projectId !== existingTask.projectId
    ) {
      const project = await this.prisma.project.findUnique({
        where: { id: updateTaskDto.projectId },
      });

      if (!project) {
        throw new NotFoundException(
          `Project with ID ${updateTaskDto.projectId} not found`,
        );
      }
    }

    // Verify assignee exists if being updated
    if (
      updateTaskDto.assigneeId !== undefined &&
      updateTaskDto.assigneeId !== existingTask.assigneeId
    ) {
      if (updateTaskDto.assigneeId) {
        const assignee = await this.prisma.user.findUnique({
          where: { id: updateTaskDto.assigneeId },
        });

        if (!assignee) {
          throw new NotFoundException(
            `User with ID ${updateTaskDto.assigneeId} not found`,
          );
        }
      }
    }

    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            files: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const task = await this.findOne(id);

    return this.prisma.task.delete({
      where: { id },
    });
  }

  // Additional helper methods
  async getTasksByProject(projectId: string, query?: TaskQueryDto) {
    const updatedQuery = { ...query, projectId };
    return this.findAll(updatedQuery);
  }

  async getTasksByAssignee(assigneeId: string, query?: TaskQueryDto) {
    const updatedQuery = { ...query, assigneeId };
    return this.findAll(updatedQuery);
  }

  async getTasksByCreator(creatorId: string, query?: TaskQueryDto) {
    const updatedQuery = { ...query, creatorId };
    return this.findAll(updatedQuery);
  }

  async updateTaskStatus(id: string, status: any) {
    const task = await this.findOne(id);

    return this.prisma.task.update({
      where: { id },
      data: { status },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
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
    });
  }

  async assignTask(id: string, assigneeId: string | null) {
    const task = await this.findOne(id);

    // Verify assignee exists if provided
    if (assigneeId) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: assigneeId },
      });

      if (!assignee) {
        throw new NotFoundException(`User with ID ${assigneeId} not found`);
      }
    }

    return this.prisma.task.update({
      where: { id },
      data: { assigneeId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
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
    });
  }
}
