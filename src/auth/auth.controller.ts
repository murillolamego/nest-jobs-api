import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { SignInDto } from './dto/auth.dto';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { UserSanitizedEntity } from '../users/entities/user.entity';
import { RefreshTokenGuard } from './guards/refreshToken.guard';

type SessionRequest = Request & { user: UserSanitizedEntity };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get('sign-out')
  signOut(@Req() req: SessionRequest) {
    return this.authService.signOut(req.user['sub']);
  }

  @ApiBearerAuth()
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req: SessionRequest) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
