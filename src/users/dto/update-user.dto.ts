import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

import { PartialType } from '@nestjs/mapped-types';

import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsStrongPassword()
  @MaxLength(50)
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  displayName?: string;

  @IsOptional()
  @IsString()
  @Length(60)
  refreshToken?: string;
}
