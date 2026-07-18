import { type FC } from 'react';
import { Button } from '../../components/commons/Button';
import { useFormContext, useWatch } from 'react-hook-form';
import { ArrowLeft, Minus, Plus } from 'pixelarticons/react';
import type { OrderForm, Product } from '../../constants/canteen/types';
import { useQuery } from '@tanstack/react-query';
import { Loader } from '../../components/commons/Loader';
import { workspaceApiFetch } from '../../utils/api';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';

interface Props {
  onBack: () => void;
}

type MenuItemsResponse = {
  menuItems: Product[];
};

const getMenuItems = async (): Promise<MenuItemsResponse> => {
  const res = await workspaceApiFetch('/menu-items');
  return res.json();
};

export const OrdersStep: FC<Props> = ({ onBack }) => {
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);

  const { data: menuItems = [], isPending } = useQuery({
    queryKey: ['menuItems', workspaceId],
    queryFn: getMenuItems,
    enabled: Boolean(workspaceId),
    select: (data) => data.menuItems,
  });

  const { control, setValue } = useFormContext<OrderForm>();

  const items =
    useWatch({
      control,
      name: 'items',
    }) ?? [];

  const total = items.reduce((sum, orderItem) => {
    const product = menuItems.find((item) => item.id === orderItem.productId);

    return sum + (product?.price ?? 0);
  }, 0);

  function getSelectedProductQuantity(productId: string) {
    return items.filter((item) => item.productId === productId).length;
  }

  function increaseProductQuantity(productId: string) {
    setValue('items', [...items, { productId }], {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function decreaseProductQuantity(productId: string) {
    const itemIndex = items.findLastIndex((item) => item.productId === productId);
    if (itemIndex === -1) return;

    setValue(
      'items',
      items.filter((_, index) => index !== itemIndex),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  return isPending ? (
    <Loader />
  ) : (
    <>
      <div className="app-content">
        <div className="app-header grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] [&_svg]:size-10">
          <Button variant={'ghost'} className="justify-self-start" disableHover onClick={onBack}>
            <ArrowLeft />
          </Button>
          <span className="justify-self-center text-center">Cardápio</span>
          <span aria-hidden="true" />
        </div>

        <div className="app-list">
          {menuItems.map((item, idx) => {
            const quantity = getSelectedProductQuantity(item.id);

            return (
              <div
                key={`orderitem-${item.label.trim().toLowerCase()}-${idx}`}
                className="app-row grid-cols-[minmax(0,1fr)_7ch_2.5rem_2.5rem_2ch]"
              >
                <div className="inline-flex min-w-0 items-center gap-2.5 [&_svg]:size-10 [&_svg]:shrink-0">
                  <span>{item.label}</span>
                </div>
                <span className="text-right tabular-nums">{`R$${item.price.toFixed(2)}`}</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => decreaseProductQuantity(item.id)}
                >
                  <Minus />
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => increaseProductQuantity(item.id)}
                >
                  <Plus />
                </Button>
                <span className="text-center tabular-nums">{quantity}</span>
              </div>
            );
          })}
        </div>

        <footer className="app-footer">
          <div className="app-total-bar justify-end [&_svg]:size-10 [&_svg]:shrink-0">
            <div className="flex gap-5">
              <span>Total: </span>
              <span>{`R$ ${total.toFixed(2)}`}</span>
            </div>
          </div>

          <div className="app-action-footer">
            <Button
              type="submit"
              variant="primary"
              size="xl"
              className="border-border/70 w-full max-w-sm"
            >
              Concluir
            </Button>
          </div>
        </footer>
      </div>
    </>
  );
};
