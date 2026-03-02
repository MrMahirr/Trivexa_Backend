import { IsNotEmpty, IsUUID } from 'class-validator';

export class JoinProjectDto {
  @IsUUID()
  @IsNotEmpty()
  projectId: string;
}
