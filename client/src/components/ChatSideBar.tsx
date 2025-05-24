import { Search, Plus } from "lucide-react";
import { useGroup } from "../contexts/groupContext";
import { useUser } from "../contexts/userContext";
import { useEffect, useState, useCallback } from "react";
import { Group } from "../types/group";
import { useSocket } from "../contexts/socketContext";
import { Message } from "react-hook-form";
import debounce from "lodash.debounce";
import SearchResults from "./SearchResults";
import { User } from "../types/user";
import CreateGroupModal from "./CreateGroupModal";

export default function ChatSidebar() {
  const { group: selectedGroup, setGroup } = useGroup();
  const { user, token } = useUser();
  const { groupSocket } = useSocket();
  const [groups, setGroups] = useState<Omit<Group, "chats">[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>(
    {}
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  // Fonction de recherche avec debounce
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (!term.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_SERVER_URL
          }/users/search?q=${encodeURIComponent(term)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setSearchResults(data.filter((u: User) => u.id !== user?.id));
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
        setSearchResults([]);
      }
    }, 300),
    [token, user]
  );

  // Gestionnaire de changement de la recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsSearching(!!value);
    debouncedSearch(value);
  };

  // Fonction pour créer une nouvelle discussion
  const handleSelectUser = async (selectedUser: User) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/groups`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            participants: [selectedUser.id, user?.id],
          }),
        }
      );
      const newGroup = await response.json();
      setGroups((prev) => [newGroup, ...prev]);
      setGroup(newGroup);
      setSearchTerm("");
      setSearchResults([]);
      setIsSearching(false);
    } catch (error) {
      console.error("Erreur lors de la création du groupe:", error);
    }
  };

  // Fonction pour créer un nouveau groupe avec plusieurs participants
  const handleCreateGroup = async (participants: User[], name?: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/groups`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            participants: [...participants.map((p) => p.id), user?.id],
            name,
          }),
        }
      );
      const newGroup = await response.json();
      setGroups((prev) => [newGroup, ...prev]);
      setGroup(newGroup);
    } catch (error) {
      console.error("Erreur lors de la création du groupe:", error);
    }
  };

  useEffect(() => {
    const fetchGroups = async () => {
      const response = await fetch(
        import.meta.env.VITE_SERVER_URL + "/users/me/groups",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setGroups(data);

      // Rejoindre les groupes pour les notifications
      if (groupSocket && user) {
        groupSocket.emit("joinGroups", {
          userId: user.id,
          groupIds: data.map((g: Group) => g.id),
        });
      }
    };
    fetchGroups();
  }, [groupSocket, user, token]);

  useEffect(() => {
    if (!groupSocket) return;

    const handleNewGroupMessage = ({
      groupId,
      message,
    }: {
      groupId: string;
      message: Message;
    }) => {
      // Si le groupe actuel n'est pas sélectionné, incrémenter le compteur
      if (selectedGroup?.id !== groupId) {
        setUnreadMessages((prev) => ({
          ...prev,
          [groupId]: (prev[groupId] || 0) + 1,
        }));
      }
    };

    groupSocket.on("newGroupMessage", handleNewGroupMessage);

    return () => {
      groupSocket.off("newGroupMessage", handleNewGroupMessage);
    };
  }, [groupSocket, selectedGroup]);

  // Réinitialiser le compteur quand on sélectionne un groupe
  useEffect(() => {
    if (selectedGroup) {
      setUnreadMessages((prev) => ({
        ...prev,
        [selectedGroup.id]: 0,
      }));
    }
  }, [selectedGroup]);

  return (
    <aside className="w-44 lg:w-72 bg-white/40 backdrop-blur-sm shadow-xl p-6 rounded-l-lg border-r border-base-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl">Mes groupes</h2>
        <button
          onClick={() => setIsCreateGroupModalOpen(true)}
          className="btn btn-circle btn-sm btn-primary"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="relative">
        <label className="input input-bordered">
          <Search className="w-4 h-4 text-base-content/50" />
          <input
            type="search"
            className="grow"
            placeholder="Recherchez des contacts..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </label>

        {isSearching && (
          <SearchResults
            users={searchResults}
            onSelectUser={handleSelectUser}
          />
        )}
      </div>

      <ul className="space-y-3 mt-4">
        {groups.length > 0 &&
          groups.map((group) => (
            <li
              key={group.id}
              className="flex items-center gap-4 p-3 bg-base-100 hover:bg-primary/10 rounded-lg cursor-pointer transition-colors relative"
              style={{
                backgroundColor:
                  selectedGroup?.id === group.id
                    ? "rgba(0, 0, 0, 0.1)"
                    : "transparent",
              }}
              onClick={() => {
                setGroup(group as Group);
              }}
            >
              <div className="avatar-group -space-x-5">
                {group.participants
                  .filter((u) => u.id !== user?.id)
                  .map((user) => (
                    <div className="avatar" key={user.id}>
                      <div className="w-8">
                        <img
                          src={
                            user.avatar
                              ? `http://localhost:3000/avatar/${user.avatar}`
                              : "/assets/default-avatar.jpg"
                          }
                        />
                      </div>
                    </div>
                  ))}
              </div>
              <span className="font-semibold text-base-content truncate">
                {group.name ||
                  group.participants
                    .filter((u) => u.id !== user?.id)
                    .map((u) => u.pseudo)
                    .join(", ")}
              </span>
              {unreadMessages[group.id] > 0 && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 badge badge-primary">
                  {unreadMessages[group.id]}
                </div>
              )}
            </li>
          ))}

        {groups.length === 0 && (
          <li className="text-center text-base-content/50">
            Vous n'avez pas de groupe
          </li>
        )}
      </ul>

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onCreateGroup={handleCreateGroup}
        token={token || ""}
        currentUserId={user?.id || ""}
      />
    </aside>
  );
}
