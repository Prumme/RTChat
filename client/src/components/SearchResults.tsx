import { User } from "../types/user";

interface SearchResultsProps {
  users: User[];
  onSelectUser: (user: User) => void;
}

export default function SearchResults({
  users,
  onSelectUser,
}: SearchResultsProps) {
  if (users.length === 0) {
    return (
      <div className="mt-2 p-3 text-center text-base-content/50">
        Aucun utilisateur trouvé
      </div>
    );
  }

  return (
    <div className="mt-2 bg-base-100 rounded-lg shadow-lg absolute w-full max-w-[350px] z-10 max-h-[200px] overflow-y-auto">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center gap-3 p-3 hover:bg-primary/10 cursor-pointer transition-colors overflow-hidden"
          onClick={() => onSelectUser(user)}
        >
          <div className="avatar flex-shrink-0">
            <div className="w-8">
              <img
                src={
                  user.avatar
                    ? `http://localhost:3000/avatar/${user.avatar}`
                    : "/assets/default-avatar.jpg"
                }
                alt={user.pseudo}
              />
            </div>
          </div>
          <span className="font-semibold truncate flex-1 min-w-0">
            {user.pseudo}
          </span>
        </div>
      ))}
    </div>
  );
}
