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
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
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

      const tokens = await this.getTokens(user.id, user.displayName);

      await this.setRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`user with email ${email} not found`);
        }
      }
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(
          'invalid credentials provided, please try again',
        );
      }
      throw new InternalServerErrorException();
    }
  }

  async signOut(userId: string) {
    return this.usersService.update(userId, { refreshToken: null });
  }

  async setRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(userId: string, displayName: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          displayName,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          displayName,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.unsafeFindOneById(userId);
    console.log('REQ REF', refreshToken);
    console.log('USER REF', user.refreshToken);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException(
        'invalid credentials provided, please try again',
      );
    }
    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new UnauthorizedException(
        'invalid credentials provided, please try again',
      );
    }
    const tokens = await this.getTokens(user.id, user.displayName);
    await this.setRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }
}
