import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../shared/enums/role.enum';
import { LeaveRequestsService } from '../application/leave-requests.service';
import { LeaveRequestsQueryDto } from './dto/leave-requests.query.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';

@ApiTags('Leave Requests')
@ApiBearerAuth()
@Controller('leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveRequestsController {
  constructor(private readonly leaveService: LeaveRequestsService) {}

  @ApiOperation({ summary: 'List leave requests' })
  @ApiResponse({ status: 200, description: 'Return leave requests.' })
  @Get()
  @Roles(Role.ADMIN, Role.CEO, Role.MANAGER, Role.HR)
  async findAll(@Query() query: LeaveRequestsQueryDto) {
    return this.leaveService.findAll(query);
  }

  @ApiOperation({ summary: 'Create leave request' })
  @ApiResponse({ status: 201, description: 'Leave request created.' })
  @Post()
  @Roles(Role.ADMIN, Role.CEO, Role.MANAGER, Role.HR)
  async create(@Body() dto: CreateLeaveRequestDto, @CurrentUser() user: any) {
    return this.leaveService.create(dto, user);
  }

  @ApiOperation({ summary: 'Update leave request status' })
  @ApiResponse({ status: 200, description: 'Leave request status updated.' })
  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.CEO, Role.MANAGER, Role.HR)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeaveStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.leaveService.updateStatus(id, dto, user);
  }
}
