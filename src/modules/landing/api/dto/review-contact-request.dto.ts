import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewContactRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
