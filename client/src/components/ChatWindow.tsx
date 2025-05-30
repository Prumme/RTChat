import { useEffect, useState, useRef } from "react";
import Message from "./Message";
import LoadinChat from "./LoadinChat";
import { useGroup } from "../contexts/groupContext";
import { Group } from "../types/group";
import { User, Users } from "lucide-react";
import { useUser } from "../contexts/userContext";
import { Chat } from "../types/chat";
import { useSocket } from "../contexts/socketContext";
import _ from "lodash";

export default function ChatWindow() {
  const [loading, setLoading] = useState<boolean>(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [reachedTop, setReachedTop] = useState<boolean>(false);
  const [canLoadMore, setCanLoadMore] = useState<boolean>(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] =
    useState<boolean>(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { chatSocket } = useSocket();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { group } = useGroup();
  const { user, token } = useUser();

  const scrollToBottom = () => {
    if (!shouldScrollToBottom) return;

    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  // Gestion du scroll automatique
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container || isLoadingMore) return;

    // Si on est proche du bas ou si c'est un nouveau message
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;

    if (shouldScrollToBottom || isNearBottom) {
      scrollToBottom();
    }
  }, [chats, shouldScrollToBottom, isLoadingMore]);

  // Détection du scroll manuel
  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;
    setShouldScrollToBottom(isNearBottom);

    // Chargement de l'historique
    if (
      !isLoadingMore &&
      !reachedTop &&
      canLoadMore &&
      container.scrollTop <= 100
    ) {
      loadMoreMessages();
    }
  };

  const loadMoreMessages = async () => {
    if (
      !chatContainerRef.current ||
      isLoadingMore ||
      !hasMore ||
      reachedTop ||
      !canLoadMore
    )
      return;

    setIsLoadingMore(true);
    await fetchMessages(page + 1);
  };

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      const throttledHandleScroll = _.throttle(handleScroll, 200);
      container.addEventListener("scroll", throttledHandleScroll);
      return () => {
        container.removeEventListener("scroll", throttledHandleScroll);
        throttledHandleScroll.cancel();
      };
    }
  }, [page, isLoadingMore, hasMore, reachedTop, canLoadMore]);

  useEffect(() => {
    if (!chatSocket || !group) return;

    chatSocket.emit("joinChat", group.id);

    chatSocket.on("newMessage", (message: Chat) => {
      setChats((prevChats) => [...prevChats, message]);
    });

    chatSocket.on(
      "userTyping",
      ({ user, isTyping }: { user: { pseudo: string }; isTyping: boolean }) => {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          if (isTyping) {
            newSet.add(user.pseudo);
          } else {
            newSet.delete(user.pseudo);
          }
          return newSet;
        });
      }
    );

    return () => {
      chatSocket.emit("leaveChat", group.id);
      chatSocket.off("newMessage");
      chatSocket.off("userTyping");
    };
  }, [chatSocket, group]);

  useEffect(() => {
    if (group) {
      setPage(1);
      setHasMore(true);
      setReachedTop(false);
      setCanLoadMore(false);
      fetchMessages(1);
      setLoading(false);

      // Autoriser le chargement après 1 seconde
      const timer = setTimeout(() => {
        setCanLoadMore(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [group]);

  const fetchMessages = async (pageNumber: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/chats/groups/${
          group!.id
        }?page=${pageNumber}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (pageNumber === 1) {
        setChats(data.messages);
        setShouldScrollToBottom(true);
      } else {
        const currentScrollTop = chatContainerRef.current?.scrollTop || 0;
        const currentScrollHeight = chatContainerRef.current?.scrollHeight || 0;

        const newMessages = [...data.messages, ...chats];
        setChats(newMessages);
        setShouldScrollToBottom(false);

        setTimeout(() => {
          if (chatContainerRef.current) {
            const newScrollHeight = chatContainerRef.current.scrollHeight;
            const scrollDiff = newScrollHeight - currentScrollHeight;
            chatContainerRef.current.scrollTop = currentScrollTop + scrollDiff;
          }
        }, 0);
      }

      setHasMore(data.hasMore);
      setPage(pageNumber);
      setReachedTop(!data.hasMore);
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

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

    if (message.length === 0) return;

    if (!chatSocket || !user || !group) return;

    try {
      setShouldScrollToBottom(true);
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

      <div
        ref={chatContainerRef}
        className="space-y-6 overflow-y-auto pr-4 p-8 pt-2 pb-0 grow"
      >
        {reachedTop && chats.length > 0 && (
          <div className="text-center text-base-content/50 py-4">
            Vous êtes au début de la conversation
          </div>
        )}

        {isLoadingMore && (
          <div className="text-center py-4">
            <span className="loading loading-dots loading-md"></span>
          </div>
        )}

        {chats.length > 0 &&
          chats.map((chat) => <Message key={chat.id} message={chat} />)}

        {chats.length === 0 && (
          <div className="z-10 flex flex-col justify-center items-center h-full">
            <p className="text-base-content">Aucun message</p>
            <p className="text-base-content/50">Entamez la conversation</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.size > 0 && (
        <div className="text-sm text-base-content/50 italic animate-bounce mb-2">
          {Array.from(typingUsers).join(", ")}{" "}
          {typingUsers.size === 1
            ? "est en train d'écrire..."
            : "sont en train d'écrire..."}
        </div>
      )}

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
