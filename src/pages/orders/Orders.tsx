import type { FC } from 'react';
import { Check, Download } from 'pixelarticons/react';
import { Button } from '../../components/commons/Button';
import { Cooking, X } from '../../assets/icons/MenuIcons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader } from '../../components/commons/Loader';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';
import type { Order, Product, Register } from '../../constants/canteen/types';

type OrderWithDetails = {
  id: string;
  quantity: number;
  created_at: string;
  total: number;
  status: 'cooking' | 'ready';
  student: {
    id: string;
    name: string;
  };
  schoolClass: {
    id: string;
    label: string;
  };
  product: Product;
};

type OrdersResponse = {
  orderItems: OrderWithDetails[];
};

type RegisterOrderInput = {
  sourceOrderId: string;
  product: Product;
  created_at: string;
  studentId: string;
  total: number;
};

type OrderResponse = {
  order: Order | null;
};

type RegisterResponse = {
  register: Register;
};

const getOrdersWithDetails = async (): Promise<OrdersResponse> => {
  const res = await apiFetch('/orders/items');
  return res.json();
};

export const Orders: FC = () => {
  const queryClient = useQueryClient();

  const { data: ordersResponse, isPending } = useQuery({
    queryKey: ['orderItems'],
    queryFn: getOrdersWithDetails,
  });

  const updateOrderStatus = useMutation({
    mutationFn: async (orderId: string): Promise<OrderResponse> => {
      const res = await apiFetch(`/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ready',
        }),
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderItems'] });
    },
  });

  const deleteOrder = useMutation({
    mutationFn: async (orderId: string): Promise<OrderResponse> => {
      const res = await apiFetch(`/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderItems'] });
    },
  });

  const postRegister = useMutation({
    mutationFn: async ({
      sourceOrderId,
      product,
      created_at,
      studentId,
      total,
    }: RegisterOrderInput): Promise<RegisterResponse> => {
      const res = await apiFetch('/registers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sourceOrderId,
          product,
          created_at,
          studentId,
          total,
        }),
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registers'] });
      toast.success('Pedido movido para registro');
    },
  });

  const orders = ordersResponse?.orderItems ?? [];
  const cookingOrders = orders.filter((order) => order.status === 'cooking');
  const readyOrders = orders.filter((order) => order.status === 'ready');

  return isPending ? (
    <Loader />
  ) : (
    <div className="border-text m-6 flex h-fit flex-col overflow-hidden border-4">
      <div className="bg-tertiary flex w-full flex-col items-center justify-center px-4 py-4 text-xl [&_svg]:size-10 [&_svg]:shrink-0">
        <span className="text-center">Em preparação</span>
        <Cooking />
      </div>

      <div className="grid">
        {cookingOrders.map((order) => {
          const student = order.student;
          if (!student) return;

          return (
            <div
              className="border-text/40 text-text grid w-full grid-cols-[minmax(0,1fr)_10ch_5ch] items-center gap-5 border-t-4 px-4 py-3 text-xl"
              key={order.id}
            >
              <div className="inline-flex items-center gap-2.5 [&_svg]:size-10 [&_svg]:shrink-0">
                <span>{order.product.label}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-center">{order.student.name}</span>
                <span className="text-center">{order.schoolClass.label}</span>
              </div>
              <div className="flex flex-col items-center gap-1 justify-self-end">
                <Button size="sm" onClick={() => updateOrderStatus.mutate(order.id)}>
                  <Check />
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    deleteOrder.mutate(order.id);
                    toast.success('Item removido com sucesso!');
                  }}
                >
                  <X />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-tertiary flex w-full flex-col items-center justify-center border-t-4 px-4 py-4 text-xl [&_svg]:size-10 [&_svg]:shrink-0">
        <span className="text-center">Pronto</span>
        <Check />
      </div>

      <div className="grid">
        {readyOrders.map((order) => {
          const student = order.student;
          if (!student) return;

          return (
            <div
              className="border-text/40 text-text grid w-full grid-cols-[minmax(0,1fr)_5ch_7ch] items-center gap-5 border-t-4 px-4 py-3 text-xl"
              key={order.id}
            >
              <div className="inline-flex items-center gap-2.5 [&_svg]:size-10 [&_svg]:shrink-0">
                <span>{order.product.label}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-center">{order.student.name}</span>
                <span className="text-center">{order.schoolClass.label}</span>
              </div>
              <div className="flex flex-col items-center gap-1 justify-self-end">
                <Button
                  size="sm"
                  onClick={() => {
                    postRegister.mutate({
                      sourceOrderId: order.id,
                      product: order.product,
                      created_at: order.created_at,
                      studentId: order.student.id,
                      total: order.total,
                    });
                    deleteOrder.mutate(order.id);
                  }}
                >
                  <Download />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
