import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { User } from './user/entity';
import { AuthModule } from './auth/auth.module';
import { AnnouncesController } from './announces/announces.controller';
import { AnnouncesModule } from './announces/announces.module';
import { Announce } from './announces/entities/announce.entity';

@Module({
  imports: [
    // Base de données SQLite
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [User, Announce],
      synchronize: true, // crée les tables automatiquement
    }),

    // Prometheus exposera /metrics
    PrometheusModule.register({
      path: '/metrics',
    }),

    AuthModule,

    AnnouncesModule,
  ],
  controllers: [AnnouncesController],
})
export class AppModule {}
