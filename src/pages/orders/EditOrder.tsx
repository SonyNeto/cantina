import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import type { FC } from 'react';
import type { Order, OrderForm } from '../../constants/canteen/types';
import ROUTES from '../../constants/routes';
import { Loader } from '../../components/commons/Loader';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { workspaceApiFetch } from '../../utils/api';
import { OrdersStep } from '../neworders/OrdersStep';
import { orderFormSchema } from '../neworders/orderFormSchema';

type OrderResponse = {
  order: Order | null;
  student: {
    id: string;
    name: string;
  } | null;
};

type EditOrderFormProps = {
  order: Order;
  studentName: string;
};

type UpdateOrderResponse = {
  order: Order;
};

const getOrder = async (orderId: string): Promise<OrderResponse> => {
  const res = await workspaceApiFetch(`/orders/${orderId}`);

  if (!res.ok) {
    throw new Error('Erro ao buscar pedido');
  }

  return res.json();
};

const EditOrderForm: FC<EditOrderFormProps> = ({ order, studentName }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
  const form = useForm<OrderForm>({
    defaultValues: {
      studentId: order.studentId,
      created_at: order.created_at,
      payment: order.payment,
      keepChange: order.keepChange,
      details: order.details,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.product.id,
        status: item.status,
      })),
    },
  });

  const updateOrder = useMutation({
    mutationFn: async (data: OrderForm): Promise<UpdateOrderResponse> => {
      const res = await workspaceApiFetch(`/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment: data.payment,
          keepChange: data.keepChange,
          details: data.details,
          items: data.items,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? 'Erro ao atualizar pedido');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['order', workspaceId, order.id] });
      toast.success('Pedido atualizado com sucesso!');
      navigate(`/${ROUTES.ORDERS}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Não foi possível atualizar o pedido.');
    },
  });

  function onSubmit(data: OrderForm) {
    const result = orderFormSchema.safeParse(data);

    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    updateOrder.mutate(result.data);
  }

  return (
    <div className="app-page">
      <FormProvider {...form}>
        <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
          <OrdersStep
            title="Editar pedido"
            subtitle={studentName}
            submitLabel="Salvar"
            protectReadyItems
            paymentLocked={order.hasRegisteredItems}
            isSubmitting={updateOrder.isPending}
            onBack={() => navigate(`/${ROUTES.ORDERS}`)}
          />
        </form>
      </FormProvider>
    </div>
  );
};

export const EditOrder: FC = () => {
  const { orderId = '' } = useParams<{ orderId: string }>();
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
  const { data, isPending, isError } = useQuery({
    queryKey: ['order', workspaceId, orderId],
    queryFn: () => getOrder(orderId),
    enabled: Boolean(workspaceId && orderId),
  });

  if (isPending) return <Loader />;

  if (isError || !data?.order) {
    return (
      <div className="app-page app-content items-center justify-center p-4 text-center">
        Pedido não encontrado.
      </div>
    );
  }

  return (
    <EditOrderForm
      order={data.order}
      studentName={data.student?.name ?? 'Aluno não encontrado'}
    />
  );
};
