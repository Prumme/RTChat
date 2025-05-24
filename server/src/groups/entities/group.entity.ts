import { Chat } from 'src/chats/entities/chat.entity';
import { User } from 'src/users/entities/user';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinTable,
  ManyToOne,
  ManyToMany,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name?: string;

  @ManyToMany(() => User, (user) => user.groups)
  @JoinTable({
    name: 'group_participants',
    joinColumn: {
      name: 'groupId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  participants: User[];

  @OneToMany(() => Chat, (chat) => chat.group)
  chats: Chat[];

  @CreateDateColumn()
  createdAt: Date;
}
