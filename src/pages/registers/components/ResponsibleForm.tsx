import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ComponentPropsWithRef } from 'react';
import { toast } from 'sonner';
import z from 'zod';
import { Check } from 'pixelarticons/react';
import type { Responsible } from '../../../constants/school/types';
import { workspaceApiFetch } from '../../../utils/api';
import { Button } from '../../../components/commons/Button';
import { X } from '../../../assets/icons/MenuIcons';
import { cn } from '../../../utils/functions';

type ResponsibleInput = {
  name: string;
  responsibleId?: string;
};

type ResponsibleResponse = {
  responsible: Responsible;
};

type ResponsibleFormProps = ComponentPropsWithRef<'form'> & {
  workspaceId: string | undefined;
  responsibleId?: string;
  onClose: () => void;
  method?: 'post' | 'update';
  defaultName?: string;
};

const responsibleSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do responsável'),
  responsibleId: z.string().optional(),
});

export const ResponsibleForm = ({
  className,
  workspaceId,
  responsibleId,
  onClose,
  method = 'post',
  defaultName,
}: ResponsibleFormProps) => {
  const queryClient = useQueryClient();

  const createResponsible = useMutation({
    mutationFn: async ({ name }: ResponsibleInput): Promise<ResponsibleResponse> => {
      const res = await workspaceApiFetch('/responsibles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
        }),
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registers', 'responsibles', workspaceId] });
      onClose();
    },
  });

  const updateResponsible = useMutation({
    mutationFn: async ({ name, responsibleId }: ResponsibleInput): Promise<ResponsibleResponse> => {
      const res = await workspaceApiFetch(`/responsibles/${responsibleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
        }),
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registers', 'responsibles', workspaceId] });
      toast.success('Responsável atualizado com sucesso!');
      onClose();
    },
  });

  return (
    <form
      className={cn('app-form-row z-50 flex min-w-0 justify-center rounded-none', className)}
      onSubmit={(e) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const result = responsibleSchema.safeParse({
          name: String(formData.get('name') ?? ''),
          responsibleId,
        });

        if (!result.success) {
          toast.error(result.error.issues[0].message);
          return;
        }

        if (method === 'post') {
          createResponsible.mutate(result.data);
        }

        if (method === 'update') {
          updateResponsible.mutate(result.data);
        }
      }}
    >
      <div className="inline-flex min-w-0 items-center gap-2.5">
        <input
          name="name"
          id={responsibleId ? `responsible-name-${responsibleId}` : 'add-responsible-name'}
          type="text"
          placeholder="Nome do responsável"
          defaultValue={defaultName}
          className="app-input w-full max-w-[20ch] truncate"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Button type="submit" variant="primary" size="sm">
          <Check />
        </Button>
        <Button variant="primary" size="sm" onClick={onClose}>
          <X />
        </Button>
      </div>
    </form>
  );
};
