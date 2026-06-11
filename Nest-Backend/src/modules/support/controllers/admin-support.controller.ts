import {
  Controller, Get, Post, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../../common/decorators/current-user.decorator';
import { SupportService } from '../services/support.service';
import type { TicketQueryDto } from '../dto/ticket-query.dto';
import type { ReplyTicketDto } from '../dto/reply-ticket.dto';
import type { AssignTicketDto } from '../dto/assign-ticket.dto';
import type { AddNoteDto } from '../dto/add-note.dto';
import type { AddTagDto } from '../dto/add-tag.dto';

@ApiTags('Admin — Support')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/support')
export class AdminSupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get()
  @Permissions(DefaultPermissions.SUPPORT_VIEW)
  async findAll(@Query() query: TicketQueryDto) {
    return this.supportService.findAll(query);
  }

  @Get(':id')
  @Permissions(DefaultPermissions.SUPPORT_VIEW)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.supportService.findOne(id);
  }

  @Post(':id/assign')
  @Permissions(DefaultPermissions.SUPPORT_ASSIGN)
  async assign(
    @CurrentUser() admin: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignTicketDto,
  ) {
    return this.supportService.assign(id, admin.sub, dto);
  }

  @Post(':id/reply')
  @Permissions(DefaultPermissions.SUPPORT_REPLY)
  async reply(
    @CurrentUser() admin: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplyTicketDto,
  ) {
    return this.supportService.adminReply(id, admin.sub, dto);
  }

  @Post(':id/resolve')
  @Permissions(DefaultPermissions.SUPPORT_RESOLVE)
  async resolve(@CurrentUser() admin: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.supportService.resolve(id, admin.sub);
  }

  @Post(':id/reopen')
  @Permissions(DefaultPermissions.SUPPORT_RESOLVE)
  async reopen(@CurrentUser() admin: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.supportService.reopen(id, admin.sub);
  }

  @Post(':id/note')
  @Permissions(DefaultPermissions.SUPPORT_NOTE)
  async addNote(
    @CurrentUser() admin: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddNoteDto,
  ) {
    return this.supportService.addNote(id, admin.sub, dto.note);
  }

  @Post(':id/attachments')
  @Permissions(DefaultPermissions.SUPPORT_REPLY)
  async addAttachment(
    @CurrentUser() admin: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('fileUrl') fileUrl: string,
    @Body('fileName') fileName: string,
  ) {
    return this.supportService.uploadAttachment(id, fileUrl, fileName, admin.sub);
  }

  @Get(':id/attachments')
  @Permissions(DefaultPermissions.SUPPORT_VIEW)
  async getAttachments(@Param('id', ParseUUIDPipe) id: string) {
    return this.supportService.getAttachments(id);
  }

  @Get(':id/audit')
  @Permissions(DefaultPermissions.SUPPORT_VIEW)
  async getAudit(@Param('id', ParseUUIDPipe) id: string) {
    return this.supportService.getAuditHistory(id);
  }

  @Post(':id/tags')
  @Permissions(DefaultPermissions.SUPPORT_ASSIGN)
  async addTag(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddTagDto,
  ) {
    return this.supportService.addTag(id, dto.tag);
  }

  @Delete(':id/tags/:tagId')
  @Permissions(DefaultPermissions.SUPPORT_ASSIGN)
  async removeTag(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('tagId', ParseUUIDPipe) tagId: string,
  ) {
    return this.supportService.removeTag(id, tagId);
  }

  @Get(':id/tags')
  @Permissions(DefaultPermissions.SUPPORT_VIEW)
  async getTags(@Param('id', ParseUUIDPipe) id: string) {
    return this.supportService.getTags(id);
  }
}
