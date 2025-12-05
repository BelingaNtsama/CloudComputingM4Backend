import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // <-- indispensable
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule], // si utilisé ailleurs
})
export class UserModule {}
