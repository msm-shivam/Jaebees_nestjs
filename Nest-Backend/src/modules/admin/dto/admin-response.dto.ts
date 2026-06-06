import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class RoleDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() name: string;
  @Expose() @ApiProperty() slug: string;
}

@Exclude()
export class AdminResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  isActive: boolean;

  @Expose()
  @ApiPropertyOptional({ type: () => [RoleDto] })
  @Type(() => RoleDto)
  roles: RoleDto[];

  @Expose()
  @ApiPropertyOptional()
  lastLoginAt: Date | null;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}
