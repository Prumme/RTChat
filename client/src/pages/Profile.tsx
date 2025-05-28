import React, { useState } from "react";
import { useUser } from "../contexts/userContext";
import { toast } from "react-hot-toast";

const Profile = () => {
  const { user, token, setUser } = useUser();
  const [pseudo, setPseudo] = useState(user?.pseudo || "");
  const [color, setColor] = useState(user?.color || "#000000");
  const [isLoading, setIsLoading] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/users/me`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ pseudo, color }),
        }
      );

      if (!response.ok)
        throw new Error("Erreur lors de la mise à jour du profil");

      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Profil mis à jour avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/avatar/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok)
        throw new Error("Erreur lors de la mise à jour de l'avatar");

      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Avatar mis à jour avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de l'avatar");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex justify-center items-start p-8 bg-gradient-to-tl from-slate-200/80 to-sky-300/50 min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-md bg-white/40 backdrop-blur-sm shadow-xl rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-8">Mon Profil</h1>

        <div className="flex flex-col items-center mb-8">
          <div className="avatar mb-4">
            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img
                src={
                  user.avatar
                    ? `${import.meta.env.VITE_SERVER_URL}/avatar/${user.avatar}`
                    : "/assets/default-avatar.jpg"
                }
                alt="Avatar"
              />
            </div>
          </div>

          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text">Changer l'avatar</span>
            </label>
            <input
              type="file"
              className="file-input file-input-bordered w-full max-w-xs"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={isLoading}
            />
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Pseudo</span>
            </label>
            <input
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Votre pseudo"
              disabled={isLoading}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Couleur</span>
            </label>
            <div className="flex gap-4 items-center">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-24 h-12 cursor-pointer rounded"
                disabled={isLoading}
              />
              <span className="text-sm opacity-70">{color}</span>
            </div>
          </div>

          <button
            type="submit"
            className={`btn btn-primary w-full ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            Mettre à jour le profil
          </button>
        </form>

        <div className="mt-6">
          <div className="text-sm opacity-70">
            <p>Email : {user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
