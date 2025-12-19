import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnouncesController } from './announces.controller';
import { AnnouncesService } from './announces.service';
import { Announce } from './entities/announce.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Announce])],
  controllers: [AnnouncesController],
  providers: [AnnouncesService],
  exports: [AnnouncesService], // important si utilisé ailleurs
})
export class AnnouncesModule {}
