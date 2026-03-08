import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LandingService } from '../application/landing.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

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

  @Get('customer-panel/bootstrap')
  @ApiOperation({ summary: 'Get customer panel bootstrap endpoints' })
  @ApiResponse({ status: 200, description: 'Bootstrap payload for customer panel.' })
  getCustomerPanelBootstrap() {
    return this.landingService.getCustomerPanelBootstrap();
  }
}
