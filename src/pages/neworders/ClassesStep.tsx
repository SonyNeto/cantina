import type { FC } from 'react';
import { Button } from '../../components/commons/Button';
import { useFormContext, useWatch } from 'react-hook-form';
import type { NewOrderForm } from './types';
import { ArrowLeft } from 'pixelarticons/react';
import { useQuery } from '@tanstack/react-query';
import type { SchoolClass, ShiftId } from '../../constants/school/types';
import { Loader } from '../../components/commons/Loader';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const getSchoolClasses = async (shiftId: ShiftId | '') => {
  const res = await fetch(`http://localhost:3000/shifts/${shiftId}/classes`);
  return await res.json();
};

export const ClassesStep: FC<Props> = ({ onNext, onBack }) => {
  const { control, setValue } = useFormContext<NewOrderForm>();

  const shiftId = useWatch({
    control,
    name: 'shiftId',
  });

  const { data: schoolClasses, isPending } = useQuery({
    queryKey: ['schoolClasses', shiftId],
    queryFn: () => getSchoolClasses(shiftId),
  });

  function handleSelectClass(classId: NewOrderForm['classId']) {
    setValue('classId', classId, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue('order', []);
    setValue('studentId', '');

    onNext();
  }

  return isPending ? (
    <Loader />
  ) : (
    <div className="border-text m-6 flex h-fit flex-col overflow-hidden border-4">
      <div className="bg-tertiary grid w-full grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2.5 px-4 py-4 text-xl [&_svg]:size-10">
        <Button variant={'ghost'} className="justify-self-start" disableHover onClick={onBack}>
          <ArrowLeft />
        </Button>
        <span className="justify-self-center text-center">Escolha uma turma</span>
        <span aria-hidden="true" />
      </div>
      <div className="grid">
        {schoolClasses.schoolClasses.map((schoolClass: SchoolClass) => (
          <Button
            key={schoolClass.id}
            type="button"
            variant="ghost"
            size="lg"
            className="bg-primary border-text/40 grid h-auto w-full grid-cols-[minmax(0,1fr)] justify-items-start rounded-none border-t-4 p-4 text-left text-xl whitespace-normal"
            onClick={() => handleSelectClass(schoolClass.id)}
          >
            <span>{schoolClass.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
