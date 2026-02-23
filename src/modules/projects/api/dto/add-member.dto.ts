import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class AddMemberDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  role?: string = 'MEMBER';
}
