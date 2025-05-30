import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user';
import { Group } from 'src/groups/entities/group.entity';
import { UserPayload } from 'src/common/guards/auth.guard';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createChatDto: CreateChatDto, sender: UserPayload) {
    const user = await this.userRepository.findOne({
      where: { id: sender.sub },
    });

    if (!user) throw new NotFoundException('User not found');

    const group = await this.groupRepository.findOne({
      where: { id: createChatDto.groupId },
    });

    if (!group) throw new NotFoundException('Group not found');

    const chat = this.chatRepository.create({
      message: createChatDto.message,
      sender: user,
      group,
    });

    return this.chatRepository.save(chat);
  }

  findAll() {
    return this.chatRepository.find();
  }

  findOne(id: string) {
    return this.chatRepository.findOne({ where: { id } });
  }

  async findByGroup(groupId: string, page: number = 1, limit: number = 20) {
    const [messages, total] = await this.chatRepository.findAndCount({
      where: { group: { id: groupId } },
      order: { createdAt: 'DESC' },
      relations: ['sender'],
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      messages: messages.reverse(),
      total,
      hasMore: total > page * limit,
    };
  }

  async update(id: string, updateChatDto: UpdateChatDto) {
    await this.chatRepository.update(id, {
      message: updateChatDto.message,
      isEdited: true,
    });
    return this.chatRepository.findOne({ where: { id } });
  }

  remove(id: string) {
    return this.chatRepository.delete(id);
  }
}
