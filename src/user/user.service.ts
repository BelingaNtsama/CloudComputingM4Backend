import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class UserService {
  private readonly httpRequestsTotal: Counter<string>;
  private readonly httpRequestDuration: Histogram<string>;

  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Nombre total de requêtes HTTP',
      labelNames: ['method', 'route', 'status'],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_ms',
      help: 'Durée des requêtes HTTP en ms',
      labelNames: ['method', 'route'],
      buckets: [50, 100, 200, 500, 1000],
    });
  }

  async findAll() {
    const start = Date.now();
    const users = await this.repo.find();
    const duration = Date.now() - start;

    this.httpRequestsTotal.inc({
      method: 'GET',
      route: '/users',
      status: '200',
    });
    this.httpRequestDuration.observe(
      { method: 'GET', route: '/users' },
      duration,
    );

    return users;
  }

  async findOne(id: number) {
    const start = Date.now();
    const user = await this.repo.findOne({ where: { id } });
    const duration = Date.now() - start;
    const status = user ? '200' : '404';

    this.httpRequestsTotal.inc({
      method: 'GET',
      route: `/users/${id}`,
      status,
    });
    this.httpRequestDuration.observe(
      { method: 'GET', route: `/users/${id}` },
      duration,
    );
    return user;
  }
}
