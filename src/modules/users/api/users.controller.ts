import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { ChangeDepartmentDto } from './dto/change-department.dto';
import { ExportUsersQueryDto } from './dto/export-users.query';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.' })
  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @ApiOperation({ summary: 'Export users to CSV' })
  @ApiResponse({ status: 200, description: 'Return CSV data.' })
  @Get('export/csv')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="users.csv"')
  async exportUsers(@Query() query: ExportUsersQueryDto) {
    return this.usersService.exportUsers(query);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return current user profile.' })
  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.userId);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Return user by ID.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    return this.usersService.update(id, dto, user.userId);
  }

  @ApiOperation({ summary: 'Deactivate a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deactivated.',
  })
  @Patch(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.usersService.deactivate(id, user.userId);
  }

  @ApiOperation({ summary: 'Change user department' })
  @ApiResponse({
    status: 200,
    description: 'The user department has been successfully changed.',
  })
  @Patch(':id/change-department')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async changeDepartment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeDepartmentDto,
    @CurrentUser() admin: any,
  ) {
    dto.userId = id;
    return this.usersService.changeDepartment(dto, admin.userId);
  }
}
