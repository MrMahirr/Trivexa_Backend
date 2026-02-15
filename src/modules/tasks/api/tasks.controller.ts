import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { TasksService } from '../application/tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Get('projects/:projectId/tasks')
    async findByProject(
        @Param('projectId', ParseUUIDPipe) projectId: string,
        @Query('status') status?: string,
        @Query('priority') priority?: string,
        @Query('assigneeId') assigneeId?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.tasksService.findByProject(projectId, { status, priority, assigneeId, page, limit });
    }

    @Post('projects/:projectId/tasks')
    async create(
        @Param('projectId', ParseUUIDPipe) projectId: string,
        @Body() dto: CreateTaskDto,
        @CurrentUser() user: any,
    ) {
        return this.tasksService.create(projectId, dto, user.userId);
    }

    @Get('tasks/:id')
    async findById(@Param('id', ParseUUIDPipe) id: string) {
        return this.tasksService.findById(id);
    }

    @Put('tasks/:id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateTaskDto,
    ) {
        return this.tasksService.update(id, dto);
    }

    @Patch('tasks/:id/status')
    async updateStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('status') status: string,
    ) {
        return this.tasksService.updateStatus(id, status);
    }
}
