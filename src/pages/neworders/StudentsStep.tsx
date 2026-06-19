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
    <div className="border-text m-6 flex h-fit flex-col overflow-hidden border-4">
      <div className="bg-tertiary grid w-full grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2.5 px-4 py-4 text-xl [&_svg]:size-10 [&_svg]:shrink-0">
        <Button variant={'ghost'} className="z-50 justify-self-start" disableHover onClick={onBack}>
          <ArrowLeft />
        </Button>
        <span className="justify-self-center text-center">Escolha um aluno</span>
        <span aria-hidden="true" />
      </div>
      <div className="grid">
        {students.map((student) => (
          <Button
            key={student.id}
            type="button"
            variant="ghost"
            size="lg"
            className="bg-primary border-text/40 grid h-auto w-full grid-cols-[minmax(0,1fr)] justify-items-start rounded-none border-t-4 p-4 text-left text-xl whitespace-normal"
            onClick={() => handleSelectStudent(student.id)}
          >
            <span>{student.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
