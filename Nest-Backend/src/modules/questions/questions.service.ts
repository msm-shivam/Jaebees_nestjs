import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductQuestion } from './entities/product-question.entity';
import { ProductAnswer } from './entities/product-answer.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { QuestionStatus } from './enums/question-status.enum';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(ProductQuestion)
    private readonly questionRepository: Repository<ProductQuestion>,
    @InjectRepository(ProductAnswer)
    private readonly answerRepository: Repository<ProductAnswer>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(
    userId: string,
    dto: CreateQuestionDto,
  ): Promise<ProductQuestion> {
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const question = this.questionRepository.create({
      productId: dto.productId,
      userId,
      question: dto.question,
      status: QuestionStatus.OPEN,
    });
    return this.questionRepository.save(question);
  }

  async findByProduct(productId: string): Promise<ProductQuestion[]> {
    return this.questionRepository.find({
      where: { productId },
      relations: { user: true, answers: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<ProductQuestion> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: { user: true, answers: { user: true } },
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }

  async findAll(): Promise<ProductQuestion[]> {
    return this.questionRepository.find({
      relations: { user: true, product: true, answers: { user: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async answer(
    questionId: string,
    userId: string,
    dto: AnswerQuestionDto,
  ): Promise<ProductAnswer> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const answer = this.answerRepository.create({
      questionId,
      userId,
      answer: dto.answer,
      isAdminAnswer: true,
    });
    const saved = await this.answerRepository.save(answer);

    question.status = QuestionStatus.ANSWERED;
    await this.questionRepository.save(question);

    return saved;
  }

  async close(id: string): Promise<ProductQuestion> {
    const question = await this.findById(id);
    question.status = QuestionStatus.CLOSED;
    return this.questionRepository.save(question);
  }

  async remove(id: string): Promise<void> {
    const question = await this.findById(id);
    await this.questionRepository.softDelete(id);
  }
}
