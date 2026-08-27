import { useState, type FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ShiftsStep } from './ShiftsStep';
import { SchoolClassesStep } from './SchoolClassesStep';
import { StudentsStep } from './StudentsStep';
import { OrdersStep } from './OrdersStep';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Order, OrderForm } from '../../constants/canteen/types';
import dayjs from 'dayjs';
import type { ShiftId } from '../../constants/school/types';
import { toast } from 'sonner';
import { workspaceApiFetch } from '../../utils/api';
import { orderFormSchema } from './orderFormSchema';

const STEPS = {
  SHIFTS: 'SHIFTS',
  SCHOOL_CLASSES: 'SCHOOL_CLASSES',
  STUDENTS: 'STUDENTS',
  ORDER: 'ORDER',
};

type Step = (typeof STEPS)[keyof typeof STEPS];

type CreateOrdersResponse = {
  order: Order;
};

export const NewOrders: FC = () => {
  const [step, setStep] = useState<Step>(STEPS.SHIFTS);
  const [shiftId, setShiftId] = useState<ShiftId | ''>('');
  const [schoolClassId, setSchoolClassId] = useState<string>('');
  const queryClient = useQueryClient();

  const form = useForm<OrderForm>({
    defaultValues: {
      studentId: '',
      created_at: dayjs().format('DD-MM-YYYY'),
      payment: 0,
      keepChange: false,
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
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },

    onError: () => {
      toast.error('Não foi possível realizar o pedido.');
    },
  });

  function onSubmit(data: OrderForm) {
    const result = orderFormSchema.safeParse(data);

    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    createOrders.mutate(result.data);
  }

  return (
    <div className="app-page">
      <FormProvider {...form}>
        <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
          {step === STEPS.SHIFTS && (
            <ShiftsStep
              onNext={(selectedShiftId) => {
                setStep(STEPS.SCHOOL_CLASSES);
                setShiftId(selectedShiftId);
              }}
            />
          )}

          {step === STEPS.SCHOOL_CLASSES && (
            <SchoolClassesStep
              shiftId={shiftId}
              onNext={(selectedSchoolClassId) => {
                setStep(STEPS.STUDENTS);
                setSchoolClassId(selectedSchoolClassId);
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
              schoolClassId={schoolClassId}
              onNext={() => setStep(STEPS.ORDER)}
              onBack={() => setStep(STEPS.SCHOOL_CLASSES)}
            />
          )}

          {step === STEPS.ORDER && (
            <OrdersStep
              onBack={() => setStep(STEPS.STUDENTS)}
              isSubmitting={createOrders.isPending}
            />
          )}
        </form>
      </FormProvider>
    </div>
  );
};
