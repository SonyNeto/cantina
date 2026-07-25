import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ComponentPropsWithRef } from 'react';
import { toast } from 'sonner';
import { Check } from 'pixelarticons/react';
import type { Product } from '../../../constants/canteen/types';
import { workspaceApiFetch } from '../../../utils/api';
import { Button } from '../../../components/commons/Button';
import { X } from '../../../assets/icons/MenuIcons';
import { cn, fromCents, toCents } from '../../../utils/functions';
import { menuItemSchema } from './menuItemSchema';

type MenuItemInput = {
  id?: string;
  label: string;
  price: number;
};

type MenuItemResponse = {
  menuItem: Product;
};

type MenuItemFormProps = ComponentPropsWithRef<'form'> & {
  workspaceId: string | undefined;
  itemId?: string;
  onClose: () => void;
  method?: 'post' | 'update';
  defaultLabel?: string;
  defaultPrice?: number;
};

export const MenuItemForm = ({
  className,
  workspaceId,
  itemId,
  onClose,
  method = 'post',
  defaultLabel,
  defaultPrice,
}: MenuItemFormProps) => {
  const queryClient = useQueryClient();

  const createMenuItem = useMutation({
    mutationFn: async ({ label, price }: MenuItemInput): Promise<MenuItemResponse> => {
      const res = await workspaceApiFetch('/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label,
          price,
        }),
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', workspaceId] });
      onClose();
    },
  });

  const updateMenuItem = useMutation({
    mutationFn: async ({ id, label, price }: MenuItemInput): Promise<MenuItemResponse> => {
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
      queryClient.invalidateQueries({ queryKey: ['menuItems', workspaceId] });
      toast.success('Item atualizado com sucesso!');
      onClose();
    },
  });

  return (
    <form
      className={cn(
        'app-form-row z-50 flex min-w-0 justify-between overflow-hidden rounded-none px-6 whitespace-nowrap',
        className,
      )}
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

        const menuItem = {
          ...result.data,
          price: toCents(result.data.price),
        };

        if (method === 'post') {
          createMenuItem.mutate(menuItem);
        }

        if (method === 'update') {
          updateMenuItem.mutate({ id: itemId, ...menuItem });
        }
      }}
    >
      <div className="min-w-0">
        <input
          name="label"
          id={itemId ? `item-name-${itemId}` : 'add-item-name'}
          type="text"
          placeholder="Nome do Item"
          defaultValue={defaultLabel}
          className="app-input w-full max-w-[12ch] truncate"
        />
      </div>
      <div className="inline-flex min-w-0 items-center gap-1">
        <span>R$</span>
        <input
          name="price"
          id={itemId ? `item-price-${itemId}` : 'add-item-price'}
          type="number"
          step="0.01"
          placeholder="Preço"
          defaultValue={defaultPrice === undefined ? undefined : fromCents(defaultPrice).toFixed(2)}
          className="app-input w-full max-w-[6ch] text-end"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Button type="submit" variant="primary" size="sm">
          <Check />
        </Button>
        <Button variant="primary" size="sm" onClick={onClose}>
          <X />
        </Button>
      </div>
    </form>
  );
};
