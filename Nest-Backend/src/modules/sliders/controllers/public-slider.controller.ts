import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SlidersService } from '../sliders.service';

@ApiTags('Sliders')
@Controller('sliders')
export class PublicSliderController {
  constructor(private readonly slidersService: SlidersService) {}

  @Get()
  @ApiOperation({ summary: 'Get active sliders (public)' })
  async findActive() {
    return this.slidersService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single slider by ID' })
  async findOne(@Param('id') id: string) {
    return this.slidersService.findOne(id);
  }
}
