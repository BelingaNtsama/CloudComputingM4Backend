import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnouncesController } from './announces.controller';
import { AnnouncesService } from './announces.service';
import { Announce } from './entities/announce.entity';
import { SupabaseService } from 'src/supabase/supabase.service';

@Module({
  imports: [TypeOrmModule.forFeature([Announce])],
  controllers: [AnnouncesController],
  providers: [AnnouncesService, SupabaseService],
  exports: [AnnouncesService], // important si utilisé ailleurs
})
export class AnnouncesModule {}
