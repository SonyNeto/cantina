import { useMutation } from '@tanstack/react-query';
import type { FC } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '../../components/commons/Button';
import ROUTES from '../../constants/routes';
import { apiFetch } from '../../utils/api';

export const LoginPage: FC = () => {
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await apiFetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!res.ok) {
        throw new Error('Falha ao realizar login');
      }

      return null;
    },

    onSuccess: () => {
      navigate(ROUTES.HOME);
    },

    onError: () => {
      toast.error('Falha ao realizar login');
    },
  });

  return (
    <main className="bg-secondary flex min-h-screen w-full p-4 text-2xl font-medium sm:p-6">
      <section className="border-border/70 bg-primary flex w-full flex-1 flex-col items-center justify-center gap-5 border-4 p-4 shadow-[6px_6px_0_var(--color-shadow)]">
        <img src="/favicon.png" alt="Logo" className="mb-2 size-32" />
        <h1 className="text-center text-3xl font-bold">Bem-vindo(a) à cantina</h1>
        <form
          className="border-border/60 bg-panel flex w-full max-w-md flex-col items-stretch gap-3 rounded-none border-4 p-4 shadow-[5px_5px_0_var(--color-shadow)]"
          onSubmit={(e) => {
            e.preventDefault();

            const formData = new FormData(e.currentTarget);
            const email = formData.get('email') as string;
            const password = formData.get('password') as string;

            loginMutation.mutate({ email, password });
          }}
        >
          <input
            name="email"
            id="login-email"
            type="email"
            placeholder="E-mail"
            className="app-input w-full"
          />
          <input
            name="password"
            id="login-password"
            type="password"
            placeholder="Senha"
            className="app-input w-full"
          />
          <Button type="submit" variant="primary" size="md" className="w-full">
            Entrar
          </Button>
          <Link to={ROUTES.SIGNUP} className="app-link text-center text-xl">
            Cadastrar-se
          </Link>
        </form>
      </section>
    </main>
  );
};
