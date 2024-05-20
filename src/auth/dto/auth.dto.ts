import { IsEmail, IsStrongPassword, MaxLength } from 'class-validator';

export class SignInDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsStrongPassword()
  @MaxLength(254)
  password: string;
}
