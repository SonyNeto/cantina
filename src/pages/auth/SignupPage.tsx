import { useMutation } from '@tanstack/react-query';
import type { FC } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '../../components/commons/Button';
import ROUTES from '../../constants/routes';
import { apiFetch } from '../../utils/api';
import { z } from 'zod';

const signupSchema = z
  .object({
    email: z.email(),
    password: z.string().min(4, 'A senha deve ter pelo menos 4 caracteres'),
    confirmPassword: z.string().min(4, 'A senha deve ter pelo menos 4 caracteres'),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'As senhas não correspondem',
        path: ['confirmPassword'],
      });
    }
  });

export const SignupPage: FC = () => {
  const navigate = useNavigate();

  const signupMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await apiFetch('/signup', {
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
      toast.success('Cadastro realizado com sucesso');
      navigate(ROUTES.LOGIN);
    },

    onError: () => {
      toast.error('Falha ao realizar cadastro');
    },
  });

  return (
    <main className="bg-secondary flex min-h-screen w-full p-4 text-2xl font-medium sm:p-6">
      <section className="border-border/70 bg-primary flex w-full flex-1 flex-col items-center justify-center gap-5 border-4 p-4 shadow-[6px_6px_0_var(--color-shadow)]">
        <img src="/favicon.png" alt="Logo" className="mb-2 size-32" />
        <h1 className="text-center text-3xl font-bold">Criar acesso</h1>
        <form
          className="border-border/60 bg-panel flex w-full max-w-md flex-col items-stretch gap-3 rounded-none border-4 p-4 shadow-[5px_5px_0_var(--color-shadow)]"
          onSubmit={(e) => {
            e.preventDefault();

            const formData = new FormData(e.currentTarget);
            const email = formData.get('email') as string;
            const password = formData.get('password') as string;
            const confirmPassword = formData.get('confirmPassword') as string;

            const result = signupSchema.safeParse({
              email,
              password,
              confirmPassword,
            });

            if (!result.success) {
              toast.error(result.error.issues[0].message);
              return;
            }

            signupMutation.mutate({ email, password });
          }}
        >
          <input
            name="email"
            id="signup-email"
            type="email"
            placeholder="E-mail"
            className="app-input w-full"
          />
          <input
            name="password"
            id="signup-password"
            type="password"
            placeholder="Senha"
            className="app-input w-full"
          />
          <input
            name="confirmPassword"
            id="signup-confirmPassword"
            type="password"
            placeholder="Confirme a senha"
            className="app-input w-full"
          />
          <Button type="submit" variant="primary" size="md" className="w-full">
            Cadastrar-se
          </Button>
          <Link to={ROUTES.LOGIN} className="app-link text-center text-xl">
            Voltar para o login
          </Link>
        </form>
      </section>
    </main>
  );
};
