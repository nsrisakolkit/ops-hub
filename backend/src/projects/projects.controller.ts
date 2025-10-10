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
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../common/guards';
import {
  CreateProjectDto,
  ProjectMemberDto,
  UpdateProjectDto,
  UpdateProjectMemberDto,
  ProjectQueryDto,
} from './projects.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBody({
    type: CreateProjectDto,
    examples: {
      basic: {
        summary: 'Basic project',
        value: {
          name: 'Marketing Site Refresh',
          description: 'Redesign the marketing site ahead of launch',
          status: 'ACTIVE',
        },
      },
    },
  })
  create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.create({
      ...createProjectDto,
      creatorId: userId,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Get all projects with optional filtering and pagination',
  })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  findAll(@Query() query: ProjectQueryDto) {
    return this.projectsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific project by ID' })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiBody({
    type: UpdateProjectDto,
    examples: {
      statusChange: {
        summary: 'Update description and status',
        value: {
          description: 'Align requirements with new stakeholder feedback',
          status: 'INACTIVE',
        },
      },
      renameProject: {
        summary: 'Rename project and set active',
        value: {
          name: 'Revenue Dashboard Rollout',
          status: 'ACTIVE',
          description: 'Co-ordinate phased launch with finance stakeholders',
        },
      },
    },
  })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: 204, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get all members of a project' })
  @ApiResponse({
    status: 200,
    description: 'Project members retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  getMembers(@Param('id') id: string) {
    return this.projectsService.getProjectMembers(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a member to the project' })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Project or user not found' })
  @ApiResponse({ status: 409, description: 'User is already a member' })
  @ApiBody({
    type: ProjectMemberDto,
    examples: {
      adminMember: {
        summary: 'Add existing user as ADMIN',
        value: {
          userId: 'c1234567-89ab-4cde-f012-3456789abcde',
          role: 'ADMIN',
        },
      },
      inviteMember: {
        summary: 'Invite contributor as MEMBER',
        value: {
          userId: 'c9876543-21ba-4fed-c210-9876543210ff',
          role: 'MEMBER',
        },
      },
    },
  })
  addMember(@Param('id') id: string, @Body() memberDto: ProjectMemberDto) {
    return this.projectsService.addMember(id, memberDto);
  }

  @Patch(':id/members/:userId')
  @ApiOperation({ summary: 'Update a member role in the project' })
  @ApiResponse({ status: 200, description: 'Member role updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or cannot change last owner',
  })
  @ApiResponse({ status: 404, description: 'Project or member not found' })
  @ApiBody({
    type: UpdateProjectMemberDto,
    examples: {
      promoteViewer: {
        summary: 'Change member role',
        value: {
          role: 'VIEWER',
        },
      },
      escalateToAdmin: {
        summary: 'Promote collaborator to admin',
        value: {
          role: 'ADMIN',
        },
      },
    },
  })
  updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateDto: UpdateProjectMemberDto,
  ) {
    return this.projectsService.updateMemberRole(id, userId, updateDto);
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a member from the project' })
  @ApiResponse({ status: 204, description: 'Member removed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot remove the last owner' })
  @ApiResponse({ status: 404, description: 'Project or member not found' })
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.projectsService.removeMember(id, userId);
  }
}
