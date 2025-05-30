import { Link, Outlet, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/userContext";
import { useAuth } from "../hooks/useAuth";

const AppLayout = () => {
  const { user } = useUser();
  const { logout } = useAuth();
  const navigate = useNavigate();

  if (user === null) {
    navigate("/login");
  }

  if (user) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-tl from-slate-200/80 to-sky-300/50">
        <div className="navbar bg-white/0 shadow-sm backdrop-blur-md relative z-[9999]">
          <div className="flex-1">
            <Link to={"/"} className="pl-2 cursor-pointer text-xl">
              RTChat
            </Link>
          </div>
          <div className="flex-none">
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-10 rounded-full">
                  <img
                    alt="User Avatar"
                    src={
                      user.avatar
                        ? `http://localhost:3000/avatar/${user.avatar}`
                        : "/assets/default-avatar.jpg"
                    }
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[9999] mt-3 w-32 p-2 shadow"
              >
                <li>
                  <Link to={"/profile"} className="justify-between">
                    Profil
                  </Link>
                </li>
                <li>
                  <button onClick={logout} className="">
                    <span>Se déconnecter</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <Outlet />
      </div>
    );
  }
  return null;
};

export default AppLayout;
