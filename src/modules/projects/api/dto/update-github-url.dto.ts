import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class UpdateGithubUrlDto {
  @ApiProperty({
    example: 'https://github.com/org/project-name',
    description: 'GitHub repository URL',
  })
  @IsUrl({}, { message: 'Please provide a valid URL' })
  @IsNotEmpty()
  githubUrl: string;

  @ApiProperty({
    example: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    description:
      'Optional GitHub token for private repositories (repo or fine-grained equivalent permission)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(20)
  accessToken?: string;

  @ApiProperty({
    example: false,
    description: 'If true, removes previously saved project-level GitHub token',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  clearAccessToken?: boolean;
}
