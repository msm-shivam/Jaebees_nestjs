import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { ProductQuestion } from './product-question.entity';
import { AdminUser } from '../../admin/entities/admin-user.entity';

@Entity('product_answers')
@Index(['questionId'])
export class ProductAnswer extends BaseEntity {
  @Column({ name: 'question_id', type: 'uuid' })
  questionId: string;

  @ManyToOne(() => ProductQuestion, (question) => question.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: ProductQuestion;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => AdminUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: AdminUser;

  @Column({ type: 'text' })
  answer: string;

  @Column({ name: 'is_admin_answer', default: true })
  isAdminAnswer: boolean;
}
