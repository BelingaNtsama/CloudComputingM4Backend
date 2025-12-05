import { Injectable } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestsTotal: Counter<string>;
  private readonly httpRequestDuration: Histogram<string>;

  constructor() {
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Nombre total de requêtes HTTP',
      labelNames: ['method', 'route', 'status'],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_ms',
      help: 'Durée des requêtes HTTP en ms',
      labelNames: ['method', 'route'],
      buckets: [50, 100, 200, 300, 500, 1000],
    });
  }

  countRequest(
    method: string,
    route: string,
    status: string,
    duration: number,
  ) {
    this.httpRequestsTotal.inc({ method, route, status });
    this.httpRequestDuration.observe({ method, route }, duration);
  }
}
