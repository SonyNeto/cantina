import { useState, type FC } from 'react';
import { Check, PenSquare, Plus } from 'pixelarticons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '../../components/commons/Button';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '../../components/commons/Dialog';
import { Loader } from '../../components/commons/Loader';
import { SwipeActionRow } from '../../components/commons/SwipeActionRow';
import { TrashCan } from '../../assets/icons/MenuIcons';
import type { Product } from '../../constants/canteen/types';
import { workspaceApiFetch } from '../../utils/api';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { MenuItemForm } from './components/MenuItemForm';

type MenuItemsResponse = {
  menuItems: Product[];
};

type MenuItemResponse = {
  menuItem: Product;
};

type FormPosition = 'top' | 'bottom' | null;

const getMenuItems = async (): Promise<MenuItemsResponse> => {
  const res = await workspaceApiFetch('/menu-items');
  return res.json();
};

export const Menu: FC = () => {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [drawerOpenIndex, setDrawerOpenIndex] = useState<number | null>(null);
  const [formPosition, setFormPosition] = useState<FormPosition>(null);
  const isAdding = formPosition !== null;

  const { data: menuItems = [], isPending } = useQuery({
    queryKey: ['menuItems', workspaceId],
    queryFn: getMenuItems,
    enabled: Boolean(workspaceId),
    select: (data) => data.menuItems,
  });

  const deleteMenuItem = useMutation({
    mutationFn: async (id: string): Promise<MenuItemResponse> => {
      const res = await workspaceApiFetch(`/menu-items/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', workspaceId] });
      toast.success('Item removido com sucesso!');
    },
  });

  return isPending ? (
    <Loader />
  ) : (
    <div className="app-page">
      <div className="app-panel">
        <div className="app-panel-header-accent grid-cols-[2.5rem_minmax(0,1fr)_2.5rem]">
          <span aria-hidden={true} className="col-start-1" />
          <span className="col-start-2 text-center">Cardápio</span>
          <Button
            variant="ghost"
            className="border-border/45 bg-panel hover:bg-info-soft hover:text-info focus-visible:ring-accent/35 col-start-3 !size-12 place-items-center self-center justify-self-end rounded-none border-4 !p-0 transition-colors outline-none focus-visible:ring-[3px] [&_svg]:size-7"
            disabled={isAdding}
            onClick={() => {
              setFormPosition('top');
              setEditingIndex(null);
              setDrawerOpenIndex(null);
            }}
            aria-label="Adicionar item"
            title="Adicionar item"
          >
            <Plus />
          </Button>
        </div>

        <div className="app-list">
          {formPosition === 'top' && (
            <MenuItemForm workspaceId={workspaceId} onClose={() => setFormPosition(null)} />
          )}

          {menuItems.map((item, idx) => {
            const isEditing = editingIndex === idx;
            const isDrawerOpen = drawerOpenIndex === idx;

            return (
              <div key={item.id} className="app-row relative isolate overflow-hidden !p-0">
                {isEditing ? (
                  <MenuItemForm
                    className="relative z-10 !border-0"
                    workspaceId={workspaceId}
                    itemId={item.id}
                    method="update"
                    defaultLabel={item.label}
                    defaultPrice={item.price}
                    onClose={() => {
                      setEditingIndex(null);
                      setDrawerOpenIndex(idx);
                    }}
                  />
                ) : (
                  <div className="relative z-10 grid w-full grid-cols-[minmax(0,1fr)_8ch] items-center gap-2.5 px-4 py-3">
                    <span className="min-w-0 truncate">{item.label}</span>
                    <span className="text-center tabular-nums">{`R$${item.price.toFixed(2)}`}</span>
                  </div>
                )}

                <SwipeActionRow
                  handleWidth={16}
                  openWidth={136}
                  open={isDrawerOpen}
                  onOpenChange={() => setDrawerOpenIndex(isDrawerOpen ? null : idx)}
                  captureInteractions={!isEditing}
                >
                  <Button
                    onClick={() => {
                      setEditingIndex(isEditing ? null : idx);
                      setDrawerOpenIndex(isDrawerOpen ? null : idx);
                      setFormPosition(null);
                    }}
                    disabled={isEditing}
                  >
                    <PenSquare />
                  </Button>

                  <Dialog>
                    <DialogTrigger
                      render={<Button size="md" variant="primary" disabled={isEditing} />}
                    >
                      <TrashCan />
                    </DialogTrigger>
                    <DialogContent title="Atenção">
                      <span>Tem certeza que deseja excluir o item?</span>
                      <DialogClose
                        render={
                          <Button
                            onClick={() => {
                              deleteMenuItem.mutate(item.id);
                              setEditingIndex(null);
                              setFormPosition(null);
                              setDrawerOpenIndex(null);
                            }}
                          />
                        }
                      >
                        <Check />
                        <span>Sim</span>
                      </DialogClose>
                    </DialogContent>
                  </Dialog>
                </SwipeActionRow>
              </div>
            );
          })}

          {formPosition === 'bottom' ? (
            <MenuItemForm workspaceId={workspaceId} onClose={() => setFormPosition(null)} />
          ) : (
            <Button
              size="lg"
              className="app-row app-row-action !h-auto !w-full justify-center gap-2.5 rounded-none py-4"
              variant="ghost"
              disabled={isAdding}
              onClick={() => {
                setFormPosition('bottom');
                setEditingIndex(null);
                setDrawerOpenIndex(null);
              }}
            >
              <Plus />
              Adicionar item
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
