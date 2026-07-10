import type { FC } from 'react';
import { Check, Download } from 'pixelarticons/react';
import { Button } from '../../components/commons/Button';
import { Cooking, X } from '../../assets/icons/MenuIcons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader } from '../../components/commons/Loader';
import { toast } from 'sonner';
import { workspaceApiFetch } from '../../utils/api';
import type { Order, Product, Register } from '../../constants/canteen/types';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { Dialog, DialogTrigger, DialogContent } from '../../components/commons/Dialog';

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
  const res = await workspaceApiFetch('/orders/items');
  return res.json();
};

export const Orders: FC = () => {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);

  const { data: orders = [], isPending } = useQuery({
    queryKey: ['orderItems', workspaceId],
    queryFn: getOrdersWithDetails,
    enabled: Boolean(workspaceId),
    select: (data) => data.orderItems,
  });

  const updateOrderStatus = useMutation({
    mutationFn: async (orderId: string): Promise<OrderResponse> => {
      const res = await workspaceApiFetch(`/orders/${orderId}/status`, {
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
      const res = await workspaceApiFetch(`/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderItems'] });
      toast.success('Item removido com sucesso!');
    },
  });

  const postRegister = useMutation({
    mutationFn: async ({
      product,
      created_at,
      studentId,
      total,
    }: RegisterOrderInput): Promise<RegisterResponse> => {
      const res = await workspaceApiFetch('/registers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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

  const cookingOrders = orders.filter((order) => order.status === 'cooking');
  const readyOrders = orders.filter((order) => order.status === 'ready');

  return isPending ? (
    <Loader />
  ) : (
    <div className="app-page">
      <div className="app-panel">
        <div className="app-panel-header-accent flex flex-col items-center justify-center [&_svg]:size-10 [&_svg]:shrink-0">
          <span className="text-center">Em preparação</span>
          <Cooking />
        </div>

        <div className="app-list">
          {cookingOrders.map((order) => {
            const student = order.student;
            if (!student) return;

            return (
              <div className="app-row grid-cols-[minmax(0,1fr)_10ch_5ch] gap-5" key={order.id}>
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
                  <Dialog>
                    <DialogTrigger render={<Button size="sm" variant="primary" />}>
                      <X />
                    </DialogTrigger>
                    <DialogContent title="Atenção">
                      <span>Tem certeza que deseja excluir o pedido?</span>
                      <Button
                        onClick={() => {
                          deleteOrder.mutate(order.id);
                        }}
                      >
                        <Check />
                        <span>Sim</span>
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-border/40 bg-success-soft text-success flex w-full flex-col items-center justify-center border-b-4 px-4 py-4 text-xl font-bold [&_svg]:size-10 [&_svg]:shrink-0">
          <span className="text-center">Pronto</span>
          <Check />
        </div>

        <div className="app-list">
          {readyOrders.map((order) => {
            const student = order.student;
            if (!student) return;

            return (
              <div className="app-row grid-cols-[minmax(0,1fr)_5ch_7ch] gap-5" key={order.id}>
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
    </div>
  );
};
