import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { User } from 'src/users/entities/user';
import { Group } from 'src/groups/entities/group.entity';
import { ChatGateway } from './chat.gateway';
import { GroupGateway } from 'src/groups/group.gateway';
@Module({
  imports: [TypeOrmModule.forFeature([Chat, User, Group])],
  controllers: [ChatsController],
  providers: [ChatsService, ChatGateway, GroupGateway],
})
export class ChatsModule {}
