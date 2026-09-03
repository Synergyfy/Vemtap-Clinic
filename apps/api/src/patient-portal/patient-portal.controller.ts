import { Controller, Get, Post, Put, Body, Res, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request as ExpressRequest } from 'express';
import { PatientPortalService } from './patient-portal.service';
import { PatientLoginDto, PatientRegisterDto, BookAppointmentDto, UpdatePatientProfileDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { COOKIE_CONFIG } from '../auth/cookie.config';

interface JwtPayload {
  sub: string;
  email: string;
  type: string;
}

const PATIENT_ACCESS_COOKIE = 'vemtap_patient_access_token';
const ACCESS_TOKEN_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 15 * 60 * 1000, // 15 minutes
};

@ApiTags('Patient Portal')
@Controller('patient-portal')
export class PatientPortalController {
  constructor(private readonly portalService: PatientPortalService) {}

  @Post('register')
  @ApiOperation({ summary: 'Patient self-registration' })
  async register(@Body() dto: PatientRegisterDto, @Res({ passthrough: true }) res: Response) {
    const { tokens, patient } = await this.portalService.register(dto);
    this.setAccessCookie(res, tokens.accessToken);
    return { patient };
  }

  @Post('login')
  @ApiOperation({ summary: 'Patient login' })
  async login(@Body() dto: PatientLoginDto, @Res({ passthrough: true }) res: Response) {
    const { tokens, patient } = await this.portalService.login(dto);
    this.setAccessCookie(res, tokens.accessToken);
    return { patient };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Patient logout' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(PATIENT_ACCESS_COOKIE, { path: '/' });
    return { message: 'Logged out successfully' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get patient profile' })
  getProfile(@Req() req: ExpressRequest & { user: JwtPayload }) {
    return this.portalService.getProfile(req.user.sub);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update patient profile' })
  updateProfile(@Req() req: ExpressRequest & { user: JwtPayload }, @Body() dto: UpdatePatientProfileDto) {
    return this.portalService.updateProfile(req.user.sub, dto);
  }

  @Post('appointments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Book an appointment' })
  bookAppointment(@Req() req: ExpressRequest & { user: JwtPayload }, @Body() dto: BookAppointmentDto) {
    return this.portalService.bookAppointment(req.user.sub, dto);
  }

  @Get('appointments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my appointments' })
  getMyAppointments(@Req() req: ExpressRequest & { user: JwtPayload }) {
    return this.portalService.getMyAppointments(req.user.sub);
  }

  @Get('records')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my medical records' })
  getMyRecords(@Req() req: ExpressRequest & { user: JwtPayload }) {
    return this.portalService.getMyRecords(req.user.sub);
  }

  @Get('billing')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my billing history' })
  getMyBilling(@Req() req: ExpressRequest & { user: JwtPayload }) {
    return this.portalService.getMyBilling(req.user.sub);
  }

  private setAccessCookie(res: Response, token: string) {
    res.cookie(PATIENT_ACCESS_COOKIE, token, ACCESS_TOKEN_OPTIONS);
  }
}