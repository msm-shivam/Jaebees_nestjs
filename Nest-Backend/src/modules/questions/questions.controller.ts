import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { Request } from 'express';

@ApiTags('Questions')
@Controller()
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post('questions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ask a question about a product' })
  create(@Body() dto: CreateQuestionDto, @Req() req: Request) {
    const userId: string = (req.user as Record<string, unknown>).id as string;
    return this.questionsService.create(userId, dto);
  }

  @Get('questions/product/:productId')
  @ApiOperation({ summary: 'Get questions for a product' })
  getProductQuestions(@Param('productId') productId: string) {
    return this.questionsService.findByProduct(productId);
  }

  @Get('questions/:id')
  @ApiOperation({ summary: 'Get a question by ID' })
  getById(@Param('id') id: string) {
    return this.questionsService.findById(id);
  }
}
