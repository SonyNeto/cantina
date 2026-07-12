import type { FC } from 'react';
import { Check, Download } from 'pixelarticons/react';
import { Button } from '../../components/commons/Button';
import { Cooking, X } from '../../assets/icons/MenuIcons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader } from '../../components/commons/Loader';
import { toast } from 'sonner';
import { workspaceApiFetch } from '../../utils/api';
import type { OrderItem, Register } from '../../constants/canteen/types';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { Dialog, DialogTrigger, DialogContent } from '../../components/commons/Dialog';

type OrderItemWithDetails = {
  id: string;
  orderId: string;
  created_at: string;
  status: 'cooking' | 'ready';
  student: {
    id: string;
    name: string;
  } | null;
  schoolClass: {
    id: string;
    label: string;
  } | null;
  product: OrderItem['product'];
};

type OrderWithDetails = {
  id: string;
  created_at: string;
  student: OrderItemWithDetails['student'];
  schoolClass: OrderItemWithDetails['schoolClass'];
  items: OrderItem[];
};

type OrdersResponse = {
  orders: OrderWithDetails[];
};

type OrderItemParams = {
  orderId: string;
  itemId: string;
};

type ItemResponse = {
  item: OrderItem | null;
};

type RegisterResponse = {
  register: Register;
};

const getOrders = async (): Promise<OrdersResponse> => {
  const res = await workspaceApiFetch('/orders');
  return res.json();
};

export const Orders: FC = () => {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);

  const { data: orders = [], isPending } = useQuery({
    queryKey: ['orders', workspaceId],
    queryFn: getOrders,
    enabled: Boolean(workspaceId),
    select: (data) => data.orders,
  });

  const items = orders.flatMap((order) =>
    order.items.map((item) => ({
      ...item,
      orderId: order.id,
      created_at: order.created_at,
      student: order.student,
      schoolClass: order.schoolClass,
    })),
  );

  const updateOrderItemStatus = useMutation({
    mutationFn: async ({ orderId, itemId }: OrderItemParams): Promise<ItemResponse> => {
      const res = await workspaceApiFetch(`/orders/${orderId}/items/${itemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ready',
        }),
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const deleteOrderItem = useMutation({
    mutationFn: async ({ orderId, itemId }: OrderItemParams): Promise<ItemResponse> => {
      const res = await workspaceApiFetch(`/orders/${orderId}/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const postRegister = useMutation({
    mutationFn: async ({ orderId, itemId }: OrderItemParams): Promise<RegisterResponse> => {
      const res = await workspaceApiFetch(`/orders/${orderId}/items/${itemId}/register`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Erro ao mover item para registro');
      }

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['registers'] });
      toast.success('Pedido movido para registro');
    },
  });

  const cookingItems = items.filter((item) => item.status === 'cooking');
  const readyItems = items.filter((item) => item.status === 'ready');

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
          {cookingItems.map((item) => {
            const student = item.student;
            const schoolClass = item.schoolClass;
            if (!student || !schoolClass) return;

            return (
              <div className="app-row grid-cols-[minmax(0,1fr)_10ch_5ch] gap-5" key={item.id}>
                <div className="inline-flex items-center gap-2.5 [&_svg]:size-10 [&_svg]:shrink-0">
                  <span>{item.product.label}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-center">{student.name}</span>
                  <span className="text-center">{schoolClass.label}</span>
                </div>
                <div className="flex flex-col items-center gap-1 justify-self-end">
                  <Button
                    size="sm"
                    onClick={() =>
                      updateOrderItemStatus.mutate({ orderId: item.orderId, itemId: item.id })
                    }
                  >
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
                          deleteOrderItem.mutate({ orderId: item.orderId, itemId: item.id });
                          toast.success('Item removido com sucesso!');
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
          {readyItems.map((item) => {
            const student = item.student;
            const schoolClass = item.schoolClass;
            if (!student || !schoolClass) return;

            return (
              <div className="app-row grid-cols-[minmax(0,1fr)_5ch_7ch] gap-5" key={item.id}>
                <div className="inline-flex items-center gap-2.5 [&_svg]:size-10 [&_svg]:shrink-0">
                  <span>{item.product.label}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-center">{student.name}</span>
                  <span className="text-center">{schoolClass.label}</span>
                </div>
                <div className="flex flex-col items-center gap-1 justify-self-end">
                  <Button
                    size="sm"
                    onClick={() => {
                      postRegister.mutate({
                        orderId: item.orderId,
                        itemId: item.id,
                      });
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
