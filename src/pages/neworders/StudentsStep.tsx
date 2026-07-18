import type { FC } from 'react';
import { Button } from '../../components/commons/Button';
import { useFormContext } from 'react-hook-form';
import { ArrowLeft } from 'pixelarticons/react';
import { useQuery } from '@tanstack/react-query';
import type { ShiftId, Student } from '../../constants/school/types';
import { Loader } from '../../components/commons/Loader';
import { workspaceApiFetch } from '../../utils/api';
import type { OrderForm } from '../../constants/canteen/types';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';

interface Props {
  shiftId: ShiftId | '';
  classId: string;
  onNext: () => void;
  onBack: () => void;
}

type StudentsResponse = {
  students: Student[];
};

const getStudents = async (shiftId: ShiftId | '', classId: string): Promise<StudentsResponse> => {
  const res = await workspaceApiFetch(`/shifts/${shiftId}/classes/${classId}/students`);
  return res.json();
};

export const StudentsStep: FC<Props> = ({ onNext, onBack, shiftId, classId }) => {
  const { setValue } = useFormContext<OrderForm>();
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);

  const { data: students = [], isPending } = useQuery({
    queryKey: ['students', workspaceId, classId],
    queryFn: () => getStudents(shiftId, classId),
    enabled: Boolean(workspaceId && shiftId && classId),
    select: (data) => data.students,
  });

  function handleSelectStudent(studentId: OrderForm['studentId']) {
    setValue('studentId', studentId, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue('items', []);

    onNext();
  }

  return isPending ? (
    <Loader />
  ) : (
    <div className="app-content">
      <div className="app-header grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] [&_svg]:size-10 [&_svg]:shrink-0">
        <Button variant={'ghost'} className="justify-self-start" disableHover onClick={onBack}>
          <ArrowLeft />
        </Button>
        <span className="justify-self-center text-center">Escolha um aluno</span>
        <span aria-hidden="true" />
      </div>
      <div className="app-list">
        {students.map((student) => (
          <Button
            key={student.id}
            type="button"
            variant="ghost"
            size="lg"
            className="app-row app-row-action h-auto grid-cols-[minmax(0,1fr)] justify-items-start rounded-none text-left whitespace-normal"
            onClick={() => handleSelectStudent(student.id)}
          >
            <span>{student.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
