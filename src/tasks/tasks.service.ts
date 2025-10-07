import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: any) {
    return this.prisma.task.create({
      data: createTaskDto,
      include: {
        project: true,
        creator: true,
        assignee: true,
      },
    });
  }

  async findAll(filters?: any) {
    return this.prisma.task.findMany({
      where: filters,
      include: {
        project: true,
        creator: true,
        assignee: true,
        files: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        creator: true,
        assignee: true,
        files: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: any) {
    const task = await this.findOne(id);
    
    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
      include: {
        project: true,
        creator: true,
        assignee: true,
        files: true,
      },
    });
  }

  async remove(id: string) {
    const task = await this.findOne(id);
    
    return this.prisma.task.delete({
      where: { id },
    });
  }
}