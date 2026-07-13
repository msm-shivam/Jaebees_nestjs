import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@Expose()
export class SliderResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiPropertyOptional() description: string | null;
  @Expose() @ApiPropertyOptional() images: string[] | null;
  @Expose() @ApiProperty() createdAt: Date;
  @Expose() @ApiProperty() updatedAt: Date;
}
