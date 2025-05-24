import { Group } from 'src/groups/entities/group.entity';
import { User } from 'src/users/entities/user';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinTable,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  message: string;

  @ManyToOne(() => User, (user) => user.chats)
  @JoinTable()
  sender: User;

  @ManyToOne(() => Group, (group) => group.chats)
  @JoinTable()
  group: Group;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isEdited: boolean;
}
