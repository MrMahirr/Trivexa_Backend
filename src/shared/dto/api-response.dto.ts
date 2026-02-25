import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    message?: string;

    @ApiProperty()
    data?: T;

    constructor(success: boolean, message?: string, data?: T) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    static success<T>(data?: T, message?: string): ApiResponseDto<T> {
        return new ApiResponseDto(true, message, data);
    }

    static error<T>(message: string, data?: T): ApiResponseDto<T> {
        return new ApiResponseDto(false, message, data);
    }
}
