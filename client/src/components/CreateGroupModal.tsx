import { X } from "lucide-react";
import { User } from "../types/user";
import { useState } from "react";
import SearchResults from "./SearchResults";
import debounce from "lodash.debounce";
import { useCallback } from "react";
import Modal from "./Modal";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (participants: User[], name?: string) => void;
  token: string;
  currentUserId: string | null | undefined;
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  onCreateGroup,
  token,
  currentUserId,
}: CreateGroupModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState("");

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
        setSearchResults(
          data.filter(
            (u: User) =>
              u.id !== currentUserId &&
              !selectedUsers.some((selected) => selected.id === u.id)
          )
        );
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
        setSearchResults([]);
      }
    }, 300),
    [token, currentUserId, selectedUsers]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleSelectUser = (user: User) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
  };

  const handleCreateGroup = () => {
    if (selectedUsers.length > 0) {
      onCreateGroup(selectedUsers, groupName.trim() || undefined);
      setSelectedUsers([]);
      setGroupName("");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen}>
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw] max-h-[90vh] overflow-y-auto relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Créer un nouveau groupe</h2>
          <button onClick={onClose} className="btn btn-ghost btn-circle">
            <X />
          </button>
        </div>

        <input
          type="text"
          placeholder="Nom du groupe (optionnel)"
          className="input input-bordered w-full mb-4"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher des membres..."
            className="input input-bordered w-full"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchResults.length > 0 && (
            <div className="mt-2">
              <SearchResults
                users={searchResults}
                onSelectUser={handleSelectUser}
              />
            </div>
          )}
        </div>

        {selectedUsers.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">
              Membres sélectionnés:
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div key={user.id} className="badge badge-primary gap-2">
                  <span>{user.pseudo}</span>
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    className="cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">
            Annuler
          </button>
          <button
            onClick={handleCreateGroup}
            className="btn btn-primary"
            disabled={selectedUsers.length === 0}
          >
            Créer le groupe
          </button>
        </div>
      </div>
    </Modal>
  );
}
