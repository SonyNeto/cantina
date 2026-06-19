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
    <div className="border-text m-6 flex h-fit flex-col overflow-hidden border-4">
      <div className="bg-tertiary grid w-full place-items-center gap-2.5 px-6 py-4 text-xl [&_svg]:size-10 [&_svg]:shrink-0">
        <span className="text-center">Escolha um turno</span>
      </div>
      <div className="grid">
        {SHIFTS.map((shift) => (
          <Button
            key={shift.id}
            type="button"
            variant="ghost"
            size="lg"
            className="bg-primary border-text/40 grid h-auto w-full grid-cols-[minmax(0,1fr)] justify-items-start rounded-none border-t-4 p-4 text-left text-xl whitespace-normal"
            onClick={() => handleSelectShift(shift.id)}
          >
            <span>{shift.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
