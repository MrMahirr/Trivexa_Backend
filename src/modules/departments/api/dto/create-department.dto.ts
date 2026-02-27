import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
    @ApiProperty({
        description: 'Name of the department (E.g. Tasarım, Yazılım)',
        example: 'Tasarım Departmanı',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'Brief description about the department',
        required: false,
        example: 'Tüm tasarım ve grafik operasyonlarını yönetir.',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'Manager UUID (user_id) for this department',
        required: false,
    })
    @IsUUID()
    @IsOptional()
    managerId?: string;
}
