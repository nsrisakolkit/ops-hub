import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ForbiddenException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  UpdateUserStatusDto,
  UpdatePasswordDto,
  UserResponseDto,
  PaginatedUsersResponseDto,
  UserProjectMembershipDto,
  UserTaskDto,
} from './users.dto';
import { JwtAuthGuard, RolesGuard, JwtPayload } from '../common/guards';
import { Roles, CurrentUser } from '../common/decorators';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

import * as Guards from '../common/guards';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      default: {
        summary: 'Create a standard user',
        value: {
          email: 'alex.morgan@opshub.com',
          username: 'alexmorgan',
          password: 'StrongPassw0rd!',
          firstName: 'Alex',
          lastName: 'Morgan',
          role: 'USER',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: UserResponseDto,
    description: 'User created successfully',
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiConflictResponse({ description: 'Email or username already exists' })
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Retrieve a paginated list of users' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by role' })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Page size for pagination',
  })
  @ApiOkResponse({
    type: PaginatedUsersResponseDto,
    description: 'Paginated collection of users',
  })
  findAll(@Query() query: UserQueryDto): Promise<PaginatedUsersResponseDto> {
    return this.usersService.findAll(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Retrieve the current authenticated user profile' })
  @ApiOkResponse({ type: UserResponseDto })
  getProfile(@CurrentUser('sub') userId: string): Promise<UserResponseDto> {
    return this.usersService.findOne(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a user by ID' })
  @ApiParam({ name: 'id', description: 'User identifier' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing user' })
  @ApiParam({ name: 'id', description: 'User identifier' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiConflictResponse({ description: 'Email or username already exists' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User identifier' })
  @ApiOkResponse({ type: UserResponseDto, description: 'Deleted user record' })
  @ApiNotFoundResponse({ description: 'User not found' })
  remove(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.remove(id);
  }

  // Additional user management routes
  @Get(':id/projects')
  @ApiOperation({ summary: 'List projects a user belongs to' })
  @ApiParam({ name: 'id', description: 'User identifier' })
  @ApiOkResponse({ type: UserProjectMembershipDto, isArray: true })
  getUserProjects(
    @Param('id') id: string,
  ): Promise<UserProjectMembershipDto[]> {
    return this.usersService.getUserProjects(id);
  }

  @Get(':id/tasks')
  @ApiOperation({ summary: 'List tasks created by or assigned to a user' })
  @ApiParam({ name: 'id', description: 'User identifier' })
  @ApiOkResponse({ type: UserTaskDto, isArray: true })
  getUserTasks(@Param('id') id: string): Promise<UserTaskDto[]> {
    return this.usersService.getUserTasks(id);
  }

  @Get('me/projects')
  @ApiOperation({ summary: 'List projects for the current user' })
  @ApiOkResponse({ type: UserProjectMembershipDto, isArray: true })
  getMyProjects(
    @CurrentUser('sub') userId: string,
  ): Promise<UserProjectMembershipDto[]> {
    return this.usersService.getUserProjects(userId);
  }

  @Get('me/tasks')
  @ApiOperation({ summary: 'List tasks for the current user' })
  @ApiOkResponse({ type: UserTaskDto, isArray: true })
  getMyTasks(@CurrentUser('sub') userId: string): Promise<UserTaskDto[]> {
    return this.usersService.getUserTasks(userId);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Activate or deactivate a user' })
  @ApiParam({ name: 'id', description: 'User identifier' })
  @ApiBody({ type: UpdateUserStatusDto })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  updateUserStatus(
    @Param('id') id: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUserStatus(id, updateUserStatusDto.isActive);
  }

  @Get('email/:email')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Find a user by email address' })
  @ApiParam({ name: 'email', description: 'Email address to search for' })
  @ApiOkResponse({ type: UserResponseDto, description: 'Matching user' })
  findByEmail(@Param('email') email: string): Promise<UserResponseDto | null> {
    return this.usersService.findByEmail(email);
  }

  @Get('username/:username')
  @ApiOperation({ summary: 'Find a user by username' })
  @ApiParam({ name: 'username', description: 'Username to search for' })
  @ApiOkResponse({ type: UserResponseDto, description: 'Matching user' })
  findByUsername(
    @Param('username') username: string,
  ): Promise<UserResponseDto | null> {
    return this.usersService.findByUsername(username);
  }

  @Patch(':id/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a user password' })
  @ApiParam({ name: 'id', description: 'User identifier' })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiOkResponse({
    description: 'Password updated successfully',
    type: UserResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Attempted to update another user without sufficient role',
  })
  @ApiNotFoundResponse({ description: 'User not found or password invalid' })
  updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @CurrentUser() currentUser: Guards.JwtPayload,
  ): Promise<UserResponseDto> {
    // Users can only update their own password, unless they're an admin
    if (
      currentUser.sub !== id &&
      !['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)
    ) {
      throw new ForbiddenException('You can only update your own password');
    }

    return this.usersService.updatePassword(
      id,
      updatePasswordDto.currentPassword,
      updatePasswordDto.newPassword,
    );
  }
}
