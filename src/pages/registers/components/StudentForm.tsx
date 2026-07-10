import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import type { SchoolClass, Student } from '../../../constants/school/types';
import { workspaceApiFetch } from '../../../utils/api';
import { Button } from '../../../components/commons/Button';
import { Check } from 'pixelarticons/react';
import { X } from '../../../assets/icons/MenuIcons';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '../../../components/commons/Select';
import { cn } from '../../../utils/functions';
import type { ComponentPropsWithRef } from 'react';

type SchoolClassesResponse = {
  schoolClasses: SchoolClass[];
};

type StudentInput = {
  name: string;
  classId: string;
  studentId?: string;
};

type StudentResponse = {
  student: Student;
};

type StudentFormProps = ComponentPropsWithRef<'form'> & {
  workspaceId: string | undefined;
  responsibleId: string;
  studentId?: string;
  onClose: () => void;
  method?: 'post' | 'update';
  defaultName?: string;
  defaultClass?: string;
};

const studentSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do aluno'),
  classId: z.string().trim().min(1, 'Selecione uma turma'),
  studentId: z.string().optional(),
});

const getSchoolClasses = async (): Promise<SchoolClassesResponse> => {
  const res = await workspaceApiFetch('/classes');
  return res.json();
};

export const StudentForm = ({
  className,
  workspaceId,
  responsibleId,
  studentId,
  onClose,
  method = 'post',
  defaultName,
  defaultClass,
}: StudentFormProps) => {
  const queryClient = useQueryClient();

  const { data: schoolClasses = [], isPending: isSchoolClassesPending } = useQuery({
    queryKey: ['schoolClasses', workspaceId],
    queryFn: getSchoolClasses,
    enabled: Boolean(workspaceId),
    select: (data) => data.schoolClasses,
  });

  const updateStudent = useMutation({
    mutationFn: async ({ name, classId, studentId }: StudentInput): Promise<StudentResponse> => {
      const res = await workspaceApiFetch(`/responsibles/${responsibleId}/students/${studentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          classId,
        }),
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registers', workspaceId, responsibleId] });
      toast.success('Aluno atualizado com sucesso!');
      onClose();
    },
  });

  const createStudent = useMutation({
    mutationFn: async ({ name, classId }: StudentInput): Promise<StudentResponse> => {
      const res = await workspaceApiFetch(`/responsibles/${responsibleId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          classId,
        }),
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registers', workspaceId, responsibleId] });
      onClose();
    },
  });

  const classesByShift = schoolClasses.reduce<Record<string, SchoolClass[]>>((acc, schoolClass) => {
    const shiftLabel = schoolClass.shiftLabel ?? schoolClass.shiftId;
    acc[shiftLabel] = [...(acc[shiftLabel] ?? []), schoolClass];
    return acc;
  }, {});
  const defaultClassId = schoolClasses.find((schoolClass) => schoolClass.id === defaultClass)?.id;

  return (
    <form
      className={cn('app-form-row justify-center z-50 flex rounded-none', className)}
      onSubmit={(e) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const result = studentSchema.safeParse({
          name: String(formData.get('name') ?? ''),
          classId: String(formData.get('classId') ?? ''),
          studentId,
        });

        if (!result.success) {
          toast.error(result.error.issues[0].message);
          return;
        }

        if (method === 'post') {
          createStudent.mutate(result.data);
        }

        if (method === 'update') {
          updateStudent.mutate(result.data);
        }
      }}
    >
      <div className="flex min-w-0 flex-col items-center gap-2.5">
        <input
          name="name"
          id="add-student-name"
          type="text"
          placeholder="Nome do aluno"
          defaultValue={defaultName}
          className="app-input w-full max-w-[21ch] truncate"
        />
        {isSchoolClassesPending ? (
          <Select key="loading-school-classes" disabled>
            <SelectTrigger
              placeholder="Carregando turmas..."
              className="w-full max-w-[21ch] min-w-0"
            />
          </Select>
        ) : (
          <Select
            key={defaultClassId ?? 'empty-school-class'}
            name="classId"
            id="add-student-class"
            defaultValue={defaultClassId}
            items={schoolClasses.map((schoolClass) => ({
              label: schoolClass.label,
              value: schoolClass.id,
            }))}
          >
            <SelectTrigger
              placeholder="Selecione uma turma"
              className="w-full max-w-[21ch] min-w-0"
            />
            <SelectContent className="">
              {Object.entries(classesByShift).map(([shiftLabel, classes]) => (
                <SelectGroup label={shiftLabel} key={shiftLabel}>
                  {classes.map((schoolClass) => (
                    <SelectItem value={schoolClass.id} key={schoolClass.id}>
                      {schoolClass.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        )}
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
