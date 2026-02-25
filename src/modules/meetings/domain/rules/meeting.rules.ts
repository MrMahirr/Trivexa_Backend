import { BadRequestException } from '@nestjs/common';

export class MeetingRules {
    static validateMeetingDate(date: Date): void {
        const now = new Date();
        // Toplantı geçmiş bir tarihe planlanamaz
        if (date < now) {
            throw new BadRequestException('Meeting date cannot be in the past');
        }
    }

    static validateDuration(minutes: number): void {
        if (!minutes || minutes <= 0) {
            throw new BadRequestException('Meeting duration must be greater than zero');
        }
    }
}
