import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#\-_])[A-Za-z\d@$!%*?&^#\-_]{8,}$/;

export class CreateAdminDto {
  @ApiProperty({ example: 'Jane Admin' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'jane.admin@sport.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;

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
