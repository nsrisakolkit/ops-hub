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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto, UpdateUserStatusDto } from './users.dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles, CurrentUser } from '../common/decorators';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get('me')
  getProfile(@CurrentUser('sub') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // Additional user management routes
  @Get(':id/projects')
  getUserProjects(@Param('id') id: string) {
    return this.usersService.getUserProjects(id);
  }

  @Get(':id/tasks')
  getUserTasks(@Param('id') id: string) {
    return this.usersService.getUserTasks(id);
  }

  @Get('me/projects')
  getMyProjects(@CurrentUser('sub') userId: string) {
    return this.usersService.getUserProjects(userId);
  }

  @Get('me/tasks')
  getMyTasks(@CurrentUser('sub') userId: string) {
    return this.usersService.getUserTasks(userId);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'SUPER_ADMIN')
  updateUserStatus(
    @Param('id') id: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto
  ) {
    return this.usersService.updateUserStatus(id, updateUserStatusDto.isActive);
  }

  @Get('email/:email')
  @Roles('ADMIN', 'SUPER_ADMIN')
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get('username/:username')
  findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }
}