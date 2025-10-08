import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: any) {
    return this.prisma.project.create({
      data: createProjectDto,
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.project.findMany({
      include: {
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            files: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        tasks: true,
        files: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, updateProjectDto: any) {
    const project = await this.findOne(id);
    
    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const project = await this.findOne(id);
    
    return this.prisma.project.delete({
      where: { id },
    });
  }
}