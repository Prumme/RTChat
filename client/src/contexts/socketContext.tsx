import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "./userContext";

interface SocketContextType {
  chatSocket: Socket | null;
  groupSocket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({
  chatSocket: null,
  groupSocket: null,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [chatSocket, setChatSocket] = useState<Socket | null>(null);
  const [groupSocket, setGroupSocket] = useState<Socket | null>(null);
  const { token } = useUser();

  useEffect(() => {
    if (!token) return;

    const newChatSocket = io(import.meta.env.VITE_SERVER_URL, {
      auth: {
        token,
      },
    });

    const newGroupSocket = io(import.meta.env.VITE_SERVER_URL + "/groups", {
      auth: {
        token,
      },
    });

    setChatSocket(newChatSocket);
    setGroupSocket(newGroupSocket);

    return () => {
      newChatSocket.close();
      newGroupSocket.close();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ chatSocket, groupSocket }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
