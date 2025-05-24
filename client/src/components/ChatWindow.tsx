import { useEffect, useState, useRef } from "react";
import Message from "./Message";
import LoadinChat from "./LoadinChat";
import { useGroup } from "../contexts/groupContext";
import { Group } from "../types/group";
import { User, Users } from "lucide-react";
import { useUser } from "../contexts/userContext";
import { Chat } from "../types/chat";
import { useSocket } from "../contexts/socketContext";

export default function ChatWindow() {
  const [loading, setLoading] = useState<boolean>(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const { chatSocket } = useSocket();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { group } = useGroup();
  const { user, token } = useUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats, typingUsers]);

  useEffect(() => {
    if (!chatSocket || !group) return;

    // Rejoindre le chat du groupe
    chatSocket.emit("joinChat", group.id);

    // Écouter les nouveaux messages
    chatSocket.on("newMessage", (message: Chat) => {
      setChats((prevChats) => [...prevChats, message]);
    });

    chatSocket.on("userTyping", ({ user, isTyping }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(user.pseudo);
        } else {
          newSet.delete(user.pseudo);
        }
        return newSet;
      });
    });

    return () => {
      chatSocket.emit("leaveChat", group.id);
      chatSocket.off("newMessage");
      chatSocket.off("userTyping");
    };
  }, [chatSocket, group]);

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/chats/groups/${group!.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setChats(data);
      setLoading(false);
    };

    if (group) {
      fetchMessages();
    }
  }, [group, token]);

  const getGroupName = (group: Group): string => {
    const usernamesJoined = group.participants
      .filter((u) => u.id !== user?.id)
      .map((u) => u.pseudo)
      .join(", ");
    return `${group.name} (${usernamesJoined})`;
  };

  if (loading) {
    return <LoadinChat></LoadinChat>;
  }

  const handleTyping = (isTyping: boolean) => {
    if (!chatSocket || !user || !group) return;

    chatSocket.emit("typing", {
      chatId: group.id,
      user: {
        pseudo: user.pseudo,
      },
      isTyping,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const message = formData.get("message") as string;

    if (!chatSocket || !user || !group) return;

    try {
      // Envoyer le message via WebSocket
      chatSocket.emit("sendMessage", {
        chatId: group.id,
        message,
        user: {
          sub: user.id,
          email: user.email,
          pseudo: user.pseudo,
          avatar: user.avatar,
        },
      });

      // Réinitialiser le formulaire
      (e.target as HTMLFormElement).reset();
      handleTyping(false);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  return (
    <main className="flex-1 flex flex-col justify-start rounded-r-lg p-8 pt-0 relative z-0">
      {group && (
        <div className="w-4/5 mx-auto h-4 py-5 bg-white/30 backdrop-blur-sm shadow-sm flex justify-center items-center sticky top-0 z-10 rounded-b-lg">
          {group.participants.length > 2 ? (
            <Users className="w-6 h-6 text-base-content/50 mr-2" />
          ) : (
            <User className="w-6 h-6 text-base-content/50 mr-2" />
          )}
          {group.name ? (
            <span>{getGroupName(group)}</span>
          ) : (
            <span>{`${group.participants
              .filter((u) => u.id !== user?.id)
              .map((u) => u.pseudo)
              .join(", ")}`}</span>
          )}
        </div>
      )}

      <div className="space-y-6 overflow-y-auto pr-4 p-8 pt-2 pb-0 grow">
        {chats.length > 0 &&
          chats.map((chat) => <Message key={chat.id} message={chat} />)}

        {chats.length === 0 && (
          <div className="flex flex-col justify-center items-center h-full">
            <p className="text-base-content">Aucun message</p>
            <p className="text-base-content/50">Entamez une conversation</p>
          </div>
        )}

        {typingUsers.size > 0 && (
          <div className="text-sm text-base-content/50 italic animate-bounce">
            {Array.from(typingUsers).join(", ")}{" "}
            {typingUsers.size === 1
              ? "est en train d'écrire..."
              : "sont en train d'écrire..."}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSubmit}
        className="mt-6 flex items-center gap-3 sticky bottom-8 left-0 right-0"
      >
        <input
          name="message"
          type="text"
          placeholder="Écrire un message..."
          className="input input-bordered w-full rounded-lg"
          onFocus={() => handleTyping(true)}
          onBlur={() => handleTyping(false)}
          onChange={(e) => handleTyping(e.target.value.length > 0)}
        />
        <button className="btn btn-primary rounded-lg">Envoyer</button>
      </form>
    </main>
  );
}
