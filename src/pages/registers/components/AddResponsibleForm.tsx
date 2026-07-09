import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import z from 'zod';
import type { Responsible } from '../../../constants/school/types';
import { workspaceApiFetch } from '../../../utils/api';
import { Button } from '../../../components/commons/Button';
import { Check } from 'pixelarticons/react';
import { X } from '../../../assets/icons/MenuIcons';

type ResponsibleResponse = {
  responsible: Responsible;
};

type AddResponsibleFormProps = {
  workspaceId: string | undefined;
  onClose: () => void;
};

const createResponsibleSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do responsável'),
});

export const AddResponsibleForm = ({ workspaceId, onClose }: AddResponsibleFormProps) => {
  const queryClient = useQueryClient();

  const createResponsible = useMutation({
    mutationFn: async (name: string): Promise<ResponsibleResponse> => {
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

  return (
    <form
      className="app-form-row z-50 flex min-w-0 justify-between rounded-none"
      onSubmit={(e) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const result = createResponsibleSchema.safeParse({
          name: String(formData.get('name') ?? ''),
        });

        if (!result.success) {
          toast.error(result.error.issues[0].message);
          return;
        }

        createResponsible.mutate(result.data.name);
      }}
    >
      <div className="inline-flex min-w-0 items-center gap-2.5">
        <input
          name="name"
          id={`add-responsible-name`}
          type="text"
          placeholder="Nome do responsável"
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
