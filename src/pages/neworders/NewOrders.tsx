import { useState, type FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from '../../components/commons/Button';
import { ArrowLeft } from 'pixelarticons/react';
import { MENU } from '../../constants/canteen/menuitemstemp';
import type { NewOrderForm } from './types';
import { ShiftsStep } from './ShiftsStep';
import { ClassesStep } from './ClassesStep';
import { StudentsStep } from './StudentsStep';

const STEPS = {
  SHIFTS: 'SHIFTS',
  CLASSES: 'CLASSES',
  STUDENTS: 'STUDENTS',
  ORDER: 'ORDER',
};

type Step = (typeof STEPS)[keyof typeof STEPS];

export const NewOrders: FC = () => {
  const [step, setStep] = useState<Step>(STEPS.SHIFTS);

  const form = useForm<NewOrderForm>({
    defaultValues: {
      shiftId: '',
      classId: '',
      studentId: '',
      order: [],
    },
  });

  function onSubmit() {
    return;
  }

  return (
    <div className="flex flex-col justify-center">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {step === STEPS.SHIFTS && <ShiftsStep onNext={() => setStep(STEPS.CLASSES)} />}

          {step === STEPS.CLASSES && (
            <ClassesStep
              onNext={() => setStep(STEPS.STUDENTS)}
              onBack={() => setStep(STEPS.SHIFTS)}
            />
          )}

          {step === STEPS.STUDENTS && (
            <StudentsStep
              onNext={() => setStep(STEPS.ORDER)}
              onBack={() => setStep(STEPS.CLASSES)}
            />
          )}

          {step === STEPS.ORDER && (
            <div className="border-text m-6 flex h-fit flex-col border-4">
              <div className="bg-tertiary relative flex w-full items-center justify-center gap-2.5 px-6 py-4 text-xl [&_svg]:size-10">
                <Button
                  variant={'ghost'}
                  className="absolute left-4 z-50"
                  disableHover
                  onClick={() => setStep(STEPS.STUDENTS)}
                >
                  <ArrowLeft />
                </Button>
                <span>Cardápio</span>
              </div>

              {MENU.ITEMS.map((item, idx) => (
                <Button
                  key={`orderitem-${item.label.trim().toLowerCase()}-${idx}`}
                  size="lg"
                  variant="ghost"
                  className="bg-secondary border-text/30 col-start-1 row-start-1 w-full justify-between rounded-none border-t-4 px-6 py-8"
                >
                  <div className="inline-flex items-center gap-2.5">
                    <item.icon />
                    <span>{item.label}</span>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  );
};
