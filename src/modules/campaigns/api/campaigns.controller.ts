import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CampaignsService } from '../application/campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { ListCampaignsQueryDto } from './dto/list-campaigns.query.dto';
import { CampaignStatus } from '../domain/campaign.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Campaigns')
@ApiBearerAuth('access-token')
@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @ApiOperation({ summary: 'List campaigns' })
  @ApiResponse({ status: 200, description: 'Return campaign list.' })
  @Get()
  async findAll(@Query() query: ListCampaignsQueryDto) {
    return this.campaignsService.findAll(query);
  }

  @ApiOperation({ summary: 'Get campaign by ID' })
  @ApiResponse({ status: 200, description: 'Return campaign detail.' })
  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.campaignsService.findById(id);
  }

  @ApiOperation({ summary: 'Create a new campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created.' })
  @Post()
  async create(@Body() dto: CreateCampaignDto, @CurrentUser() user: any) {
    return this.campaignsService.create(
      dto,
      user?.userId ?? user?.id ?? user?.sub ?? null,
    );
  }

  @ApiOperation({ summary: 'Update a campaign' })
  @ApiResponse({ status: 200, description: 'Campaign updated.' })
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Update campaign status' })
  @ApiResponse({ status: 200, description: 'Campaign status updated.' })
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: CampaignStatus,
  ) {
    return this.campaignsService.updateStatus(id, status);
  }

  @ApiOperation({ summary: 'Delete campaign' })
  @ApiResponse({ status: 200, description: 'Campaign deleted.' })
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.campaignsService.remove(id);
    return { deleted: true };
  }
}
