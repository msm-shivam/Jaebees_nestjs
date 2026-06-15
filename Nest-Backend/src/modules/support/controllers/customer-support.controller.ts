import {
  Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../../common/decorators/current-user.decorator';
import { SupportService } from '../services/support.service';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { ReplyTicketDto } from '../dto/reply-ticket.dto';
import { TicketQueryDto } from '../dto/ticket-query.dto';
import { RateTicketDto } from '../dto/rate-ticket.dto';

@ApiTags('Customer — Support')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('support')
export class CustomerSupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTicketDto) {
    return this.supportService.create(user.sub, dto);
  }

  @Get('my')
  async findMy(@CurrentUser() user: JwtPayload, @Query() query: TicketQueryDto) {
    return this.supportService.findMyTickets(user.sub, query);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.supportService.findOne(id, user.sub);
  }

  @Post(':id/reply')
  async reply(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplyTicketDto,
  ) {
    return this.supportService.reply(user.sub, id, dto);
  }

  @Post(':id/close')
  async close(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.supportService.close(user.sub, id);
  }

  @Post(':id/reopen')
  async reopen(@CurrentUser() _user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.supportService.reopen(id);
  }

  @Post(':id/rate')
  async rate(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RateTicketDto,
  ) {
    return this.supportService.rateTicket(id, dto.rating, user.sub, dto.comment);
  }

  @Get(':id/attachments')
  async getAttachments(@Param('id', ParseUUIDPipe) id: string) {
    return this.supportService.getAttachments(id);
  }

  @Get(':id/audit')
  async getAudit(@Param('id', ParseUUIDPipe) id: string) {
    return this.supportService.getAuditHistory(id);
  }
}
