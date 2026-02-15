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
import { ProjectQueryDto } from './dto/project-query.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Get()
    async findAll(@Query() query: ProjectQueryDto, @CurrentUser() user: any) {
        return this.projectsService.findAll(query, user.userId, user.role);
    }

    @Get(':id')
    async findById(@Param('id', ParseUUIDPipe) id: string) {
        return this.projectsService.findById(id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'MANAGER')
    async create(@Body() dto: CreateProjectDto, @CurrentUser() user: any) {
        return this.projectsService.create(dto, user.userId);
    }

    @Put(':id')
    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'MANAGER')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateProjectDto,
    ) {
        return this.projectsService.update(id, dto);
    }

    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'MANAGER')
    async updateStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('status') status: string,
    ) {
        return this.projectsService.updateStatus(id, status);
    }

    @Get(':id/members')
    async getMembers(@Param('id', ParseUUIDPipe) id: string) {
        return this.projectsService.getMembers(id);
    }

    @Post(':id/members')
    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'MANAGER')
    async addMember(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: AddMemberDto,
    ) {
        return this.projectsService.addMember(id, dto);
    }

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
}
