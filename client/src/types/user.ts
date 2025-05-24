export interface User {
  id: string;
  pseudo: string;
  email: string;
  avatar?: string;
  color: string;
  //   groups: {
  //     id: string;
  //     name?: string;
  //     participants: {
  //       id: string;
  //       pseudo: string;
  //       email: string;
  //     }[];
  //   }[];
  createdAt: string;
  updatedAt: string;
}
