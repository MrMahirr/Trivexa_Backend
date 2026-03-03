import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class UpdateGithubUrlDto {
  @ApiProperty({
    example: 'https://github.com/org/project-name',
    description: 'GitHub repository URL',
  })
  @IsUrl({}, { message: 'Please provide a valid URL' })
  @IsNotEmpty()
  githubUrl: string;
}
