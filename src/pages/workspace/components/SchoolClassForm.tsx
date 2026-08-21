import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ComponentPropsWithRef } from 'react';
import { toast } from 'sonner';
import z from 'zod';
import { Check } from 'pixelarticons/react';
import type { SchoolClass } from '../../../constants/school/types';
import { workspaceApiFetch } from '../../../utils/api';
import { Button } from '../../../components/commons/Button';
import { X } from '../../../assets/icons/MenuIcons';
import { cn } from '../../../utils/functions';

type SchoolClassInput = {
  label: string;
  schoolClassId?: string;
};

type SchoolClassResponse = {
  schoolClass: SchoolClass;
};

type SchoolClassFormProps = ComponentPropsWithRef<'form'> & {
  workspaceId: string | undefined;
  shiftId: string;
  schoolClassId?: string;
  onClose: () => void;
  method?: 'post' | 'update';
  defaultLabel?: string;
};

const schoolClassSchema = z.object({
  label: z.string().trim().min(1, 'Informe o nome da turma'),
  schoolClassId: z.string().optional(),
});

export const SchoolClassForm = ({
  className,
  workspaceId,
  shiftId,
  schoolClassId,
  onClose,
  method = 'post',
  defaultLabel,
}: SchoolClassFormProps) => {
  const queryClient = useQueryClient();

  const createSchoolClass = useMutation({
    mutationFn: async ({ label }: SchoolClassInput): Promise<SchoolClassResponse> => {
      const res = await workspaceApiFetch(`/shifts/${shiftId}/schoolClasses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label,
        }),
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', 'schoolClasses', workspaceId],
      });
      onClose();
    },
  });

  const updateSchoolClass = useMutation({
    mutationFn: async ({
      label,
      schoolClassId,
    }: SchoolClassInput): Promise<SchoolClassResponse> => {
      const res = await workspaceApiFetch(`/shifts/${shiftId}/schoolClasses/${schoolClassId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label,
        }),
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', 'schoolClasses', workspaceId],
      });
      toast.success('Turma atualizada com sucesso!');
      onClose();
    },
  });

  return (
    <form
      className={cn('app-form-row z-50 flex min-w-0 justify-center rounded-none', className)}
      onSubmit={(e) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const result = schoolClassSchema.safeParse({
          label: String(formData.get('label') ?? ''),
          schoolClassId,
        });

        if (!result.success) {
          toast.error(result.error.issues[0].message);
          return;
        }

        if (method === 'post') {
          createSchoolClass.mutate(result.data);
        }

        if (method === 'update') {
          updateSchoolClass.mutate(result.data);
        }
      }}
    >
      <div className="inline-flex min-w-0 items-center gap-2.5">
        <input
          name="label"
          id={schoolClassId ? `school-class-label-${schoolClassId}` : 'add-school-class-label'}
          type="text"
          placeholder="Nome da turma"
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
