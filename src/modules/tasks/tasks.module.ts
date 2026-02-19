import { Module } from '@nestjs/common';
import { TasksController } from './api/tasks.controller';
import { TasksService } from './application/tasks.service';
import { TasksRepository } from './infrastructure/tasks.repository';
import { ProjectsModule } from '../projects/projects.module';

import { CreateTaskUseCase } from './application/usecases/create-task.usecase';
import { UpdateTaskUseCase } from './application/usecases/update-task.usecase';
import { GetTaskUseCase } from './application/usecases/get-task.usecase';
import { ListTasksUseCase } from './application/usecases/list-tasks.usecase';
import { UpdateTaskStatusUseCase } from './application/usecases/update-task-status.usecase';

@Module({
    imports: [ProjectsModule],
    controllers: [TasksController],
    providers: [
        TasksService,
        TasksRepository,
        CreateTaskUseCase,
        UpdateTaskUseCase,
        GetTaskUseCase,
        ListTasksUseCase,
        UpdateTaskStatusUseCase
    ],
    exports: [TasksService, TasksRepository],
})
export class TasksModule { }
