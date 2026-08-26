import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrencyService } from './currency.service';
import { CreateCurrencyConfigDto, UpdateCurrencyConfigDto, CurrencyConfigQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Currency')
@Controller('currency')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create currency configuration' })
  create(@Body() dto: CreateCurrencyConfigDto) {
    return this.currencyService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List currency configurations' })
  findAll(@Query() query: CurrencyConfigQueryDto) {
    return this.currencyService.findAll(query);
  }

  @Get('base')
  @ApiOperation({ summary: 'Get base currency for clinic' })
  findBase(@Query('clinicId') clinicId: string) {
    return this.currencyService.findBaseCurrency(clinicId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get currency statistics' })
  getStats(@Query('clinicId') clinicId: string) {
    return this.currencyService.getStats(clinicId);
  }

  @Get('convert')
  @ApiOperation({ summary: 'Convert amount between currencies' })
  convert(
    @Query('amount') amount: number,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('clinicId') clinicId: string,
  ) {
    return this.currencyService.convert(Number(amount), from as any, to as any, clinicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get currency by ID' })
  findOne(@Param('id') id: string) {
    return this.currencyService.findById(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update currency configuration' })
  update(@Param('id') id: string, @Body() dto: UpdateCurrencyConfigDto) {
    return this.currencyService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete currency configuration' })
  remove(@Param('id') id: string) {
    return this.currencyService.remove(id);
  }
}