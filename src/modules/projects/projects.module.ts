import { Module } from '@nestjs/common';
import { RedisModule } from '../../infrastructure/cache/redis.module';
import { ProjectsController } from './api/projects.controller';
import { ProjectsService } from './application/projects.service';
import { ProjectsRepository } from './infrastructure/projects.repository';
import { CreateProjectUseCase } from './application/usecases/create-project.usecase';
import { UpdateProjectStatusUseCase } from './application/usecases/update-status.usecase';
import { AssignClientUseCase } from './application/usecases/assign-client.usecase';

@Module({
  imports: [RedisModule],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    ProjectsRepository,
    CreateProjectUseCase,
    UpdateProjectStatusUseCase,
    AssignClientUseCase,
  ],
  exports: [ProjectsService, ProjectsRepository, AssignClientUseCase],
})
export class ProjectsModule { }
