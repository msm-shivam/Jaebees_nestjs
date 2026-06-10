import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PromotionService } from '../services/promotion.service';

@ApiTags('Promotions')
@Controller('promotions')
export class CustomerPromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Get()
  @ApiOperation({ summary: 'List all promotions' })
  findAll() {
    return this.promotionService.findAll({});
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active promotions' })
  getActive() {
    return this.promotionService.getActivePromotions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get promotion by ID' })
  findById(@Param('id') id: string) {
    return this.promotionService.findById(id);
  }
}
