import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  UserResponseDto,
  PaginatedUsersResponseDto,
  UserProjectMembershipDto,
  UserTaskDto,
} from './users.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

const userSelect = {
  id: true,
  email: true,
  username: true,
  firstName: true,
  lastName: true,
  avatar: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if email already exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check if username already exists
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });

    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: userSelect,
    });
  }

  async findAll(query?: UserQueryDto): Promise<PaginatedUsersResponseDto> {
    const { search, role, isActive, page = 1, limit = 10 } = query || {};

    const where: Prisma.UserWhereInput = {};

    // Filter by active status
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Filter by role
    if (role) {
      where.role = role;
    }

    // Search in email, username, firstName, lastName
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: userSelect,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    // Check if user exists
    const user = await this.findOne(id);

    // Check if email is being updated and already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // Check if username is being updated and already exists
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: { username: updateUserDto.username },
      });

      if (existingUsername) {
        throw new ConflictException('Username already exists');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: userSelect,
    });
  }

  async remove(id: string): Promise<UserResponseDto> {
    await this.findOne(id);
    return this.prisma.user.delete({
      where: { id },
      select: userSelect,
    });
  }

  // Additional helper methods
  async findByEmail(email: string): Promise<UserResponseDto | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: userSelect,
    });
  }

  async findByUsername(username: string): Promise<UserResponseDto | null> {
    return this.prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: userSelect,
    });
  }

  async getUserProjects(userId: string): Promise<UserProjectMembershipDto[]> {
    return this.prisma.projectMember.findMany({
      where: { userId },
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
  }

  async getUserTasks(userId: string): Promise<UserTaskDto[]> {
    return this.prisma.task.findMany({
      where: {
        OR: [{ creatorId: userId }, { assigneeId: userId }],
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
  }

  async updateUserStatus(
    id: string,
    isActive: boolean,
  ): Promise<UserResponseDto> {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: userSelect,
    });
  }

  async updatePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new ConflictException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { id },
      data: { password: hashedNewPassword },
      select: userSelect,
    });
  }
}
