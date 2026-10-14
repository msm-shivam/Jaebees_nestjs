import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#\-_])[A-Za-z\d@$!%*?&^#\-_]{8,}$/;

export class ResetPasswordDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiPropertyOptional({ example: '123456' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(10)
  otp?: string;

  @ApiPropertyOptional({ example: 'eyJhbGciOi...' })
  @IsOptional()
  @IsString()
  resetToken?: string;

  @ApiProperty({ example: 'NewStr0ng@Pass!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must contain at least one uppercase, one lowercase, one number, and one special character.',
  })
  newPassword: string;
}
