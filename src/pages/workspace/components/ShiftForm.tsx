import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ComponentPropsWithRef } from 'react';
import { toast } from 'sonner';
import z from 'zod';
import { Check } from 'pixelarticons/react';
import type { Shift } from '../../../constants/school/types';
import { workspaceApiFetch } from '../../../utils/api';
import { Button } from '../../../components/commons/Button';
import { X } from '../../../assets/icons/MenuIcons';
import { cn } from '../../../utils/functions';

type ShiftInput = {
  label: string;
  shiftId?: string;
};

type ShiftResponse = {
  shift: Shift;
};

type ShiftFormProps = ComponentPropsWithRef<'form'> & {
  workspaceId: string | undefined;
  shiftId?: string;
  onClose: () => void;
  method?: 'post' | 'update';
  defaultLabel?: string;
};

const shiftSchema = z.object({
  label: z.string().trim().min(1, 'Informe o nome do turno'),
  shiftId: z.string().optional(),
});

export const ShiftForm = ({
  className,
  workspaceId,
  shiftId,
  onClose,
  method = 'post',
  defaultLabel,
}: ShiftFormProps) => {
  const queryClient = useQueryClient();

  const createShift = useMutation({
    mutationFn: async ({ label }: ShiftInput): Promise<ShiftResponse> => {
      const res = await workspaceApiFetch('/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label,
        }),
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', 'shifts', workspaceId] });
      onClose();
    },
  });

  const updateShift = useMutation({
    mutationFn: async ({ label, shiftId }: ShiftInput): Promise<ShiftResponse> => {
      const res = await workspaceApiFetch(`/shifts/${shiftId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label,
        }),
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', 'shifts', workspaceId] });
      toast.success('Turno atualizado com sucesso!');
      onClose();
    },
  });

  return (
    <form
      className={cn('app-form-row z-50 flex min-w-0 justify-center rounded-none', className)}
      onSubmit={(e) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const result = shiftSchema.safeParse({
          label: String(formData.get('label') ?? ''),
          shiftId,
        });

        if (!result.success) {
          toast.error(result.error.issues[0].message);
          return;
        }

        if (method === 'post') {
          createShift.mutate(result.data);
        }

        if (method === 'update') {
          updateShift.mutate(result.data);
        }
      }}
    >
      <div className="inline-flex min-w-0 items-center gap-2.5">
        <input
          name="label"
          id={shiftId ? `shift-label-${shiftId}` : 'add-shift-label'}
          type="text"
          placeholder="Nome do turno"
          defaultValue={defaultLabel}
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
