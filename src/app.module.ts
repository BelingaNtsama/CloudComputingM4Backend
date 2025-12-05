import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { User } from './user/entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Base de données SQLite
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [User],
      synchronize: true, // crée les tables automatiquement
    }),

    // Prometheus exposera /metrics
    PrometheusModule.register({
      path: '/metrics',
    }),

    AuthModule,
  ],
})
export class AppModule {}
