import { Module } from '@nestjs/common';
import { RedisModule } from '../../infrastructure/cache/redis.module';
import { ProjectsController } from './api/projects.controller';
import { ProjectsService } from './application/projects.service';
import { ProjectsRepository } from './infrastructure/projects.repository';

@Module({
    imports: [RedisModule],
    controllers: [ProjectsController],
    providers: [ProjectsService, ProjectsRepository],
    exports: [ProjectsService, ProjectsRepository],
})
export class ProjectsModule { }
