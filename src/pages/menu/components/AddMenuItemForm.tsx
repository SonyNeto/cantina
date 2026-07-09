import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Product } from '../../../constants/canteen/types';
import { workspaceApiFetch } from '../../../utils/api';
import { Button } from '../../../components/commons/Button';
import { Check } from 'pixelarticons/react';
import { X } from '../../../assets/icons/MenuIcons';
import { menuItemSchema } from './menuItemSchema';

type CreateMenuItemInput = {
  label: string;
  price: number;
};

type MenuItemResponse = {
  menuItem: Product;
};

type AddMenuItemFormProps = {
  workspaceId: string | undefined;
  onClose: () => void;
};

export const AddMenuItemForm = ({ workspaceId, onClose }: AddMenuItemFormProps) => {
  const queryClient = useQueryClient();

  const createMenuItem = useMutation({
    mutationFn: async ({ label, price }: CreateMenuItemInput): Promise<MenuItemResponse> => {
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

  return (
    <form
      className="app-form-row z-50 flex min-w-0 justify-between overflow-hidden rounded-none px-6 whitespace-nowrap"
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

        createMenuItem.mutate(result.data);
      }}
    >
      <div className="min-w-0">
        <input
          name="label"
          id="add-item-name"
          type="text"
          placeholder="Nome do Item"
          className="app-input w-full max-w-[12ch] truncate"
        />
      </div>
      <div className="inline-flex min-w-0 items-center gap-1">
        <span>R$</span>
        <input
          name="price"
          id="add-item-price"
          type="number"
          step="0.01"
          placeholder="Preço"
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
