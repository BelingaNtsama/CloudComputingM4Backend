import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../user/entity';
import { LoginDto } from './authDto';
import { RegisterDto } from './authDto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<User | string> {
    console.log('LOGIN REQUEST:', loginDto);
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (user) {
      return user;
    }
    return 'Invalid credentials';
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    return this.authService.registerUser(
      registerDto.name,
      registerDto.email,
      registerDto.password,
    );
  }
}
