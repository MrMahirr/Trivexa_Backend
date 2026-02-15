import { Module } from '@nestjs/common';
import { TasksController } from './api/tasks.controller';
import { TasksService } from './application/tasks.service';
import { TasksRepository } from './infrastructure/tasks.repository';
import { ProjectsModule } from '../projects/projects.module';

@Module({
    imports: [ProjectsModule],
    controllers: [TasksController],
    providers: [TasksService, TasksRepository],
    exports: [TasksService, TasksRepository],
})
export class TasksModule { }
