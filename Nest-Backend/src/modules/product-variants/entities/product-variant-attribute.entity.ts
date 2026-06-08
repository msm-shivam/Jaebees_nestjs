import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
  Unique,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { Attribute } from '../../attributes/entities/attribute.entity';
import { AttributeValue } from '../../attribute-values/entities/attribute-value.entity';

@Entity('product_variant_attributes')
@Unique(['variantId', 'attributeId'])
@Index('idx_product_variant_attributes_variant_id', ['variantId'])
@Index('idx_product_variant_attributes_attribute_id', ['attributeId'])
@Index('idx_product_variant_attributes_attribute_value_id', [
  'attributeValueId',
])
export class ProductVariantAttribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @ManyToOne(() => ProductVariant, (variant) => variant.attributes, {
    onDelete: 'CASCADE',
  })
  variant: ProductVariant;

  @Column({ name: 'attribute_id', type: 'uuid' })
  attributeId: string;

  @ManyToOne(() => Attribute, (attribute) => attribute.variantAttributes, {
    onDelete: 'CASCADE',
  })
  attribute: Attribute;

  @Column({ name: 'attribute_value_id', type: 'uuid' })
  attributeValueId: string;

  @ManyToOne(
    () => AttributeValue,
    (attributeValue) => attributeValue.variantAttributes,
    {
      onDelete: 'CASCADE',
    },
  )
  attributeValue: AttributeValue;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
