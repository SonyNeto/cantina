import { useState, type FC } from 'react';
import { Form, useForm } from 'react-hook-form';
import { Button } from '../../components/commons/Button';
import { ArrowLeft } from 'pixelarticons/react';
import { MENU } from '../../constants/menuitemstemp';

type NewOrderForm = {
  shift: string;
  classId: string;
  studentId: string;
  order: {
    menuItemId: string;
    quantity: number;
  };
};

const STEPS = {
  SHIFTS: 'SHIFTS',
  CLASSES: 'CLASSES',
  STUDENTS: 'STUDENTS',
  ORDER: 'ORDER',
};

export const NewOrders: FC = () => {
  const [step, setStep] = useState<(typeof STEPS)[keyof typeof STEPS]>(STEPS.SHIFTS);

  const form = useForm<NewOrderForm>({
    defaultValues: {
      shift: '',
      classId: '',
      studentId: '',
      order: {
        menuItemId: '',
        quantity: 0,
      },
    },
  });

  function onSubmit() {
    return;
  }

  return (
    <div className="flex flex-col justify-center">
      <Form //onSubmit={handleSubmit(onSubmit)}
        {...form}
      >
        {step === STEPS.SHIFTS && (
          <div className="b- flex flex-col gap-5">
            <div className="bg-tertiary border-text/30 relative flex w-screen items-center justify-center gap-2.5 border-b-4 px-6 py-4 text-xl [&_svg]:size-10">
              <span>Escolha um turno</span>
            </div>
            <Button variant={'primary'} size={'lg'} onClick={() => setStep(STEPS.CLASSES)}>
              Manhã
            </Button>
            <Button variant={'primary'} size={'lg'} onClick={() => setStep(STEPS.CLASSES)}>
              Tarde
            </Button>
          </div>
        )}

        {step === STEPS.CLASSES && (
          <div className="flex flex-col gap-5">
            <div className="bg-tertiary border-text/30 relative flex w-screen items-center justify-center gap-2.5 border-b-4 px-6 py-4 text-xl [&_svg]:size-10">
              <Button
                variant={'ghost'}
                className="absolute left-4 z-50"
                disableHover
                onClick={() => setStep(STEPS.SHIFTS)}
              >
                <ArrowLeft />
              </Button>
              <span>Escolha uma turma</span>
            </div>
            <Button variant={'primary'} size={'lg'} onClick={() => setStep(STEPS.STUDENTS)}>
              1° ano
            </Button>
            <Button variant={'primary'} size={'lg'} onClick={() => setStep(STEPS.STUDENTS)}>
              2° ano
            </Button>
          </div>
        )}

        {step === STEPS.STUDENTS && (
          <div className="flex flex-col gap-5">
            <div className="bg-tertiary border-text/30 relative flex w-screen items-center justify-center gap-2.5 border-b-4 px-6 py-4 text-xl [&_svg]:size-10">
              <Button
                variant={'ghost'}
                className="absolute left-4 z-50"
                disableHover
                onClick={() => setStep(STEPS.CLASSES)}
              >
                <ArrowLeft />
              </Button>
              <span>Escolha um aluno</span>
            </div>
            <Button variant={'primary'} size={'lg'} onClick={() => setStep(STEPS.ORDER)}>
              Aluno 1
            </Button>
            <Button variant={'primary'} size={'lg'} onClick={() => setStep(STEPS.ORDER)}>
              Aluno 2
            </Button>
          </div>
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

            {MENU.ITEMS.map((item) => (
              <Button
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
      </Form>
    </div>
  );
};
