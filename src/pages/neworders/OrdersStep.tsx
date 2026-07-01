import { type FC } from 'react';
import { v4 as uuid } from 'uuid';
import { Button } from '../../components/commons/Button';
import { useFormContext, useWatch } from 'react-hook-form';
import { ArrowLeft, Minus, Plus } from 'pixelarticons/react';
import type { OrderForm, Product } from '../../constants/canteen/types';
import { useQuery } from '@tanstack/react-query';
import { Loader } from '../../components/commons/Loader';
import { apiUrl } from '../../utils/api';

interface Props {
  onBack: () => void;
}

type MenuItemsResponse = {
  menuItems: Product[];
};

const getMenuItems = async (): Promise<MenuItemsResponse> => {
  const res = await fetch(apiUrl('/menu-items'));
  return res.json();
};

export const OrdersStep: FC<Props> = ({ onBack }) => {
  const { data: menuItemsResponse, isPending } = useQuery({
    queryKey: ['menuItems'],
    queryFn: getMenuItems,
  });

  const { control, setValue } = useFormContext<OrderForm>();

  const items =
    useWatch({
      control,
      name: 'items',
    }) ?? [];

  const menuItems = menuItemsResponse?.menuItems ?? [];

  const total = items.reduce((sum, orderItem) => {
    const product = menuItems.find((item) => item.id === orderItem.productId);

    return sum + (product?.price ?? 0) * orderItem.quantity;
  }, 0);

  function getSelectedProductQuantity(productId: string) {
    const item = items.find((item) => item.productId === productId);
    if (!item) return 0;

    return item.quantity;
  }

  function increaseProductQuantity(productId: string) {
    if (!items.some((item) => item.productId === productId)) {
      setValue(
        'items',
        [
          ...items,
          {
            id: uuid(),
            productId,
            quantity: 1,
            status: 'cooking',
          },
        ],
        {
          shouldDirty: true,
          shouldValidate: true,
        },
      );

      return;
    }

    const updatedItems = items.map((item) => {
      if (item.productId !== productId) return item;

      return {
        ...item,
        quantity: item.quantity + 1,
      };
    });

    setValue('items', updatedItems, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function decreaseProductQuantity(productId: string) {
    const item = items.find((item) => item.productId === productId);
    if (!item) return;

    if (item.quantity === 1) {
      const updatedItems = items.filter((item) => item.productId !== productId);

      setValue('items', updatedItems, {
        shouldDirty: true,
        shouldValidate: true,
      });

      return;
    }

    const updatedItems = items.map((item) => {
      if (item.productId !== productId) return item;

      return {
        ...item,
        quantity: item.quantity - 1,
      };
    });

    setValue('items', updatedItems, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return isPending ? (
    <Loader />
  ) : (
    <>
      <div className="border-text m-6 flex h-fit flex-col overflow-hidden border-4">
        <div className="bg-tertiary grid w-full grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2.5 px-4 py-4 text-xl [&_svg]:size-10">
          <Button variant={'ghost'} className="justify-self-start" disableHover onClick={onBack}>
            <ArrowLeft />
          </Button>
          <span className="justify-self-center text-center">Cardápio</span>
          <span aria-hidden="true" />
        </div>
        <div className="border-text/40 text-text relative flex w-full items-center justify-end gap-2.5 border-t-4 p-2 text-xl [&_svg]:size-10 [&_svg]:shrink-0">
          <div className="flex gap-5">
            <span>Total: </span>
            <span>{`R$ ${total.toFixed(2)}`}</span>
          </div>
        </div>
        <div className="grid">
          {menuItems.map((item, idx) => {
            const quantity = getSelectedProductQuantity(item.id);

            return (
              <div
                key={`orderitem-${item.label.trim().toLowerCase()}-${idx}`}
                className="border-text/40 text-text grid w-full grid-cols-[minmax(0,1fr)_7ch_2rem_2rem_1.5ch] items-center gap-2.5 border-t-4 px-4 py-3 text-xl"
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
      </div>
      <div className="sticky bottom-4 flex items-center justify-center">
        <Button
          type="submit"
          variant="primary"
          size="xl"
          className="border-text-hover bg-text text-primary border-4"
        >
          Concluir
        </Button>
      </div>
    </>
  );
};
