import { Group } from "./group";
import { User } from "./user";

export interface Chat {
  id: string;
  message: string;
  sender: User;
  group: Group;
  createdAt: string;
  updatedAt: string;
}
