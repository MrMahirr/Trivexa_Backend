import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({ example: 'uuid-of-user', description: 'User ID to add' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'MEMBER', description: 'Role of the user in project', required: false })
  @IsString()
  @IsOptional()
  role?: string = 'MEMBER';
}
