import { User } from "./user";
import { Chat } from "./chat";
export interface Group {
  id: string;
  name?: string;
  participants: User[];
  chats: Chat[];
}
