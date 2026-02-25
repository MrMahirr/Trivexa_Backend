import { BadRequestException } from '@nestjs/common';

export class TimeTrackingRules {
    static validateDuration(startTime: Date, endTime?: Date): void {
        if (endTime && endTime < startTime) {
            throw new BadRequestException('End time cannot be before start time');
        }
    }

    static isEntryActive(endTime?: Date): boolean {
        return !endTime;
    }
}
