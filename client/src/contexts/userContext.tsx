import React, { createContext, useState, useEffect, useContext } from "react";
import { User } from "../types/user";

const UserContext = createContext<{
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  token: string | undefined | null;
  setToken: React.Dispatch<React.SetStateAction<string | undefined | null>>;
}>({
  user: null,
  setUser: () => {},
  token: undefined,
  setToken: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | undefined | null>(undefined);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (
      token &&
      userData &&
      userData !== "undefined" &&
      token !== "undefined"
    ) {
      setUser(JSON.parse(userData));
      setToken(token);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, token, setToken }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
