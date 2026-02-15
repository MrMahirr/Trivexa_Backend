import {
    Body,
    Controller,
    Get,
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
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'MANAGER')
    async findAll(@Query() query: UserQueryDto) {
        return this.usersService.findAll(query);
    }

    @Get('me')
    async getProfile(@CurrentUser() user: any) {
        return this.usersService.findById(user.userId);
    }

    @Get(':id')
    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'MANAGER')
    async findById(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.findById(id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    async create(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }

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

    @Patch(':id/deactivate')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    async deactivate(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: any,
    ) {
        return this.usersService.deactivate(id, user.userId);
    }
}
