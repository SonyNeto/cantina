import { useState, type FC } from 'react';
import { Drawer, DrawerContent, DrawerTrigger, DrawerSwipeArea } from './commons/Drawer';
import { Menu } from 'pixelarticons/react';
import { Button } from './commons/Button';
import { Link, useNavigate } from 'react-router';
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
          className="fixed top-0 left-0 z-10 h-screen w-[10vw]"
        />
        <div className="bg-secondary border-text/40 sticky top-0 left-0 z-50 flex w-screen flex-col flex-row justify-between border-b-4 p-4">
          <DrawerTrigger
            render={
              <Button size="lg" className="z-50 self-start rounded-full" variant="ghost">
                <Menu />
              </Button>
            }
          ></DrawerTrigger>

          <DrawerContent className="border-text/40 flex h-full flex-col border-r-4">
            <WorkspaceSelect />
            
            {NAVMENU.ITEMS.map((item, idx) => {
              const pedidos = item.label === 'Pedidos';

              return (
                <Link
                  key={`navmenu-${item.label.trim().toLowerCase()}-${idx}`}
                  to={item.route}
                  className="border-text/40 hover:bg-hover text-text hover:text-text-hover relative inline-flex w-full items-center gap-2.5 border-b-4 p-4 text-xl whitespace-nowrap [&_svg]:size-10 [&_svg]:shrink-0"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon width={12} height={12} />
                  {item.label}
                  {pedidos && <NotificationBadge count={totalActiveOrders} />}
                </Link>
              );
            })}
            <Button variant="danger" size="xl" className="self-end w-full rounded-none border-b-4 border-text/40" onClick={() => logoutMutation.mutate()}>
              Fazer logout
            </Button>
          </DrawerContent>

          <img rel="icon" src="/favicon.png" className="size-10" />
        </div>
      </Drawer>
    )
  );
};
