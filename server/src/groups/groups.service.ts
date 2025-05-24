import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { In, Repository } from 'typeorm';

import { User } from 'src/users/entities/user';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createGroupDto: CreateGroupDto) {
    const users = await this.userRepository.findBy({
      id: In(createGroupDto.participants),
    });

    if (users.length !== createGroupDto.participants.length) {
      const foundUserIds = users.map((user) => user.id);
      const missingUserIds = createGroupDto.participants.filter(
        (id) => !foundUserIds.includes(id),
      );
      throw new NotFoundException(
        `Les utilisateurs suivants n'ont pas été trouvés: ${missingUserIds.join(', ')}`,
      );
    }

    const group = this.groupRepository.create({
      participants: users,
    });

    return this.groupRepository.save(group);
  }

  findAll() {
    return this.groupRepository.find({
      relations: ['participants'],
    });
  }

  findOne(id: string) {
    return this.groupRepository.findOne({
      where: { id },
      relations: ['participants'],
    });
  }

  async update(id: string, updateGroupDto: UpdateGroupDto) {
    const group = this.groupRepository.findOne({ where: { id } });

    if (updateGroupDto.participants) {
      const users = await this.userRepository.findBy({
        id: In(updateGroupDto.participants),
      });

      if (!group) {
        throw new NotFoundException('Group not found');
      }

      this.groupRepository.update(id, {
        participants: users,
      });
      return this.groupRepository.findOne({ where: { id } });
    }
  }

  remove(id: string) {
    return this.groupRepository.delete(id);
  }
}
