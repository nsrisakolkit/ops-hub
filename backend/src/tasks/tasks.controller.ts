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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './tasks.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Project or assignee not found' })
  create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.tasksService.create({ ...createTaskDto, creatorId: userId });
  }

  @Get()
  @ApiOperation({
    summary: 'Get all tasks with optional filtering and pagination',
  })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  findAll(@Query() query: TaskQueryDto) {
    return this.tasksService.findAll(query);
  }

  @Get('my-tasks')
  @ApiOperation({ summary: 'Get tasks assigned to the current user' })
  @ApiResponse({
    status: 200,
    description: 'User tasks retrieved successfully',
  })
  getMyTasks(@CurrentUser('sub') userId: string, @Query() query: TaskQueryDto) {
    return this.tasksService.getTasksByAssignee(userId, query);
  }

  @Get('created-by-me')
  @ApiOperation({ summary: 'Get tasks created by the current user' })
  @ApiResponse({
    status: 200,
    description: 'Created tasks retrieved successfully',
  })
  getCreatedByMe(
    @CurrentUser('sub') userId: string,
    @Query() query: TaskQueryDto,
  ) {
    return this.tasksService.getTasksByCreator(userId, query);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all tasks for a specific project' })
  @ApiResponse({
    status: 200,
    description: 'Project tasks retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  getProjectTasks(
    @Param('projectId') projectId: string,
    @Query() query: TaskQueryDto,
  ) {
    return this.tasksService.getTasksByProject(projectId, query);
  }

  @Get('assignee/:assigneeId')
  @ApiOperation({ summary: 'Get all tasks assigned to a specific user' })
  @ApiResponse({
    status: 200,
    description: 'Assignee tasks retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  getAssigneeTasks(
    @Param('assigneeId') assigneeId: string,
    @Query() query: TaskQueryDto,
  ) {
    return this.tasksService.getTasksByAssignee(assigneeId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific task by ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  @ApiResponse({ status: 200, description: 'Task status updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.tasksService.updateTaskStatus(id, status);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign or unassign task to/from user' })
  @ApiResponse({
    status: 200,
    description: 'Task assignment updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Task or user not found' })
  assignTask(
    @Param('id') id: string,
    @Body('assigneeId') assigneeId: string | null,
  ) {
    return this.tasksService.assignTask(id, assigneeId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
