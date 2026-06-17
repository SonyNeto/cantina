import type { FC } from 'react';
import { Button } from '../../components/commons/Button';
import { useFormContext } from 'react-hook-form';
import type { NewOrderForm } from './types';
import { SHIFTS } from '../../constants/school/classestemp';

interface Props {
  onNext: () => void;
}

export const ShiftsStep: FC<Props> = ({ onNext }) => {
  const { setValue } = useFormContext<NewOrderForm>();

  function handleSelectShift(shiftId: NewOrderForm['shiftId']) {
    setValue('shiftId', shiftId, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue('order', []);
    setValue('classId', '');
    setValue('studentId', '');

    onNext();
  }

  return (
    <div className="b- flex flex-col gap-5">
      <div className="bg-tertiary border-text/30 relative flex w-screen items-center justify-center gap-2.5 border-b-4 px-6 py-4 text-xl [&_svg]:size-10 [&_svg]:shrink-0">
        <span>Escolha um turno</span>
      </div>
      {SHIFTS.map((shift) => (
        <Button
          key={shift.id}
          type="button"
          variant="primary"
          size="lg"
          onClick={() => handleSelectShift(shift.id)}
        >
          {shift.label}
        </Button>
      ))}
    </div>
  );
};
