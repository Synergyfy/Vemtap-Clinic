import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PatientPortalService } from './patient-portal.service';
import { PatientLoginDto, PatientRegisterDto, BookAppointmentDto, UpdatePatientProfileDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Patient Portal')
@Controller('patient-portal')
export class PatientPortalController {
  constructor(private readonly portalService: PatientPortalService) {}

  @Post('register')
  @ApiOperation({ summary: 'Patient self-registration' })
  register(@Body() dto: PatientRegisterDto) {
    return this.portalService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Patient login' })
  login(@Body() dto: PatientLoginDto) {
    return this.portalService.login(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get patient profile' })
  getProfile(@Request() req: any) {
    return this.portalService.getProfile(req.user.sub);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update patient profile' })
  updateProfile(@Request() req: any, @Body() dto: UpdatePatientProfileDto) {
    return this.portalService.updateProfile(req.user.sub, dto);
  }

  @Post('appointments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Book an appointment' })
  bookAppointment(@Request() req: any, @Body() dto: BookAppointmentDto) {
    return this.portalService.bookAppointment(req.user.sub, dto);
  }

  @Get('appointments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my appointments' })
  getMyAppointments(@Request() req: any) {
    return this.portalService.getMyAppointments(req.user.sub);
  }

  @Get('records')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my medical records' })
  getMyRecords(@Request() req: any) {
    return this.portalService.getMyRecords(req.user.sub);
  }

  @Get('billing')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my billing history' })
  getMyBilling(@Request() req: any) {
    return this.portalService.getMyBilling(req.user.sub);
  }
}
