import { useMutation } from "@tanstack/react-query";
import type { FC } from "react";
import { apiFetch } from "../../utils/api";
import { Button } from "../../components/commons/Button";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router";
import ROUTES from "../../constants/routes";

export const SignupPage: FC = () => {
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await apiFetch(`/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!res.ok) {
        throw new Error('Falha ao realizar cadastro');
      }

      return null;
    },

    onSuccess: () => {
      navigate(ROUTES.LOGIN);
    },

    onError: () => {
      toast.error('Falha ao realizar cadastro')
    },
  });

  return (
    <div className="h-screen w-screen bg-secondary text-text text-2xl font-medium p-6">
      <div className="flex bg-primary flex-col items-center gap-4 border-text/70 border-6 w-full h-full pt-[8rem] p-4">
        <img src="/favicon.png" alt="Logo" className="w-32 h-32 mb-8" />
        <span className="text-3xl font-bold text-center">Bem-vindo(a) à cantina</span>
        <form
          className="bg-primary border-text/40 border-4 flex flex-col h-fit items-center justify-between gap-2.5 rounded-none p-4"
          onSubmit={(e) => {
            e.preventDefault();

            const formData = new FormData(e.currentTarget);
            const email = formData.get('email') as string;
            const password = formData.get('password') as string;

            loginMutation.mutate({ email, password });
          }}>
            <input
              name="email"
              id={`login-email`}
              type="email"
              placeholder="E-mail"
              className="border-text/40 w-full max-w-[21ch] min-w-0 truncate border-4 px-2"
            />
            <input
              name="password"
              id={`login-password`}
              type="password"
              placeholder="Senha"
              className="border-text/40 w-full max-w-[21ch] min-w-0 truncate border-4 px-2"
            />
            <Button type="submit" variant="primary" size="md">
              Cadastrar-se
            </Button>
            <Link to={ROUTES.LOGIN}>
              Voltar para o login
            </Link>
        </form>
      </div>
    </div>
  );
}
