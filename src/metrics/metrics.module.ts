// prometheus.module.ts
import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsService } from './metrics.service';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics', // endpoint exposé pour Prometheus
    }),
  ],
  providers: [MetricsService],
})
export class MetricsModule {}
