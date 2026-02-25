import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { Department } from '../../../../shared/enums/department.enum';

export class ChangeDepartmentDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({ enum: Department })
    @IsEnum(Department)
    @IsNotEmpty()
    department: Department;
}
