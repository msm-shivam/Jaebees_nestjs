import { IsString, IsEmail, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Sports Gear Ltd' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'SUP001' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ example: 'contact@sportsgear.com' })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+91-9876543210' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone: string;

  @ApiPropertyOptional({ example: '123 Sports Street, Mumbai' })
  @IsOptional()
  @IsString()
  address: string;

  @ApiPropertyOptional({ example: 'Rahul Sharma' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  contactPerson: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
