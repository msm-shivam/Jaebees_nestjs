import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../common/constants/roles.constants';
import type { Request } from 'express';

@ApiTags('Admin — Questions')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/questions')
export class AdminQuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  @Permissions(DefaultPermissions.QUESTION_VIEW)
  @ApiOperation({ summary: 'List all questions' })
  findAll() {
    return this.questionsService.findAll();
  }

  @Get(':id')
  @Permissions(DefaultPermissions.QUESTION_VIEW)
  @ApiOperation({ summary: 'Get question by ID' })
  findOne(@Param('id') id: string) {
    return this.questionsService.findById(id);
  }

  @Post(':id/answer')
  @Permissions(DefaultPermissions.QUESTION_ANSWER)
  @ApiOperation({ summary: 'Answer a question' })
  answer(
    @Param('id') id: string,
    @Body() dto: AnswerQuestionDto,
    @Req() req: Request,
  ) {
    const userId: string = (req.user as Record<string, unknown>).id as string;
    return this.questionsService.answer(id, userId, dto);
  }

  @Patch(':id/close')
  @Permissions(DefaultPermissions.QUESTION_ANSWER)
  @ApiOperation({ summary: 'Close a question' })
  close(@Param('id') id: string) {
    return this.questionsService.close(id);
  }

  @Delete(':id')
  @Permissions(DefaultPermissions.QUESTION_DELETE)
  @ApiOperation({ summary: 'Delete a question' })
  remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }
}
