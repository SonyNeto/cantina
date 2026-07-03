import { useState, type FC } from 'react';
import { v4 as uuid } from 'uuid';
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
import { apiUrl } from '../../utils/api';
import { toast } from 'sonner';

type MenuItemsResponse = {
  menuItems: Product[];
};

type CreateMenuItemInput = {
  label: string;
  price: number;
};

type MenuItemResponse = {
  menuItem: Product;
};

const getMenuItems = async (): Promise<MenuItemsResponse> => {
  const res = await fetch(apiUrl('/menu-items'));
  return res.json();
};

export const Menu: FC = () => {
  const queryClient = useQueryClient();

  const { data: menuItemsResponse, isPending } = useQuery({
    queryKey: ['menuItems'],
    queryFn: getMenuItems,
  });

  const createMenuItem = useMutation({
    mutationFn: async ({ label, price }: CreateMenuItemInput): Promise<MenuItemResponse> => {
      const res = await fetch(apiUrl('/menu-items'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: uuid(),
          label,
          price,
        }),
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });

  const deleteMenuItem = useMutation({
    mutationFn: async (id: string): Promise<MenuItemResponse> => {
      const res = await fetch(apiUrl(`/menu-items/${id}`), {
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
      const res = await fetch(apiUrl(`/menu-items/${id}`), {
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
  const menuItems = menuItemsResponse?.menuItems ?? [];

  return isPending ? (
    <Loader />
  ) : (
    <div className="border-text m-6 flex h-fit flex-col overflow-hidden border-4">
      <div className="bg-tertiary grid w-full place-items-center gap-2.5 px-6 py-4 text-xl">
        <span className="text-center">Cardápio</span>
      </div>

      <Accordion>
        {menuItems.map((item, idx) => {
          const isEditing = editingIndex === idx;

          return (
            <AccordionItem key={`menuitem-${item.label.trim().toLowerCase()}-${idx}`}>
              <div className="grid">
                {isEditing ? (
                  <form
                    className="bg-hover/30 border-text/40 z-50 col-start-1 row-start-1 flex w-full min-w-0 items-center justify-between gap-2.5 overflow-hidden rounded-none border-t-4 px-4 py-3 text-xl font-medium whitespace-nowrap [&_svg]:size-10 [&_svg]:shrink-0"
                    id={`edit-item-form-${item.label.trim().toLowerCase()}-${idx}`}
                    onSubmit={(e) => {
                      e.preventDefault();

                      const formData = new FormData(e.currentTarget);
                      const label = formData.get('label') as string;
                      const price = Number(formData.get('price'));

                      updateMenuItem.mutate({ id: item.id, label, price });
                      setEditingIndex(null);
                    }}
                  >
                    <div className="inline-flex min-w-0 items-center gap-2.5">
                      <input
                        id={`name-input-${item.label.trim().toLowerCase()}-${idx}`}
                        name="label"
                        type="text"
                        defaultValue={`${item.label}`}
                        className="border-text/40 w-full max-w-[12ch] min-w-0 truncate border-4 px-2"
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
                        className="border-text/40 w-full max-w-[6ch] min-w-0 border-4 px-2 text-end"
                      />
                    </div>
                  </form>
                ) : (
                  <AccordionTrigger
                    render={
                      <Button
                        size="lg"
                        variant="ghost"
                        className="bg-primary border-text/40 col-start-1 row-start-1 w-full justify-between rounded-none border-t-4 px-4 py-8"
                        disabled={editingIndex !== null}
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
                      onClick={() => setEditingIndex(idx)}
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
      {editingIndex !== -1 ? (
        <Button
          size="lg"
          className="border-text/40 !h-full !w-full justify-center gap-2.5 rounded-none border-t-4 px-4 py-3 text-xl"
          variant="ghost"
          disabled={editingIndex !== null}
          onClick={() => setEditingIndex(-1)}
        >
          <Plus />
          Adicionar item
        </Button>
      ) : (
        <form
          className="bg-hover/30 border-text/40 z-50 flex w-full min-w-0 items-center justify-between gap-2.5 overflow-hidden rounded-none border-t-4 px-6 py-3 text-xl font-medium whitespace-nowrap"
          onSubmit={(e) => {
            e.preventDefault();

            const formData = new FormData(e.currentTarget);
            const label = formData.get('label') as string;
            const price = Number(formData.get('price'));

            createMenuItem.mutate({ label, price });
            setEditingIndex(null);
          }}
        >
          <div className="min-w-0">
            <input
              name="label"
              id={`add-item-name`}
              type="text"
              placeholder="Nome do Item"
              className="border-text/40 w-full max-w-[12ch] min-w-0 truncate border-4 px-2"
            />
          </div>
          <div className="inline-flex min-w-0 items-center gap-1">
            <span>R$</span>
            <input
              name="price"
              id={`add-item-price`}
              type="number"
              step="0.01"
              placeholder="Preço"
              className="border-text/40 w-full max-w-[6ch] min-w-0 border-4 px-2 text-end"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Button type="submit" variant="primary" size="sm">
              <Check />
            </Button>
            <Button variant="primary" size="sm" onClick={() => setEditingIndex(null)}>
              <X />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
