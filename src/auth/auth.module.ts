import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy copy';
import { UsersService } from '../users/users.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    UsersService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
