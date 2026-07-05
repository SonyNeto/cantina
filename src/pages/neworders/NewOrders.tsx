import { useState, type FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ShiftsStep } from './ShiftsStep';
import { ClassesStep } from './ClassesStep';
import { StudentsStep } from './StudentsStep';
import { OrdersStep } from './OrdersStep';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Order, OrderForm } from '../../constants/canteen/types';
import dayjs from 'dayjs';
import type { ShiftId } from '../../constants/school/types';
import { toast } from 'sonner';
import { workspaceApiFetch } from '../../utils/api';

const STEPS = {
  SHIFTS: 'SHIFTS',
  CLASSES: 'CLASSES',
  STUDENTS: 'STUDENTS',
  ORDER: 'ORDER',
};

type Step = (typeof STEPS)[keyof typeof STEPS];

type CreateOrdersResponse = {
  orders: Order[];
};

export const NewOrders: FC = () => {
  const [step, setStep] = useState<Step>(STEPS.SHIFTS);
  const [shiftId, setShiftId] = useState<ShiftId | ''>('');
  const [classId, setClassId] = useState<string>('');
  const queryClient = useQueryClient();

  const form = useForm<OrderForm>({
    defaultValues: {
      studentId: '',
      created_at: dayjs().format('DD-MM-YYYY'),
      items: [],
    },
  });

  const createOrders = useMutation({
    mutationFn: async (data: OrderForm): Promise<CreateOrdersResponse> => {
      const res = await workspaceApiFetch('/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Erro ao criar pedido');
      }

      return res.json();
    },

    onSuccess: () => {
      toast.success('Pedido realizado com sucesso!');
      setStep(STEPS.STUDENTS);
      queryClient.invalidateQueries({ queryKey: ['orderItems'] });
    },

    onError: () => {
      toast.error('Não foi possível realizar o pedido.');
    },
  });

  function onSubmit(data: OrderForm) {
    createOrders.mutate(data);
  }

  return (
    <div className="flex flex-col justify-center">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {step === STEPS.SHIFTS && (
            <ShiftsStep
              onNext={(selectedShiftId) => {
                setStep(STEPS.CLASSES);
                setShiftId(selectedShiftId);
              }}
            />
          )}

          {step === STEPS.CLASSES && (
            <ClassesStep
              shiftId={shiftId}
              onNext={(selectedClassId) => {
                setStep(STEPS.STUDENTS);
                setClassId(selectedClassId);
              }}
              onBack={() => {
                setStep(STEPS.SHIFTS);
                setShiftId('');
              }}
            />
          )}

          {step === STEPS.STUDENTS && (
            <StudentsStep
              shiftId={shiftId}
              classId={classId}
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
