import React, { createContext, useContext, useState } from "react";
import { Group } from "../types/group";

const GroupContext = createContext<{
  group: Group | null;
  setGroup: React.Dispatch<React.SetStateAction<Group | null>>;
}>({
  group: null,
  setGroup: () => {},
});

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const [group, setGroup] = useState<Group | null>(null);

  return (
    <GroupContext.Provider value={{ group, setGroup }}>
      {children}
    </GroupContext.Provider>
  );
}

export const useGroup = () => useContext(GroupContext);
