import { Controller, Post, Body, Get, UseGuards, Request, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponseDto, LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Public, Roles } from './decorators/auth.decorators';
import { AuthenticatedRequest } from './interfaces/auth-request.interface';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,
        private configService: ConfigService,
        private jwtService: JwtService
  ) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    
    return this.authService.login(loginDto);
  }
//admin pass admin123
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    return{ data: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
    }}
  }

  

  @UseGuards(JwtAuthGuard)
  @Get('extract-token')
  extractTokenInfo(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      throw new Error('No token provided');
    }
    return this.authService.extractUserFromToken(token);
  }

  // Admin-only endpoint example
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin-only')
  adminOnly() {
    return { message: 'This is admin-only content' };
  }
}