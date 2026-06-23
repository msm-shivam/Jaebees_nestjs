import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CollectionResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() name: string;
  @Expose() @ApiProperty() slug: string;
  @Expose() @ApiPropertyOptional() image: string | null;
  @Expose() @ApiPropertyOptional() description: string | null;
  @Expose() @ApiProperty() isActive: boolean;
  @Expose() @ApiProperty() createdAt: Date;
  @Expose() @ApiProperty() updatedAt: Date;
}
