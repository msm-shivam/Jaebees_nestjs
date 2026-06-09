import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductQuestion } from './entities/product-question.entity';
import { ProductAnswer } from './entities/product-answer.entity';
import { Product } from '../products/entities/product.entity';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { AdminQuestionsController } from './admin-questions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductQuestion, ProductAnswer, Product]),
  ],
  controllers: [QuestionsController, AdminQuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
