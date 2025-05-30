import { Users } from "lucide-react";
import ChatSidebar from "../components/ChatSideBar";
import ChatWindow from "../components/ChatWindow";
import { useGroup } from "../contexts/groupContext";

export default function ChatLayout() {
  const { group } = useGroup();

  return (
    <div className="flex h-full overflow-scroll">
      <ChatSidebar />
      {group ? (
        <ChatWindow />
      ) : (
        <main className="flex-1 flex flex-col items-center justify-center h-full w-full text-center px-4">
          <div className="bg-sky-100 text-sky-600 rounded-full p-4 mb-4 shadow-sm">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold">Aucun groupe sélectionné</h2>
          <p className="text-sm text-gray-500 mt-2">
            Veuillez choisir un groupe dans la barre latérale pour commencer à
            discuter.
          </p>
        </main>
      )}
    </div>
  );
}
