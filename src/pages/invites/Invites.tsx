import { useMutation, useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../../components/commons/Button';
import { Dialog, DialogContent } from '../../components/commons/Dialog';
import { apiFetch } from '../../utils/api';
import { toast } from 'sonner';
import ROUTES from '../../constants/routes';
import { Loader } from '../../components/commons/Loader';

type InviteResponse = {
  workspaceName: string;
  workspaceId: string;
  role: 'admin' | 'member';
};

const getInvite = async (token: string): Promise<InviteResponse | null> => {
  const res = await apiFetch(`/invites/${token}`);

  if (res.status === 404) {
    return null;
  }

  return res.json();
};

export const Invites: FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const { data: inviteData, isPending } = useQuery({
    queryKey: ['invites', token],
    queryFn: () => getInvite(token ?? ''),
    enabled: Boolean(token),
  });

  const postInviteResponse = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/invites/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Falha aceitar convite');
      }

      return null;
    },

    onSuccess: () => {
      toast.success('Convite aceito');
      navigate(ROUTES.HOME);
    },

    onError: () => {
      toast.error('Falha aceitar convite');
    },
  });

  return isPending ? (
    <Loader />
  ) : (
    <main className="bg-primary min-h-screen">
      <Dialog open={true} onOpenChange={() => navigate(ROUTES.HOME)}>
        <DialogContent title="Convite para instituição">
          <div className="flex min-w-0 flex-col gap-2">
            <p className="text-text/70 text-base font-medium">
              {inviteData === null
                ? 'Convite inválido ou expirado'
                : `Você foi convidado para fazer parte de ${inviteData?.workspaceName}`}
            </p>
          </div>

          <Button
            size="md"
            variant="primary"
            className="w-full rounded-none"
            disabled={postInviteResponse.isPending}
            onClick={() => {
              if (!inviteData) {
                navigate(ROUTES.HOME);
              } else {
                postInviteResponse.mutate();
              }
            }}
          >
            {!inviteData ? 'Voltar para o início' : 'Aceitar convite'}
          </Button>
        </DialogContent>
      </Dialog>
    </main>
  );
};
