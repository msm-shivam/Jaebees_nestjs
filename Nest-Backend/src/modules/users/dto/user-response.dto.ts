import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  firstName: string;

  @Expose()
  @ApiProperty()
  lastName: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiPropertyOptional()
  mobile: string | null;

  @Expose()
  @ApiProperty()
  isEmailVerified: boolean;

  @Expose()
  @ApiProperty()
  isActive: boolean;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}
