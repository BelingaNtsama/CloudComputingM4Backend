import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entity';
import { Counter, Histogram } from 'prom-client';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { jwtConstants } from './constants';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly authRequestsTotal: Counter<string>;
  private readonly authRequestDuration: Histogram<string>;

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {
    this.authRequestsTotal = new Counter({
      name: 'auth_requests_total',
      help: 'Nombre total de requêtes Auth',
      labelNames: ['method', 'route', 'status'],
    });

    this.authRequestDuration = new Histogram({
      name: 'auth_request_duration_ms',
      help: 'Durée des requêtes Auth en ms',
      labelNames: ['method', 'route'],
      buckets: [50, 100, 200, 500, 1000],
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const start = Date.now();
    this.logger.log(`Validation utilisateur avec email: ${email}`);

    try {
      const user = await this.userRepo.findOne({
        where: { email },
        relations: ['announces'],
      });
      const duration = Date.now() - start;

      if (user && (await bcrypt.compare(password, user.password))) {
        this.authRequestsTotal.inc({
          method: 'POST',
          route: '/auth/login',
          status: '200',
        });
        this.authRequestDuration.observe(
          { method: 'POST', route: '/auth/login' },
          duration,
        );
        this.logger.log(`Utilisateur ${email} validé avec succès`);
        return user;
      }

      this.authRequestsTotal.inc({
        method: 'POST',
        route: '/auth/login',
        status: '401',
      });
      this.authRequestDuration.observe(
        { method: 'POST', route: '/auth/login' },
        duration,
      );
      this.logger.warn(`Échec de validation pour utilisateur ${email}`);
      return null;
    } catch (err) {
      this.logger.error(`Erreur validateUser: ${err.message}`, err.stack);
      throw new InternalServerErrorException(
        'Erreur lors de la validation utilisateur',
      );
    }
  }

  async login(user: User, res: Response): Promise<void> {
    this.logger.log(`Login utilisateur #${user.id} (${user.email})`);
    try {
      const payload = { sub: user.id, email: user.email };
      const token = await this.jwtService.signAsync(payload, {
        secret: jwtConstants.secret,
        expiresIn: '1h',
      });

      res.cookie('jwt', token, {
        httpOnly: true,
        secure: true, // ⚠️ mettre true en prod avec HTTPS
        sameSite: 'strict',
        maxAge: 3600000,
      });
      console.log(token);

      const { password, ...userWithoutPassword } = user;

      res.send({
        message: 'Login successful',
        user: userWithoutPassword,
        announces: user.announces || [],
      });

      this.logger.log(`Login réussi pour utilisateur #${user.id}`);
    } catch (err) {
      this.logger.error(`Erreur login: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Erreur lors du login');
    }
  }

  async registerUser(
    name: string,
    email: string,
    password: string,
  ): Promise<User> {
    const start = Date.now();
    this.logger.log(`Inscription nouvel utilisateur: ${email}`);

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = this.userRepo.create({
        name,
        email,
        password: hashedPassword,
      });
      const saved = await this.userRepo.save(user);
      const duration = Date.now() - start;

      this.authRequestsTotal.inc({
        method: 'POST',
        route: '/auth/register',
        status: '201',
      });
      this.authRequestDuration.observe(
        { method: 'POST', route: '/auth/register' },
        duration,
      );

      this.logger.log(
        `Utilisateur ${email} inscrit avec succès (id: ${saved.id})`,
      );
      return saved;
    } catch (err) {
      this.logger.error(`Erreur registerUser: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Erreur lors de l’inscription');
    }
  }
}
