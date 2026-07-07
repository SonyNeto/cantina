import { useState, type FC } from 'react';
import { Drawer, DrawerContent, DrawerTrigger, DrawerSwipeArea } from './commons/Drawer';
import { Logout, Menu } from 'pixelarticons/react';
import { Button } from './commons/Button';
import { NavLink, useNavigate } from 'react-router';
import NAVMENU from '../constants/navmenu.ts';
import { NotificationBadge } from './commons/NotificationBadge.tsx';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, workspaceApiFetch } from '../utils/api';
import type { Product } from '../constants/canteen/types';
import ROUTES from '../constants/routes.ts';
import { toast } from 'sonner';
import { WorkspaceSelect } from './WorkspaceSelect.tsx';
import { useWorkspaceStore } from '../stores/useWorkspaceStore.ts';

type OrderWithDetails = {
  id: string;
  quantity: number;
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

const getOrdersWithDetails = async (): Promise<OrdersResponse> => {
  const res = await workspaceApiFetch('/orders/items');
  return res.json();
};

export const NavBar: FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
  const clearWorkspace = useWorkspaceStore((state) => state.clearWorkspace);

  const { data: orders = [], isPending } = useQuery({
    queryKey: ['orderItems', workspaceId],
    queryFn: getOrdersWithDetails,
    enabled: Boolean(workspaceId),
    select: (data) => data.orderItems,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch('/logout', {
        method: 'GET',
      });

      if (!res.ok) {
        throw new Error('Falha ao sair');
      }

      return null;
    },

    onSuccess: () => {
      clearWorkspace();
      queryClient.clear();
      navigate(ROUTES.LOGIN, { replace: true });
    },

    onError: () => {
      toast.error('Falha ao realizar logout');
    },
  });

  const totalActiveOrders = orders.filter((order) => order.status === 'cooking').length;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    (!workspaceId || !isPending) && (
      <Drawer swipeDirection="right" open={isOpen} onOpenChange={setIsOpen}>
        <DrawerSwipeArea
          swipeDirection="right"
          className="fixed top-0 left-0 z-10 h-screen w-5 sm:w-8"
        />
        <div className="border-border/35 bg-panel-header sticky top-0 left-0 z-50 flex h-[4.5rem] w-full items-center justify-between border-b-4 px-4 shadow-[0_4px_0_var(--color-shadow)]">
          <DrawerTrigger
            render={
              <Button size="lg" className="z-50 rounded-none" variant="ghost">
                <Menu />
              </Button>
            }
          ></DrawerTrigger>

          <DrawerContent className="flex h-full flex-col">
            <WorkspaceSelect />
            {NAVMENU.ITEMS.map((item, idx) => {
              const pedidos = item.label === 'Pedidos';

              return (
                <NavLink
                  key={`navmenu-${item.label.trim().toLowerCase()}-${idx}`}
                  to={item.route}
                  className={({ isActive }) =>
                    [
                      'border-border/35 relative inline-flex w-full items-center gap-2.5 border-b-4 px-4 py-4 text-xl whitespace-nowrap transition-colors outline-none [&_svg]:size-9 [&_svg]:shrink-0',
                      isActive
                        ? 'bg-info-soft text-info'
                        : 'text-text hover:bg-info-soft hover:text-info focus-visible:bg-info-soft focus-visible:text-info',
                    ].join(' ')
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon width={12} height={12} />
                  {item.label}
                  {pedidos && <NotificationBadge count={totalActiveOrders} />}
                </NavLink>
              );
            })}
            <Button
              variant="ghost"
              size="lg"
              className="text-danger hover:bg-danger-soft hover:text-danger mt-auto w-full justify-start rounded-none px-4 py-4 text-xl [&_svg]:size-9"
              onClick={() => logoutMutation.mutate()}
            >
              <Logout />
              Fazer logout
            </Button>
          </DrawerContent>

          <img rel="icon" src="/favicon.png" className="size-10" />
        </div>
      </Drawer>
    )
  );
};
