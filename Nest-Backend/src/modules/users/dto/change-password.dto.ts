import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#\-_])[A-Za-z\d@$!%*?&^#\-_]{8,}$/;

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(PASSWORD_REGEX, {
    message: 'New password must meet complexity requirements.',
  })
  newPassword: string;
}
