import { Column, DeleteDateColumn, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { AttributeValue } from '../../attribute-values/entities/attribute-value.entity';
import { ProductVariantAttribute } from '../../product-variants/entities/product-variant-attribute.entity';

@Entity('attributes')
@Index(['slug'], { unique: true })
@Index(['sortOrder'])
export class Attribute extends BaseEntity {
  @Column({ length: 150 })
  name: string;

  @Column({ unique: true, length: 150 })
  slug: string;

  @Column({ name: 'is_filterable', default: false })
  isFilterable: boolean;

  @Column({ name: 'is_required', default: false })
  isRequired: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => AttributeValue, (value) => value.attribute)
  values: AttributeValue[];

  @OneToMany(
    () => ProductVariantAttribute,
    (variantAttribute) => variantAttribute.attribute,
  )
  variantAttributes: ProductVariantAttribute[];
}
