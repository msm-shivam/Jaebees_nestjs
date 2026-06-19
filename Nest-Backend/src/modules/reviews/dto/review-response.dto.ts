import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
class ReviewUserDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() firstName: string;
  @Expose() @ApiProperty() lastName: string;
}

@Exclude()
class ReviewProductDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() name: string;
  @Expose() @ApiProperty() slug: string;
}

@Exclude()
class ReviewImageDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() imageUrl: string;
  @Expose() @ApiProperty() sortOrder: number;
}

@Exclude()
export class ReviewResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() rating: number;
  @Expose() @ApiPropertyOptional() title?: string;
  @Expose() @ApiPropertyOptional() comment?: string;
  @Expose() @ApiProperty() status: string;
  @Expose() @ApiProperty() isVerifiedPurchase: boolean;
  @Expose() @ApiProperty() helpfulCount: number;

  @Expose()
  @ApiProperty({ example: 'John Doe' })
  userName: string;

  @Expose()
  @ApiProperty({ example: 'Nike Air Zoom Pegasus 41' })
  productName: string;

  @Expose()
  @ApiProperty({ type: ReviewUserDto })
  @Type(() => ReviewUserDto)
  user: ReviewUserDto;

  @Expose()
  @ApiProperty({ type: ReviewProductDto })
  @Type(() => ReviewProductDto)
  product: ReviewProductDto;

  @Expose()
  @ApiProperty({ type: [ReviewImageDto] })
  @Type(() => ReviewImageDto)
  images: ReviewImageDto[];

  @Expose() @ApiProperty() createdAt: Date;
}
