import { Chat } from 'src/chats/entities/chat.entity';
import { Group } from 'src/groups/entities/group.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: '#000000' })
  color: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ unique: true })
  pseudo: string;

  @OneToMany(() => Chat, (chat) => chat.sender)
  chats: Chat[];

  @ManyToMany(() => Group, (group) => group.participants)
  groups: Group[];
}
