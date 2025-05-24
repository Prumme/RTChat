import { useUser } from "../contexts/userContext";
import { Chat } from "../types/chat";

interface MessageProps {
  message: Chat;
}

const Message = ({ message: { message, sender, createdAt } }: MessageProps) => {
  const { user } = useUser();

  const getDateFormat = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const isSameDay =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isSameDay) {
      // Retourne uniquement l'heure si c'est aujourd'hui
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      // Retourne jour/mois/année sinon
      return date.toLocaleDateString("fr-FR");
    }
  };

  return (
    <div
      className={sender.id !== user?.id ? "chat chat-start" : "chat chat-end"}
    >
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img
            alt={`${sender.pseudo}'s profile picture`}
            src={
              sender.avatar
                ? `http://localhost:3000/avatar/${sender.avatar}`
                : "/assets/default-avatar.jpg"
            }
          />
        </div>
      </div>
      <div className="chat-header" style={{ color: sender.color }}>
        {sender.pseudo}
        <time className="text-xs opacity-50 text-black">
          {getDateFormat(createdAt)}
        </time>
      </div>
      <div className="chat-bubble chat-bubble-neutral">{message}</div>
    </div>
  );
};

export default Message;
