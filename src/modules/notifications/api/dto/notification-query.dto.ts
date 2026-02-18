import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class NotificationQueryDto {
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isRead?: boolean;

    @IsOptional()
    @IsString()
    type?: string;
}
