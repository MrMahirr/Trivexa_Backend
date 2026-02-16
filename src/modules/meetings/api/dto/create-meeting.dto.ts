import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateMeetingDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsDateString()
    @IsNotEmpty()
    date: string;

    @IsNumber()
    @Min(1)
    @IsOptional()
    durationMinutes?: number = 60;

    @IsUUID()
    @IsOptional()
    clientId?: string;

    @IsUUID()
    @IsOptional()
    projectId?: string;

    @IsString()
    @IsOptional()
    link?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}
