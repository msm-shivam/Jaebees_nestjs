import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsNumber, IsUrl } from 'class-validator';

export class UpdateStoreSettingsDto {
  @ApiProperty({ example: 'Sport Ecom', required: false })
  @IsOptional()
  @IsString()
  storeName?: string;

  @ApiProperty({ example: "India's Sports Marketplace", required: false })
  @IsOptional()
  @IsString()
  storeTagline?: string;

  @ApiProperty({ example: 'support@sportecom.com', required: false })
  @IsOptional()
  @IsEmail()
  storeEmail?: string;

  @ApiProperty({ example: 'help@sportecom.com', required: false })
  @IsOptional()
  @IsEmail()
  supportEmail?: string;

  @ApiProperty({ example: '+91XXXXXXXXXX', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '+91XXXXXXXXXX', required: false })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiProperty({ example: 'https://sportecom.com', required: false })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiProperty({ example: 'Store Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Address Line 1', required: false })
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @ApiProperty({ example: 'Address Line 2', required: false })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ example: 'Delhi', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Delhi', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: 'India', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: '110001', required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ example: 28.6139, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: 77.2090, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class UpdateSocialLinksDto {
  @ApiProperty({ example: 'https://facebook.com/sportecom', required: false })
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiProperty({ example: 'https://instagram.com/sportecom', required: false })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiProperty({ example: 'https://twitter.com/sportecom', required: false })
  @IsOptional()
  @IsString()
  twitter?: string;

  @ApiProperty({ example: 'https://youtube.com/sportecom', required: false })
  @IsOptional()
  @IsString()
  youtube?: string;

  @ApiProperty({ example: 'https://linkedin.com/company/sportecom', required: false })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiProperty({ example: 'https://t.me/sportecom', required: false })
  @IsOptional()
  @IsString()
  telegram?: string;

  @ApiProperty({ example: 'https://wa.me/sportecom', required: false })
  @IsOptional()
  @IsString()
  whatsapp?: string;
}

export class UpdateEmailConfigDto {
  @ApiProperty({ example: 'Sport Ecom', required: false })
  @IsOptional()
  @IsString()
  fromName?: string;

  @ApiProperty({ example: 'support@sportecom.com', required: false })
  @IsOptional()
  @IsEmail()
  fromEmail?: string;

  @ApiProperty({ example: 'help@sportecom.com', required: false })
  @IsOptional()
  @IsEmail()
  replyToEmail?: string;
}

export class UpdateBusinessInfoDto {
  @ApiProperty({ example: 'Sport Ecom Private Limited', required: false })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ example: '07AAAAA1111A1Z1', required: false })
  @IsOptional()
  @IsString()
  gstNumber?: string;

  @ApiProperty({ example: 'ABCDE1234F', required: false })
  @IsOptional()
  @IsString()
  panNumber?: string;

  @ApiProperty({ example: 'U11111DL2026PTC111111', required: false })
  @IsOptional()
  @IsString()
  cinNumber?: string;

  @ApiProperty({ example: 'State Bank of India', required: false })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiProperty({ example: 'SBIN0000001', required: false })
  @IsOptional()
  @IsString()
  ifscCode?: string;
}
