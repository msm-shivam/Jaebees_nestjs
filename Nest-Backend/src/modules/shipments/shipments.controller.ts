import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ShipmentsService } from './shipments.service';
import { ShipmentResponseDto } from './dto/shipment-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Customer — Shipments')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Get(':orderId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get shipment by order' })
  @ApiResponse({
    status: 200,
    description: 'Shipment returned.',
    type: ShipmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Shipment not found.' })
  async findByOrder(@Param('orderId') orderId: string) {
    return this.shipmentsService.findByOrderId(orderId);
  }
}
