import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Like, Repository } from 'typeorm';
import { User } from './entities/user';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { Group } from 'src/groups/entities/group.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(createUserDto: RegisterDto): Promise<User> {
    const { password, ...userData } = createUserDto;
    // Génération du hash pour le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crée l'utilisateur avec le mot de passe haché
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword, // Remplace le mot de passe par le haché
    });

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByPseudo(pseudo: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { pseudo } });
  }

  async findGroups(userId: string): Promise<Group[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['groups', 'groups.participants'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.groups;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async search(query: string): Promise<User[]> {
    const users = await this.userRepository.find({
      where: [{ pseudo: ILike(`%${query}%`) }],
      select: ['id', 'pseudo', 'avatar', 'color'],
    });
    return users;
  }

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, userData);
    return this.findOne(id);
  }
}
