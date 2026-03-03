import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignClientDto {
  @ApiProperty({ example: 'uuid-of-client' })
  @IsUUID()
  @IsNotEmpty()
  clientId: string;
}
