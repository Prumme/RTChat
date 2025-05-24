// src/minio/minio.module.ts
import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { AvatarController } from './avatar.controller';
import { UserService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [MinioService],
  controllers: [AvatarController],
  imports: [UsersModule],
  exports: [MinioService],
})
export class MinioModule {}
