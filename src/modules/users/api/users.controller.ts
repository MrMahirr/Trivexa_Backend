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
import { ChangeRoleDto } from './dto/change-role.dto';
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
import { UsersListResponseDto, UserSingleResponseDto } from './dto/response/users-response.dto';
import { StandardResponseDto } from '../../../shared/dto/api-response.dto';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.', type: UsersListResponseDto })
  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  async findAll(@Query() query: UserQueryDto, @CurrentUser() user: any) {
    return this.usersService.findAll(query, user);
  }

  @ApiOperation({ summary: 'Export users to CSV' })
  @ApiResponse({ status: 200, description: 'Return CSV data.' })
  @Get('export/csv')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="users.csv"')
  async exportUsers(@Query() query: ExportUsersQueryDto, @CurrentUser() user: any) {
    return this.usersService.exportUsers(query, user);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return current user profile.', type: UserSingleResponseDto })
  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.userId);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Return user by ID.', type: UserSingleResponseDto })
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
    type: UserSingleResponseDto
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
    type: UserSingleResponseDto
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
    type: StandardResponseDto
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

  @ApiOperation({ summary: 'Activate a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully activated.',
    type: StandardResponseDto
  })
  @Patch(':id/activate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.activate(id);
  }

  @ApiOperation({ summary: 'Change user department' })
  @ApiResponse({
    status: 200,
    description: 'The user department has been successfully changed.',
    type: StandardResponseDto
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

  @ApiOperation({ summary: 'Change user role (RBAC)' })
  @ApiResponse({
    status: 200,
    description: 'The user role has been successfully updated.',
    type: StandardResponseDto
  })
  @Patch(':id/change-role')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async changeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeRoleDto,
  ) {
    return this.usersService.changeRole(id, dto);
  }
}
