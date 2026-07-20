import { useState, type FC } from 'react';
import { Drawer, DrawerContent, DrawerTrigger, DrawerSwipeArea } from './commons/Drawer';
import { Logout, Menu } from 'pixelarticons/react';
import { Button } from './commons/Button';
import { NavLink, useNavigate } from 'react-router';
import NAVMENU from '../constants/navmenu.ts';
import { NotificationBadge } from './commons/NotificationBadge.tsx';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, workspaceApiFetch } from '../utils/api';
import ROUTES from '../constants/routes.ts';
import { toast } from 'sonner';
import { WorkspaceSelect } from './WorkspaceSelect.tsx';
import { useWorkspaceStore } from '../stores/useWorkspaceStore.ts';
import { canAccessWorkspaceRole } from '../utils/workspaceAccess.ts';
import { ThemeSwitch } from './ThemeSwitch.tsx';

type OrdersResponse = {
  totalActiveItems: number;
};

const getOrders = async (): Promise<OrdersResponse> => {
  const res = await workspaceApiFetch('/orders');
  return res.json();
};

export const NavBar: FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
  const workspaceRole = useWorkspaceStore((state) => state.workspace?.role);
  const clearWorkspace = useWorkspaceStore((state) => state.clearWorkspace);

  const { data: totalActiveItems = 0, isPending } = useQuery({
    queryKey: ['orders', workspaceId],
    queryFn: getOrders,
    enabled: Boolean(workspaceId),
    select: (data) => data.totalActiveItems,
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

  return (
    (!workspaceId || !isPending) && (
      <Drawer swipeDirection="right" open={isOpen} onOpenChange={setIsOpen}>
        <DrawerSwipeArea
          swipeDirection="right"
          className="fixed top-0 left-0 z-10 h-screen w-5 sm:w-8"
        />
        <div className="bg-panel-header raised sticky top-0 left-0 z-50 flex h-[4.5rem] w-full items-center justify-between px-4">
          <DrawerTrigger
            render={<Button size="lg" className="z-50 rounded-none" variant="ghost" />}
          >
            <Menu />
          </DrawerTrigger>

          <DrawerContent className="flex h-full flex-col">
            <WorkspaceSelect />

            {NAVMENU.ITEMS.filter((item) =>
              canAccessWorkspaceRole(workspaceRole, item.accessLevel),
            ).map((item, idx) => {
              const orders = item.label === 'Pedidos';

              return (
                <NavLink
                  key={`navmenu-${item.label.trim().toLowerCase()}-${idx}`}
                  to={item.route}
                  className={({ isActive }) =>
                    [
                      'relative inline-flex w-full items-center gap-2.5 px-4 py-4 text-xl whitespace-nowrap outline-none [&_svg]:size-9 [&_svg]:shrink-0',
                      isActive
                        ? 'bg-info-soft text-info sunken'
                        : 'text-text hover:bg-info-soft hover:text-info focus-visible:bg-info-soft focus-visible:text-info raised',
                    ].join(' ')
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon width={12} height={12} />
                  {item.label}
                  {orders && totalActiveItems > 0 && <NotificationBadge count={totalActiveItems} />}
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

          <div className="inline-flex items-center gap-5">
            <ThemeSwitch />
            <img rel="icon" src="/favicon.png" className="size-10" />
          </div>
        </div>
      </Drawer>
    )
  );
};
