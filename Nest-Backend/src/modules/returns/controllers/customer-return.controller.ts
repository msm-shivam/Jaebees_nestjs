import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../../common/decorators/current-user.decorator';
import type { CreateReturnDto } from '../dto/create-return.dto';
import type { ReturnQueryDto } from '../dto/return-query.dto';
import { ReturnService } from '../services/return.service';

@ApiTags('Customer — Returns')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('returns')
export class CustomerReturnController {
  constructor(private readonly returnService: ReturnService) {}

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateReturnDto) {
    return this.returnService.create(user.sub, dto);
  }

  @Get('my')
  async findMy(
    @CurrentUser() user: JwtPayload,
    @Query() query: ReturnQueryDto,
  ) {
    return this.returnService.findMyReturns(user.sub, query);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.returnService.findOne(id, user.sub);
  }

  @Delete(':id')
  async cancel(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.returnService.cancel(id, user.sub);
  }
}
