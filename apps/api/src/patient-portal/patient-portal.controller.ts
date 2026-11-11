import { Controller, Get, Post, Put, Body, Res, Req, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request as ExpressRequest } from 'express';
import { PatientPortalService } from './patient-portal.service';
import { PatientLoginDto, PatientRegisterDto, BookAppointmentDto, UpdatePatientProfileDto, RescheduleAppointmentDto, MakePaymentDto, SendPhoneOtpDto, VerifyPhoneOtpDto, SendEmailOtpDto, VerifyEmailOtpDto, CreateFamilyMemberInviteDto, ActivateFamilyMemberDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface JwtPayload {
  sub: string;
  email: string;
  type: string;
}

const PATIENT_ACCESS_COOKIE = 'vemtap_patient_access_token';
const PATIENT_REFRESH_COOKIE = 'vemtap_patient_refresh_token';
const isProduction = process.env.NODE_ENV === 'production';
const ACCESS_TOKEN_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  path: '/',
  maxAge: 60 * 60 * 1000, // 1 hour, matches PATIENT_ACCESS_EXPIRES_IN
};
const REFRESH_TOKEN_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches PATIENT_REFRESH_EXPIRES_IN
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
    this.setRefreshCookie(res, tokens.refreshToken);
    return { patient, accessToken: tokens.accessToken };
  }

  @Post('login')
  @ApiOperation({ summary: 'Patient login' })
  async login(@Body() dto: PatientLoginDto, @Res({ passthrough: true }) res: Response) {
    const { tokens, patient } = await this.portalService.login(dto);
    this.setAccessCookie(res, tokens.accessToken);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { patient, accessToken: tokens.accessToken };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh a patient access token using the httpOnly refresh cookie' })
  async refresh(
    @Req() req: ExpressRequest & { cookies?: Record<string, string> },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { tokens, patient } = await this.portalService.refreshSession(req.cookies?.[PATIENT_REFRESH_COOKIE]);
    this.setAccessCookie(res, tokens.accessToken);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, patient };
  }

  @Post('otp/send')
  @ApiOperation({ summary: 'Send SMS OTP for phone verification' })
  async sendPhoneOtp(@Body() dto: SendPhoneOtpDto) {
    return this.portalService.sendPhoneOtp(dto.phone);
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify a phone OTP code' })
  async verifyPhoneOtp(@Body() dto: VerifyPhoneOtpDto) {
    const isValid = await this.portalService.verifyPhoneOtp(dto.phone, dto.code);
    return { verified: isValid };
  }

  @Post('email-otp/send')
  @ApiOperation({ summary: 'Send an email OTP for account verification' })
  async sendEmailOtp(@Body() dto: SendEmailOtpDto) {
    return this.portalService.sendEmailOtp(dto.email);
  }

  @Post('email-otp/verify')
  @ApiOperation({ summary: 'Verify an email OTP code' })
  async verifyEmailOtp(@Body() dto: VerifyEmailOtpDto) {
    const isValid = await this.portalService.verifyEmailOtp(dto.email, dto.code);
    return { verified: isValid };
  }

  @Get('family')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List the guardian, dependent profiles and pending family invitations' })
  getFamilyProfiles(@Req() req: ExpressRequest & { user: JwtPayload }) {
    return this.portalService.getFamilyProfiles(req.user.sub);
  }

  @Post('family/invite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a family member profile (optionally email an activation link)' })
  async createFamilyMemberInvite(@Req() req: ExpressRequest & { user: JwtPayload }, @Body() dto: CreateFamilyMemberInviteDto) {
    return this.portalService.createFamilyMemberInvite(req.user.sub, dto);
  }

  @Post('family/:patientId/invite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send or resend the activation email for a family member profile' })
  async sendFamilyMemberInvite(
    @Req() req: ExpressRequest & { user: JwtPayload },
    @Param('patientId') patientId: string,
  ) {
    return this.portalService.sendFamilyActivationInvite(req.user.sub, patientId);
  }

  @Post('family/activate')
  @ApiOperation({ summary: 'Activate a dependent account from a guardian invitation link' })
  async activateFamilyMember(@Body() dto: ActivateFamilyMemberDto) {
    return this.portalService.activateFamilyMember(dto.token, dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Patient logout' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(PATIENT_ACCESS_COOKIE, { path: '/' });
    res.clearCookie(PATIENT_REFRESH_COOKIE, { path: '/' });
    return { message: 'Logged out successfully' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get patient profile' })
  async getProfile(@Req() req: ExpressRequest & { user: JwtPayload }) {
    return this.portalService.getProfile(await this.resolvePatient(req));
  }

  @Get('memberships')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all clinics and branches the patient belongs to' })
  async getMyClinicMemberships(@Req() req: ExpressRequest & { user: JwtPayload }) {
    return this.portalService.getClinicMemberships(await this.resolvePatient(req));
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update patient profile' })
  async updateProfile(@Req() req: ExpressRequest & { user: JwtPayload }, @Body() dto: UpdatePatientProfileDto) {
    return this.portalService.updateProfile(await this.resolvePatient(req), dto);
  }

  @Post('appointments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Book an appointment' })
  async bookAppointment(@Req() req: ExpressRequest & { user: JwtPayload }, @Body() dto: BookAppointmentDto) {
    return this.portalService.bookAppointment(await this.resolvePatient(req), dto);
  }

  @Get('appointments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my appointments' })
  async getMyAppointments(@Req() req: ExpressRequest & { user: JwtPayload }) {
    return this.portalService.getMyAppointments(await this.resolvePatient(req));
  }

  @Put('appointments/:id/reschedule')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reschedule an appointment' })
  async rescheduleAppointment(
    @Req() req: ExpressRequest & { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    return this.portalService.rescheduleAppointment(await this.resolvePatient(req), id, dto);
  }

  @Put('appointments/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel an appointment' })
  async cancelAppointment(@Req() req: ExpressRequest & { user: JwtPayload }, @Param('id') id: string) {
    return this.portalService.cancelAppointment(await this.resolvePatient(req), id);
  }

  @Get('records')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my medical records' })
  async getMyRecords(@Req() req: ExpressRequest & { user: JwtPayload }) {
    return this.portalService.getMyRecords(await this.resolvePatient(req));
  }

  @Get('optical/lens-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my optical lens orders' })
  async getMyLensOrders(@Req() req: ExpressRequest & { user: JwtPayload }) {
    return this.portalService.getMyLensOrders(await this.resolvePatient(req));
  }

  @Get('billing')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my billing history' })
  async getMyBilling(@Req() req: ExpressRequest & { user: JwtPayload }) {
    return this.portalService.getMyBilling(await this.resolvePatient(req));
  }

  @Post('billing/payments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Make a payment on an invoice' })
  async makePayment(@Req() req: ExpressRequest & { user: JwtPayload }, @Body() dto: MakePaymentDto) {
    return this.portalService.makePayment(await this.resolvePatient(req), dto);
  }

  private async resolvePatient(req: ExpressRequest & { user: JwtPayload }): Promise<string> {
    const header = req.headers['x-patient-id'];
    const requestedId = Array.isArray(header) ? header[0] : header;
    return this.portalService.resolvePatientId(req.user.sub, requestedId);
  }

  private setAccessCookie(res: Response, token: string) {
    res.cookie(PATIENT_ACCESS_COOKIE, token, ACCESS_TOKEN_OPTIONS);
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(PATIENT_REFRESH_COOKIE, token, REFRESH_TOKEN_OPTIONS);
  }
}