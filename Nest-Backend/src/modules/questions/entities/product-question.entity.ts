import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductAnswer } from './product-answer.entity';
import { QuestionStatus } from '../enums/question-status.enum';

@Entity('product_questions')
@Index(['productId'])
@Index(['userId'])
@Index(['status'])
export class ProductQuestion extends BaseEntity {
  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'enum', enum: QuestionStatus, default: QuestionStatus.OPEN })
  status: QuestionStatus;

  @OneToMany(() => ProductAnswer, (answer) => answer.question, { cascade: true })
  answers: ProductAnswer[];
}
