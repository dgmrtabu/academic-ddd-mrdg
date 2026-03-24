import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from '../../../contexts/identity-access/auth/application/auth.service';
import { Public } from '../../../contexts/identity-access/auth/infrastructure/public.decorator';

const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME ?? 'access_token';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(
      body.username?.trim() ?? '',
      body.password ?? '',
    );

    // 🔥 CONFIG CORRECTA PARA DESARROLLO
    res.cookie(JWT_COOKIE_NAME, result.access_token, {
      httpOnly: true,
      secure: false,     // ❌ NO HTTPS
      sameSite: 'lax',   // ✅ CLAVE
      path: '/',
      maxAge: 2 * 60 * 60 * 1000,
    });

    return result;
  }
}