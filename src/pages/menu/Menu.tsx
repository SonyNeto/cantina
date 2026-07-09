import { useState, type FC } from 'react';
import { Button } from '../../components/commons/Button';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../components/commons/Accordion';
import { Check, PenSquare, Plus } from 'pixelarticons/react';
import { TrashCan, X } from '../../assets/icons/MenuIcons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader } from '../../components/commons/Loader';
import type { Product } from '../../constants/canteen/types';
import { workspaceApiFetch } from '../../utils/api';
import { toast } from 'sonner';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { AddMenuItemForm } from './components/AddMenuItemForm';
import { menuItemSchema } from './components/menuItemSchema';

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
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success('Item removido com sucesso!');
    },
  });

  const updateMenuItem = useMutation({
    mutationFn: async ({ id, label, price }: Product): Promise<MenuItemResponse> => {
      const res = await workspaceApiFetch(`/menu-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label,
          price,
        }),
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success('Item atualizado com sucesso!');
    },
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formPosition, setFormPosition] = useState<FormPosition>(null);
  const isAdding = formPosition !== null;

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
            disabled={isAdding || editingIndex !== null}
            onClick={() => setFormPosition('top')}
            aria-label="Adicionar item"
            title="Adicionar item"
          >
            <Plus />
          </Button>
        </div>

        {formPosition === 'top' && (
          <AddMenuItemForm workspaceId={workspaceId} onClose={() => setFormPosition(null)} />
        )}

        <Accordion>
          {menuItems.map((item, idx) => {
            const isEditing = editingIndex === idx;

            return (
              <AccordionItem key={`menuitem-${item.label.trim().toLowerCase()}-${idx}`}>
                <div className="grid">
                  {isEditing ? (
                    <form
                      className="app-form-row z-50 col-start-1 row-start-1 flex min-w-0 justify-between overflow-hidden rounded-none whitespace-nowrap [&_svg]:size-10 [&_svg]:shrink-0"
                      id={`edit-item-form-${item.label.trim().toLowerCase()}-${idx}`}
                      onSubmit={(e) => {
                        e.preventDefault();

                        const formData = new FormData(e.currentTarget);
                        const result = menuItemSchema.safeParse({
                          label: String(formData.get('label') ?? ''),
                          price: String(formData.get('price') ?? ''),
                        });

                        if (!result.success) {
                          toast.error(result.error.issues[0].message);
                          return;
                        }

                        updateMenuItem.mutate({ id: item.id, ...result.data });
                        setEditingIndex(null);
                      }}
                    >
                      <div className="inline-flex min-w-0 items-center gap-2.5">
                        <input
                          id={`name-input-${item.label.trim().toLowerCase()}-${idx}`}
                          name="label"
                          type="text"
                          defaultValue={`${item.label}`}
                          className="app-input w-full max-w-[12ch] truncate"
                        />
                      </div>
                      <div className="inline-flex min-w-0 items-center gap-1">
                        <span>R$</span>
                        <input
                          id={`price-input-${item.label.trim().toLowerCase()}-${idx}`}
                          name="price"
                          type="number"
                          step="0.01"
                          defaultValue={`${item.price.toFixed(2)}`}
                          className="app-input w-full max-w-[6ch] text-end"
                        />
                      </div>
                    </form>
                  ) : (
                    <AccordionTrigger
                      render={
                        <Button
                          size="lg"
                          variant="ghost"
                          className="app-row app-row-action col-start-1 row-start-1 h-auto justify-between rounded-none py-6"
                          disabled={editingIndex !== null || isAdding}
                        >
                          <div className="inline-flex items-center gap-2.5">
                            <span>{item.label}</span>
                          </div>
                          <span>{`R$${item.price.toFixed(2)}`}</span>
                        </Button>
                      }
                    />
                  )}
                </div>

                <AccordionContent>
                  <div className="flex items-center gap-2.5">
                    {isEditing ? (
                      <div className="flex flex-col gap-2.5">
                        <Button
                          type="submit"
                          form={`edit-item-form-${item.label.trim().toLowerCase()}-${idx}`}
                          size="lg"
                          variant="primary"
                          className="w-40 justify-start p-2"
                        >
                          <Check />
                          <span>Salvar</span>
                        </Button>

                        <Button
                          size="lg"
                          variant="primary"
                          className="w-40 justify-start p-2"
                          onClick={() => setEditingIndex(null)}
                        >
                          <X />
                          <span>Cancelar</span>
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="lg"
                        variant="primary"
                        className="p-2"
                        onClick={() => {
                          setEditingIndex(idx);
                          setFormPosition(null);
                        }}
                      >
                        <PenSquare />
                        <span>Editar</span>
                      </Button>
                    )}
                    <Button
                      size="lg"
                      variant="primary"
                      className="p-2"
                      onClick={() => {
                        deleteMenuItem.mutate(item.id);
                        setEditingIndex(null);
                        setFormPosition(null);
                      }}
                    >
                      <TrashCan />
                      <span>Excluir</span>
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {formPosition === 'bottom' ? (
          <AddMenuItemForm workspaceId={workspaceId} onClose={() => setFormPosition(null)} />
        ) : (
          <Button
            size="lg"
            className="app-row app-row-action !h-auto !w-full justify-center gap-2.5 rounded-none border-b-0 py-4"
            variant="ghost"
            disabled={isAdding || editingIndex !== null}
            onClick={() => setFormPosition('bottom')}
          >
            <Plus />
            Adicionar item
          </Button>
        )}
      </div>
    </div>
  );
};
