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

export class RegisterDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  mobile?: string;

  @ApiProperty({ example: 'Str0ng@Pass!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must contain at least one uppercase, one lowercase, one number, and one special character.',
  })
  password: string;
}
