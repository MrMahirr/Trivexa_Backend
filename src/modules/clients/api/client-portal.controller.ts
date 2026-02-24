import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginDto } from '../../auth/api/dto/login.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AuthService } from '../../auth/application/auth.service';

@ApiTags('Client Portal')
@Controller('portal')
export class ClientPortalController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Client login' })
  @ApiResponse({ status: 200, description: 'Return access token.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto) {
    // Authenticate using the standard auth service
    // The service internally handles user validation and token generation
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get client dashboard data' })
  @ApiResponse({ status: 200, description: 'Return dashboard statistics.' })
  async getDashboard(@Request() req) {
    // Mock dashboard data for now
    return {
      message: 'Welcome to Client Portal',
      clientId: req.user.userId,
      activeProjects: 2,
      pendingInvoices: 1,
      unreadTickets: 0,
    };
  }
}
