import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
class ProductImageDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() imageUrl: string;
  @Expose() @ApiProperty() isPrimary: boolean;
}

@Exclude()
class LinkedProductDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() name: string;
  @Expose() @ApiProperty() slug: string;
  @Expose() @ApiProperty() status: string;
  @Expose() @ApiProperty() isActive: boolean;
  @Expose() @ApiProperty() isFeatured: boolean;
  @Expose() @ApiPropertyOptional() shortDescription: string | null;
  @Expose() @ApiPropertyOptional() brandId: string | null;
  @Expose() @ApiPropertyOptional() categoryId: string | null;
  @Expose() @ApiProperty() averageRating: number;
  @Expose() @ApiProperty() createdAt: Date;
  @Expose() @ApiProperty({ type: [ProductImageDto] })
  @Type(() => ProductImageDto)
  images: ProductImageDto[];
}

@Exclude()
export class CollectionResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() name: string;
  @Expose() @ApiProperty() slug: string;
  @Expose() @ApiPropertyOptional() image: string | null;
  @Expose() @ApiPropertyOptional() description: string | null;
  @Expose() @ApiProperty() isActive: boolean;
  @Expose() @ApiProperty() productCount: number;
  @Expose() @ApiProperty({ type: [LinkedProductDto] })
  @Type(() => LinkedProductDto)
  products: LinkedProductDto[];
  @Expose() @ApiProperty() createdAt: Date;
  @Expose() @ApiProperty() updatedAt: Date;
}
