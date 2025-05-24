import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../hooks/useAuth";

const schema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z
    .string()
    .min(8, "Minimum 8 caractères")
    .max(32, "Maximum 32 caractères")
    .regex(/[A-Z]/, "Doit contenir une majuscule")
    .regex(/[0-9]/, "Doit contenir un chiffre"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = (data: any) => login(data.email, data.password);

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200 px-4">
      <div className="card w-full max-w-md shadow-xl bg-base-100">
        <div className="card-body">
          <h1
            className="text-4xl font-bold text-center mb-6 text-primary"
            style={{ fontFamily: '"Rubik Bubbles", cursive' }}
          >
            RTChat
          </h1>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LogIn className="w-6 h-6" /> Connexion
          </h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >
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
            <button className="btn btn-primary mt-2" type="submit">
              Se connecter
            </button>
          </form>
          <p className="mt-2 text-sm">
            Pas encore de compte ?{" "}
            <Link to="/register" className="link link-primary">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
