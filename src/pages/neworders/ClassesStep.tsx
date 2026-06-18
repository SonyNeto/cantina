import type { FC } from 'react';
import { Button } from '../../components/commons/Button';
import { useFormContext, useWatch } from 'react-hook-form';
import type { NewOrderForm } from './types';
import { getClassesByShiftId } from '../../utils/selectors';
import { ArrowLeft } from 'pixelarticons/react';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export const ClassesStep: FC<Props> = ({ onNext, onBack }) => {
  const { control, setValue } = useFormContext<NewOrderForm>();

  const shiftId = useWatch({
    control,
    name: 'shiftId',
  });

  const classes = getClassesByShiftId(shiftId);

  function handleSelectClass(classId: NewOrderForm['classId']) {
    setValue('classId', classId, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue('order', []);
    setValue('studentId', '');

    onNext();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-tertiary border-text/40 relative flex w-screen items-center justify-center gap-2.5 border-b-4 px-6 py-4 text-xl [&_svg]:size-10">
        <Button variant={'ghost'} className="absolute left-4 z-50" disableHover onClick={onBack}>
          <ArrowLeft />
        </Button>
        <span>Escolha uma turma</span>
      </div>
      {classes.map((schoolClass) => (
        <Button
          key={schoolClass.id}
          type="button"
          variant="primary"
          size="lg"
          onClick={() => handleSelectClass(schoolClass.id)}
        >
          {schoolClass.label}
        </Button>
      ))}
    </div>
  );
};
