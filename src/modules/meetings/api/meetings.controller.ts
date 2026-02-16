import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { MeetingsService } from '../application/meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';

@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingsController {
    constructor(private readonly meetingsService: MeetingsService) { }

    @Post()
    async create(@Body() createMeetingDto: CreateMeetingDto, @CurrentUser() user: any) {
        return this.meetingsService.create(createMeetingDto, user.userId);
    }

    @Get()
    async findAll(
        @Query('clientId') clientId?: string,
        @Query('projectId') projectId?: string,
        @CurrentUser() user?: any
    ) {
        // Optionally filter by organizer = user.userId if not admin? 
        // For now, let's allow seeing all meetings or filter by client/project
        return this.meetingsService.findAll({ clientId, projectId });
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.meetingsService.findById(id);
    }
}
