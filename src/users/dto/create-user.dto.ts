import { IsEmail, IsStrongPassword, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsStrongPassword()
  @MaxLength(254)
  password: string;
}
