import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

class LinkedCategory {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() name: string;
}

@Exclude()
export class BrandResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() name: string;
  @Expose() @ApiProperty() slug: string;
  @Expose() @ApiPropertyOptional() logo: string | null;
  @Expose() @ApiPropertyOptional() description: string | null;
  @Expose() @ApiProperty() isActive: boolean;
  @Expose() @ApiProperty({ type: [LinkedCategory], description: 'Linked categories' })
  @Type(() => LinkedCategory)
  categories: LinkedCategory[];
  @Expose() @ApiProperty() createdAt: Date;
  @Expose() @ApiProperty() updatedAt: Date;
}
