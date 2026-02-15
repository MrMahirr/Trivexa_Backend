import { Module } from '@nestjs/common';
import { ProjectsController } from './api/projects.controller';
import { ProjectsService } from './application/projects.service';
import { ProjectsRepository } from './infrastructure/projects.repository';

@Module({
    controllers: [ProjectsController],
    providers: [ProjectsService, ProjectsRepository],
    exports: [ProjectsService, ProjectsRepository],
})
export class ProjectsModule { }
