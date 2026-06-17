import type { FC } from 'react';
import { Button } from '../../components/commons/Button';
import { useFormContext, useWatch } from 'react-hook-form';
import type { NewOrderForm } from './types';
import { getStudentsByClassId } from '../../utils/selectors';
import { ArrowLeft } from 'pixelarticons/react';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export const StudentsStep: FC<Props> = ({ onNext, onBack }) => {
  const { control, setValue } = useFormContext<NewOrderForm>();

  const classId = useWatch({
    control,
    name: 'classId',
  });

  const students = getStudentsByClassId(classId);

  function handleSelectStudent(studentId: NewOrderForm['studentId']) {
    setValue('studentId', studentId, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue('order', []);

    onNext();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-tertiary border-text/30 relative flex w-screen items-center justify-center gap-2.5 border-b-4 px-6 py-4 text-xl [&_svg]:size-10">
        <Button variant={'ghost'} className="absolute left-4 z-50" disableHover onClick={onBack}>
          <ArrowLeft />
        </Button>
        <span>Escolha um aluno</span>
      </div>
      {students.map((student) => (
        <Button
          key={student.id}
          type="button"
          variant="primary"
          size="lg"
          onClick={() => handleSelectStudent(student.id)}
        >
          {student.name}
        </Button>
      ))}
    </div>
  );
};
