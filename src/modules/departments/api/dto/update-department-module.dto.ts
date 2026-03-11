import { PartialType } from '@nestjs/swagger';
import { CreateDepartmentModuleDto } from './create-department-module.dto';

export class UpdateDepartmentModuleDto extends PartialType(
  CreateDepartmentModuleDto,
) {}
