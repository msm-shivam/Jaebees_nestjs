import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Attribute } from '../../attributes/entities/attribute.entity';
import { ProductVariantAttribute } from '../../product-variants/entities/product-variant-attribute.entity';

@Entity('attribute_values')
@Index(['attributeId', 'slug'], { unique: true })
@Index(['attributeId'])
@Index(['slug'])
@Index(['sortOrder'])
export class AttributeValue extends BaseEntity {
  @Column({ name: 'attribute_id', type: 'uuid' })
  attributeId: string;

  @Column({ length: 150 })
  value: string;

  @Column({ length: 150 })
  slug: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Attribute, (attribute) => attribute.values, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'attribute_id' })
  attribute: Attribute;

  @OneToMany(
    () => ProductVariantAttribute,
    (variantAttribute) => variantAttribute.attributeValue,
  )
  variantAttributes: ProductVariantAttribute[];
}
