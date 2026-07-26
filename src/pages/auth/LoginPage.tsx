import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FC } from 'react';
import { Link, useLocation } from 'react-router';
import { toast } from 'sonner';
import { Button } from '../../components/commons/Button';
import ROUTES from '../../constants/routes';
import { apiFetch } from '../../utils/api';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.email('E-mail invalido'),
  password: z.string().min(4, 'A senha deve ter pelo menos 4 caracteres'),
});

export const LoginPage: FC = () => {
  const queryClient = useQueryClient();
  const location = useLocation();

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
        const data = await res.json().catch(() => null);

        throw new Error(data?.message ?? 'Falha ao realizar login');
      }

      return null;
    },

    onSuccess: () => {
      queryClient.setQueryData(['auth'], true);
    },

    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Falha ao realizar login';

      toast.error(message);
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

            const result = loginSchema.safeParse({
              email,
              password,
            });

            if (!result.success) {
              toast.error(result.error.issues[0].message);
              return;
            }

            loginMutation.mutate(result.data);
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
          <Link to={ROUTES.SIGNUP} state={location.state} className="app-link text-center text-xl">
            Cadastrar-se
          </Link>
        </form>
      </section>
    </main>
  );
};
