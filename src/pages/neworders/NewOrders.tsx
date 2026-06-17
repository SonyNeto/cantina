import { useState, type FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { NewOrderForm } from './types';
import { ShiftsStep } from './ShiftsStep';
import { ClassesStep } from './ClassesStep';
import { StudentsStep } from './StudentsStep';
import { OrdersStep } from './OrdersStep';

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

          {step === STEPS.ORDER && <OrdersStep onBack={() => setStep(STEPS.STUDENTS)} />}
        </form>
      </FormProvider>
    </div>
  );
};
