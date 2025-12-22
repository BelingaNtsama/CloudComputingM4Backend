import {
  Controller,
  Post,
  Body,
  Res,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './authDto';
import { User } from 'src/user/entity';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    this.logger.log(`Tentative de login pour email: ${loginDto.email}`);
    try {
      const user = await this.authService.validateUser(
        loginDto.email,
        loginDto.password,
      );

      if (!user) {
        this.logger.warn(`Échec login: email ${loginDto.email}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      await this.authService.login(user, res);
      this.logger.log(`Login réussi pour utilisateur #${user.id}`);
    } catch (err) {
      this.logger.error(`Erreur login: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Erreur lors du login');
    }
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    this.logger.log(`Inscription nouvel utilisateur: ${registerDto.email}`);
    try {
      const user = await this.authService.registerUser(
        registerDto.name,
        registerDto.email,
        registerDto.password,
      );
      this.logger.log(
        `Utilisateur inscrit avec succès: ${user.email} (id: ${user.id})`,
      );
      return user;
    } catch (err) {
      this.logger.error(`Erreur register: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Erreur lors de l’inscription');
    }
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    this.logger.log('Déconnexion utilisateur');
    try {
      res.clearCookie('jwt');
      this.logger.log('Cookie JWT supprimé, logout réussi');
      return res.json({ message: 'Logout successful' });
    } catch (err) {
      this.logger.error(`Erreur logout: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Erreur lors du logout');
    }
  }
}
