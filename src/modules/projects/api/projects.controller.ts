import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from '../application/projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { AssignClientDto } from './dto/assign-client.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { UpdateGithubUrlDto } from './dto/update-github-url.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProjectsListResponseDto, ProjectSingleResponseDto } from './dto/response/projects-response.dto';
import { StandardResponseDto } from '../../../shared/dto/api-response.dto';

@ApiTags('Projects')
@ApiBearerAuth('access-token')
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({ status: 200, description: 'Return all projects.', type: ProjectsListResponseDto })
  @Get()
  async findAll(@Query() query: ProjectQueryDto, @CurrentUser() user: any) {
    return this.projectsService.findAll(query, user.userId, user.role);
  }

  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({ status: 200, description: 'Return project by ID.', type: ProjectSingleResponseDto })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findById(id);
  }

  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({
    status: 201,
    description: 'The project has been successfully created.',
    type: ProjectSingleResponseDto
  })
  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async create(@Body() dto: CreateProjectDto, @CurrentUser() user: any) {
    return this.projectsService.create(dto, user.userId);
  }

  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({
    status: 200,
    description: 'The project has been successfully updated.',
    type: ProjectSingleResponseDto
  })
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Update project status' })
  @ApiResponse({ status: 200, description: 'Project status updated.', type: StandardResponseDto })
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ) {
    return this.projectsService.updateStatus(id, status);
  }

  @ApiOperation({ summary: 'Assign a client to the project' })
  @ApiResponse({ status: 200, description: 'Client assigned successfully.', type: StandardResponseDto })
  @Patch(':id/client')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async assignClient(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignClientDto,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.assignClient(id, dto, user.userId);
  }

  @ApiOperation({ summary: 'Get project members' })
  @ApiResponse({ status: 200, description: 'Return project members.', type: StandardResponseDto })
  @Get(':id/members')
  async getMembers(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.getMembers(id);
  }

  @ApiOperation({ summary: 'Add member to project' })
  @ApiResponse({ status: 201, description: 'Member added successfully.', type: StandardResponseDto })
  @Post(':id/members')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.projectsService.addMember(id, dto);
  }

  @ApiOperation({ summary: 'Remove member from project' })
  @ApiResponse({ status: 200, description: 'Member removed successfully.', type: StandardResponseDto })
  @Delete(':id/members/:userId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    await this.projectsService.removeMember(id, userId);
    return { message: 'Member removed successfully' };
  }

  @ApiOperation({ summary: 'Link GitHub repository to project' })
  @ApiResponse({
    status: 200,
    description: 'GitHub repository linked successfully.',
    type: StandardResponseDto,
  })
  @Patch(':id/github')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async updateGithubRepository(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGithubUrlDto,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.updateGithubRepository(
      id,
      dto.githubUrl,
      user.userId,
    );
  }

  @ApiOperation({ summary: 'Get project GitHub repository overview and branches' })
  @ApiResponse({
    status: 200,
    description: 'GitHub overview and branches',
    type: StandardResponseDto,
  })
  @Get(':id/github')
  async getGithubOverview(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.getGithubOverview(id);
  }

  @ApiOperation({ summary: 'Get project GitHub commits by branch' })
  @ApiResponse({
    status: 200,
    description: 'GitHub commits by branch',
    type: StandardResponseDto,
  })
  @Get(':id/github/commits')
  async getGithubCommits(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('branch') branch?: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    return this.projectsService.getGithubCommits(
      id,
      branch,
      page ? Number(page) : 1,
      perPage ? Number(perPage) : 20,
    );
  }
}
