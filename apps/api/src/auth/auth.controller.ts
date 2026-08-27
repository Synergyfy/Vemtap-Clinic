import { Controller, Post, Get, Body, Res, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  COOKIE_CONFIG,
  ACCESS_TOKEN_OPTIONS,
  REFRESH_TOKEN_OPTIONS,
} from './cookie.config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { tokens, user } = await this.authService.register(dto);
    this.setAccessCookie(res, tokens.accessToken);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { user };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { tokens, user } = await this.authService.login(dto);
    this.setAccessCookie(res, tokens.accessToken);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { user };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token cookie' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[COOKIE_CONFIG.REFRESH_TOKEN];
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }
    const { tokens, user } = await this.authService.refreshTokens(refreshToken);
    this.setAccessCookie(res, tokens.accessToken);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { user };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user — clears auth cookies' })
  async logout(@Res({ passthrough: true }) res: Response) {
    this.clearAccessCookie(res);
    this.clearRefreshCookie(res);
    return this.authService.logout();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  private setAccessCookie(res: Response, token: string) {
    res.cookie(COOKIE_CONFIG.ACCESS_TOKEN, token, ACCESS_TOKEN_OPTIONS);
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(COOKIE_CONFIG.REFRESH_TOKEN, token, REFRESH_TOKEN_OPTIONS);
  }

  private clearAccessCookie(res: Response) {
    res.clearCookie(COOKIE_CONFIG.ACCESS_TOKEN, { path: '/' });
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie(COOKIE_CONFIG.REFRESH_TOKEN, { path: '/api/auth/refresh' });
  }
}
