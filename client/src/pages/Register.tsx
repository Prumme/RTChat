import { UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../hooks/useAuth";

const schema = z.object({
  pseudo: z.string().min(1, "Pseudo requis"),
  email: z.string().email({ message: "Email invalide" }),
  password: z
    .string()
    .min(8, "Minimum 8 caractères")
    .max(32, "Maximum 32 caractères")
    .regex(/[A-Z]/, "Doit contenir une majuscule")
    .regex(/[0-9]/, "Doit contenir un chiffre"),
});

export default function RegisterPage() {
  const { register: signup } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = (data: any) =>
    signup(data.email, data.password, data.pseudo);

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200 px-4">
      <div className="card w-full max-w-md shadow-xl bg-base-100">
        <div className="card-body">
          <h1
            className="text-4xl font-bold text-center mb-6 text-secondary"
            style={{ fontFamily: '"Rubik Bubbles", cursive' }}
          >
            RTChat
          </h1>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="w-6 h-6" /> Inscription
          </h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >
            <input
              type="text"
              placeholder="Nom"
              className="input input-bordered w-full"
              {...register("pseudo")}
            />
            {errors.pseudo && (
              <span className="text-error text-sm">
                {errors.pseudo.message}
              </span>
            )}
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered w-full"
              {...register("email")}
            />
            {errors.email && (
              <span className="text-error text-sm">{errors.email.message}</span>
            )}
            <input
              type="password"
              placeholder="Mot de passe"
              className="input input-bordered w-full"
              {...register("password")}
            />
            {errors.password && (
              <span className="text-error text-sm">
                {errors.password.message}
              </span>
            )}
            <button className="btn btn-secondary mt-2" type="submit">
              Créer un compte
            </button>
          </form>
          <p className="mt-2 text-sm">
            Déjà inscrit ?{" "}
            <Link to="/login" className="link link-secondary">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
