import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
class AttributeValueItemDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() value: string;
  @Expose() @ApiProperty() slug: string;
  @Expose() @ApiProperty() sortOrder: number;
}

@Exclude()
export class AttributeResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() name: string;
  @Expose() @ApiProperty() slug: string;
  @Expose() @ApiProperty() isFilterable: boolean;
  @Expose() @ApiProperty() isRequired: boolean;
  @Expose() @ApiProperty() sortOrder: number;
  @Expose() @ApiProperty() createdAt: Date;
  @Expose() @ApiProperty() updatedAt: Date;
  @Expose() @ApiPropertyOptional({ type: [AttributeValueItemDto] })
  @Type(() => AttributeValueItemDto)
  values?: AttributeValueItemDto[];
}
