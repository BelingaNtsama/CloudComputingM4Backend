import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entity';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class AuthService {
  private readonly authRequestsTotal: Counter<string>;
  private readonly authRequestDuration: Histogram<string>;

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
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
    const user = await this.userRepo.findOne({ where: { email } });
    const duration = Date.now() - start;

    if (user && user.password === password) {
      this.authRequestsTotal.inc({
        method: 'POST',
        route: '/auth/login',
        status: '200',
      });
      this.authRequestDuration.observe(
        { method: 'POST', route: '/auth/login' },
        duration,
      );
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
    return null;
  }

  async registerUser(
    name: string,
    email: string,
    password: string,
  ): Promise<User> {
    const start = Date.now();
    const user = this.userRepo.create({ name, email, password });
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

    return saved;
  }
}
