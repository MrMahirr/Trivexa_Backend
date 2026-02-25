import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../../../shared/enums/role.enum';
import { Department } from '../../../../shared/enums/department.enum';

export class ExportUsersQueryDto {
    @ApiPropertyOptional({ enum: Role })
    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @ApiPropertyOptional({ enum: Department })
    @IsOptional()
    @IsEnum(Department)
    department?: Department;

    @ApiPropertyOptional()
    @IsOptional()
    isActive?: boolean;
}
