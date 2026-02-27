import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../../shared/enums/role.enum';

export class ChangeRoleDto {
    @ApiProperty({
        description: 'The new role to assign to the user',
        enum: Role,
        example: Role.MANAGER,
    })
    @IsNotEmpty()
    @IsEnum(Role, {
        message: 'Geçersiz rol türü. (Geçerli türler: STAFF, MANAGER, ADMIN vb.)',
    })
    role: Role;
}
