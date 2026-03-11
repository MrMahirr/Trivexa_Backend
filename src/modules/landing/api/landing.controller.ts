import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LandingService } from '../application/landing.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ListContactRequestsQueryDto } from './dto/list-contact-requests.query';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ReviewContactRequestDto } from './dto/review-contact-request.dto';
import { LandingContentDto } from './dto/landing-content.dto';

@ApiTags('Landing')
@Controller('landing')
export class LandingController {
  constructor(private readonly landingService: LandingService) {}

  @Post('contact')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit landing contact form message' })
  @ApiResponse({ status: 200, description: 'Contact message accepted.' })
  async submitContact(@Body() dto: CreateContactMessageDto) {
    return this.landingService.submitContactMessage(dto);
  }

  @Get('contact-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'List landing contact requests' })
  @ApiResponse({ status: 200, description: 'Contact requests list returned.' })
  async listContactRequests(@Query() query: ListContactRequestsQueryDto) {
    return this.landingService.listContactRequests(query);
  }

  @Patch('contact-requests/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Approve a landing contact request' })
  @ApiResponse({ status: 200, description: 'Contact request approved.' })
  async approveContactRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.landingService.approveContactRequest(id, user?.userId);
  }

  @Patch('contact-requests/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Reject a landing contact request' })
  @ApiResponse({ status: 200, description: 'Contact request rejected.' })
  async rejectContactRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Body() dto: ReviewContactRequestDto,
  ) {
    return this.landingService.rejectContactRequest(
      id,
      user?.userId,
      dto.reason,
    );
  }

  @Get('customer-panel/bootstrap')
  @ApiOperation({ summary: 'Get customer panel bootstrap endpoints' })
  @ApiResponse({
    status: 200,
    description: 'Bootstrap payload for customer panel.',
  })
  getCustomerPanelBootstrap() {
    return this.landingService.getCustomerPanelBootstrap();
  }

  @Get('team')
  @ApiOperation({ summary: 'Get active team members grouped by department' })
  @ApiResponse({
    status: 200,
    description: 'Team members grouped by department.',
  })
  async getTeamMembersByDepartment() {
    return this.landingService.getTeamMembersByDepartment();
  }

  @Get('content')
  @ApiOperation({ summary: 'Get landing page content' })
  @ApiResponse({ status: 200, description: 'Landing content returned.' })
  async getLandingContent() {
    return this.landingService.getLandingContent();
  }

  @Post('content')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update landing page content' })
  @ApiResponse({ status: 200, description: 'Landing content updated.' })
  async updateLandingContent(
    @Body() dto: LandingContentDto,
    @CurrentUser() user: any,
  ) {
    return this.landingService.updateLandingContent(dto, user?.userId);
  }
}
