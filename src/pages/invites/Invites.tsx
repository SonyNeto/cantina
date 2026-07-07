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

const getOrdersWithDetails = async (token: string): Promise<InviteResponse> => {
  const res = await apiFetch(`/invites/${token}`);
  return res.json();
};

export const Invites: FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const { data, isPending } = useQuery({
    queryKey: ['invites', token],
    queryFn: () => getOrdersWithDetails(token ?? ''),
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
      toast.error('Falha criar convite');
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
              {`Você foi convidado para fazer parte de ${data?.workspaceName}`}
            </p>
          </div>

          <Button
            size="md"
            variant="primary"
            className="w-full rounded-none"
            onClick={() => {
              postInviteResponse.mutate();
            }}
          >
            Aceitar convite
          </Button>
        </DialogContent>
      </Dialog>
    </main>
  );
};
