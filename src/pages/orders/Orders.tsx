import { useState, type FC } from 'react';
import { ArrowBarRight, Check } from 'pixelarticons/react';
import { Button } from '../../components/commons/Button';
import { Cooking, X } from '../../assets/icons/MenuIcons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader } from '../../components/commons/Loader';
import { toast } from 'sonner';
import { workspaceApiFetch } from '../../utils/api';
import type { OrderItem, Register } from '../../constants/canteen/types';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { Dialog, DialogContent, DialogClose } from '../../components/commons/Dialog';
import { SwipeActionRow, type SwipeSide } from '../../components/commons/SwipeActionRow';

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
  orders: Record<string, OrderWithDetails[]>;
  totalActiveItems: number;
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
  const [openDrawer, setOpenDrawer] = useState<{
    drawerId: string;
    side: SwipeSide;
  } | null>(null);

  const { data: ordersData, isPending } = useQuery({
    queryKey: ['orders', workspaceId],
    queryFn: getOrders,
    enabled: Boolean(workspaceId),
    select: (data) => data.orders,
  });

  const ordersBySchoolClass = ordersData ?? {};

  const itemsBySchoolClass = Object.fromEntries(
    Object.entries(ordersBySchoolClass).map(([schoolClassLabel, orders]) => [
      schoolClassLabel,
      orders.flatMap((order) =>
        order.items.map((item) => ({
          ...item,
          orderId: order.id,
          created_at: order.created_at,
          student: order.student,
          schoolClass: order.schoolClass,
        })),
      ),
    ]),
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

      if (!res.ok) {
        throw new Error('Erro ao atualizar status do item');
      }

      return res.json();
    },

    onMutate: async ({ orderId, itemId }: OrderItemParams) => {
      await queryClient.cancelQueries({
        queryKey: ['orders', workspaceId],
      });

      const previousOrders = queryClient.getQueryData<OrdersResponse>(['orders', workspaceId]);

      queryClient.setQueryData<OrdersResponse>(['orders', workspaceId], (currentData) => {
        if (!currentData) return currentData;

        return {
          ...currentData,
          orders: Object.fromEntries(
            Object.entries(currentData.orders).map(([schoolClassLabel, orders]) => [
              schoolClassLabel,
              orders.map((order) => {
                if (order.id !== orderId) return order;

                return {
                  ...order,
                  items: order.items.map((item) =>
                    item.id === itemId
                      ? {
                          ...item,
                          status: 'ready' as const,
                        }
                      : item,
                  ),
                };
              }),
            ]),
          ),
        };
      });

      return { previousOrders };
    },

    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['orders', workspaceId] });
    },

    onError: (_error, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(['orders', workspaceId], context.previousOrders);
      }

      toast.error('Não foi possível marcar o item como pronto.');
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
      queryClient.invalidateQueries({ queryKey: ['orders', workspaceId] });
      toast.success('Item removido com sucesso!');
    },

    onError: () => {
      toast.error('Não foi possível remover o item.');
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
      queryClient.invalidateQueries({ queryKey: ['orders', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['registers', workspaceId] });
      toast.success('Pedido movido para registro');
    },
  });

  return isPending ? (
    <Loader />
  ) : (
    <div className="app-page app-orders">
      <div className="app-content">
        <div className="app-header-accent bg-warning-soft text-warning flex items-center justify-center gap-3 [&_svg]:size-10 [&_svg]:shrink-0">
          <span className="text-center">Em preparação</span>
          <Cooking />
        </div>

        <div className="app-list">
          {Object.entries(itemsBySchoolClass).map(([schoolClassLabel, items]) => {
            const cookingItems = items.filter((item) => item.status === 'cooking');

            if (cookingItems.length === 0) return null;

            return (
              <div key={schoolClassLabel} className="app-group">
                <div className="app-row app-row-label text-muted bg-secondary/35 px-4 text-xl">
                  {schoolClassLabel}
                </div>
                {cookingItems.map((item) => {
                  const student = item.student;
                  if (!student) return null;

                  const openSide =
                    openDrawer?.drawerId === `${item.id}-${item.status}` ? openDrawer.side : null;

                  return (
                    <div
                      className="app-row app-row-tall relative grid-cols-[1fr_1fr] gap-5 [&_svg]:size-10 [&_svg]:shrink-0"
                      key={item.id}
                    >
                      <div className="inline-flex items-center justify-center gap-2.5 text-center">
                        <span>{item.product.label}</span>
                      </div>
                      <span className="text-center">{student.name}</span>

                      <SwipeActionRow
                        delta={8}
                        openSide={openSide}
                        onOpenSideChange={(nextSide) => {
                          setOpenDrawer(
                            nextSide
                              ? { drawerId: `${item.id}-${item.status}`, side: nextSide }
                              : null,
                          );

                          if (nextSide !== 'right') return;

                          updateOrderItemStatus.mutate(
                            { orderId: item.orderId, itemId: item.id },
                            {
                              onSettled: () => {
                                setOpenDrawer((currentDrawer) =>
                                  currentDrawer?.drawerId === `${item.id}-${item.status}` &&
                                  currentDrawer.side === 'right'
                                    ? null
                                    : currentDrawer,
                                );
                              },
                            },
                          );
                        }}
                        left={{
                          render: <X className="text-danger-soft size-10" />,
                          handleWidth: 16,
                          handleClassName: 'bg-danger',
                          openWidth: 136,
                          openThreshold: 0.8,
                          progressStyle: (progress) => ({
                            backgroundColor: `color-mix(in oklab, var(--color-danger-soft), var(--color-danger) ${Math.trunc(progress * 100)}%)`,
                          }),
                        }}
                        right={{
                          render: <Check className="text-success-soft size-10" />,
                          handleWidth: 16,
                          handleClassName: 'bg-success',
                          openWidth: 136,
                          openThreshold: 0.8,
                          progressStyle: (progress) => ({
                            backgroundColor: `color-mix(in oklab, var(--color-success-soft), var(--color-success) ${Math.trunc(progress * 100)}%)`,
                          }),
                        }}
                      />

                      <Dialog
                        open={openSide === 'left'}
                        onOpenChange={(nextOpen) => {
                          if (nextOpen) return;

                          setOpenDrawer(null);
                        }}
                      >
                        <DialogContent title="Atenção">
                          <span>Tem certeza que deseja excluir o pedido?</span>
                          <DialogClose
                            render={
                              <Button
                                onClick={() => {
                                  deleteOrderItem.mutate({
                                    orderId: item.orderId,
                                    itemId: item.id,
                                  });
                                }}
                              />
                            }
                          >
                            <Check />
                            <span>Sim</span>
                          </DialogClose>
                        </DialogContent>
                      </Dialog>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="app-header-accent border-border/40 bg-success-soft text-success flex w-full items-center justify-center gap-3 border-t-4 px-4 text-xl font-bold [&_svg]:size-10 [&_svg]:shrink-0">
          <span className="text-center">Pronto</span>
          <Check />
        </div>

        <div className="app-list">
          {Object.entries(itemsBySchoolClass).map(([schoolClassLabel, items]) => {
            const readyItems = items.filter((item) => item.status === 'ready');

            if (readyItems.length === 0) return null;

            return (
              <div key={schoolClassLabel} className="app-group">
                <div className="app-row app-row-label text-muted px-4 text-xl">
                  {schoolClassLabel}
                </div>
                {readyItems.map((item) => {
                  const student = item.student;
                  if (!student) return null;

                  const openSide =
                    openDrawer?.drawerId === `${item.id}-${item.status}` ? openDrawer.side : null;

                  return (
                    <div
                      className="app-row app-row-tall relative grid-cols-[1fr_1fr] gap-5 [&_svg]:size-10 [&_svg]:shrink-0"
                      key={item.id}
                    >
                      <div className="inline-flex items-center justify-center gap-2.5 text-center">
                        <span>{item.product.label}</span>
                      </div>
                      <span className="text-center">{student.name}</span>

                      <SwipeActionRow
                        delta={8}
                        openSide={openSide}
                        onOpenSideChange={(nextSide) => {
                          setOpenDrawer(
                            nextSide
                              ? { drawerId: `${item.id}-${item.status}`, side: nextSide }
                              : null,
                          );

                          if (nextSide !== 'right') return;

                          postRegister.mutate(
                            { orderId: item.orderId, itemId: item.id },
                            {
                              onSettled: () => {
                                setOpenDrawer((currentDrawer) =>
                                  currentDrawer?.drawerId === `${item.id}-${item.status}` &&
                                  currentDrawer.side === 'right'
                                    ? null
                                    : currentDrawer,
                                );
                              },
                            },
                          );
                        }}
                        right={{
                          render: <ArrowBarRight className="text-panel size-10" />,
                          handleWidth: 16,
                          handleClassName: 'bg-border',
                          openWidth: 136,
                          openThreshold: 0.8,
                          progressStyle: (progress) => ({
                            backgroundColor: `color-mix(in oklab, var(--color-primary), var(--color-border) ${Math.trunc(progress * 100)}%)`,
                          }),
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
