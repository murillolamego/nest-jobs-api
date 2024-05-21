import * as bcrypt from 'bcrypt';

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';
import { SignInDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signIn({ email, password }: SignInDto) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          email,
          deletedAt: null,
        },
      });

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        throw new UnauthorizedException();
      }

      const payload = { sub: user.id };

      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`user with email ${email} not found`);
        }
      }
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(
          `invalid credentials provided, please try again`,
        );
      }
      throw new InternalServerErrorException();
    }
  }
}
