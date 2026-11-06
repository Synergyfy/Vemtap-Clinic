import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateDemoRequestDto } from './dto';
import { DemoRequestsService } from './demo-requests.service';

@ApiTags('Demo Requests')
@Controller('demo-requests')
export class DemoRequestsController {
  constructor(private readonly demoRequestsService: DemoRequestsService) {}

  @Get()
  @ApiOperation({ summary: 'List submitted demo requests' })
  findAll() {
    return this.demoRequestsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Submit a new demo request from the public booking form' })
  create(@Body() dto: CreateDemoRequestDto) {
    return this.demoRequestsService.create(dto);
  }
}
