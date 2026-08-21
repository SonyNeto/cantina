import { useState, type ComponentProps } from 'react';
import { useWorkspaceStore } from '../../../stores/useWorkspaceStore';
import { canManageWorkspace } from '../../../utils/workspaceAccess';
import { useMutation } from '@tanstack/react-query';
import { workspaceApiFetch } from '../../../utils/api';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '../../../components/commons/Dialog';
import { Button } from '../../../components/commons/Button';

type CreateInviteProps = ComponentProps<typeof Dialog>;

export const CreateInvite = ({ open, onOpenChange, ...props }: CreateInviteProps) => {
  const selectedWorkspace = useWorkspaceStore((state) => state.workspace);
  const [inviteLink, setInviteLink] = useState<string>('');
  const canInviteMembers = canManageWorkspace(selectedWorkspace?.role);

  const getInviteToken = useMutation({
    mutationFn: async () => {
      const res = await workspaceApiFetch('/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Falha criar convite');
      }

      return res.json();
    },

    onSuccess: (data) => {
      const token = data.token;
      const link = `${window.location.origin}/invite/${token}`;

      setInviteLink(link);
    },

    onError: () => {
      toast.error('Falha criar convite');
    },
  });

  return (
    <>
      {canInviteMembers && (
        <Dialog
          open={open}
          onOpenChange={onOpenChange}
          {...props}
          onOpenChangeComplete={(nextOpen) => {
            if (nextOpen) getInviteToken.mutate();
          }}
        >
          <DialogContent title="Convidar membro">
            <input type="text" value={inviteLink} readOnly className="app-input w-full" />
            <Button
              size="md"
              variant="primary"
              onClick={async () => {
                await navigator.clipboard.writeText(inviteLink);
                toast.success('Link copiado');
              }}
            >
              Copiar link
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
