import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

class LinkedBrand {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() name: string;
}

@Exclude()
export class CategoryResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() name: string;
  @Expose() @ApiProperty() slug: string;
  @Expose() @ApiPropertyOptional() image: string | null;
  @Expose() @ApiPropertyOptional() description: string | null;
  @Expose() @ApiProperty() sortOrder: number;
  @Expose() @ApiProperty() isActive: boolean;
  @Expose() @ApiProperty({ type: [LinkedBrand], description: 'Linked brands' })
  @Type(() => LinkedBrand)
  brands: LinkedBrand[];
  @Expose() @ApiProperty() createdAt: Date;
  @Expose() @ApiProperty() updatedAt: Date;
}
