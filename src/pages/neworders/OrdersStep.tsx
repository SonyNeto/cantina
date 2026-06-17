import { useState, type FC } from 'react';
import { Button } from '../../components/commons/Button';
import { useFormContext, useWatch } from 'react-hook-form';
import type { NewOrderForm } from './types';
import { ArrowLeft, Minus, Plus } from 'pixelarticons/react';
import { MENU } from '../../constants/canteen/menuitemstemp';

interface Props {
  onBack: () => void;
}

export const OrdersStep: FC<Props> = ({ onBack }) => {
  const { control, setValue } = useFormContext<NewOrderForm>();
  const [total, setTotal] = useState<number>(0);

  const order =
    useWatch({
      control,
      name: 'order',
    }) ?? [];

  function getMenuItemQuantityById(menuItemId: string) {
    const menuItem = order.find((menuItem) => menuItem.menuItemId === menuItemId);
    if (!menuItem) return 0;

    return menuItem.quantity;
  }

  function increaseQuantity(menuItemId: string) {
    if (!order.some((menuItem) => menuItem.menuItemId === menuItemId)) {
      setValue(
        'order',
        [
          ...order,
          {
            menuItemId,
            quantity: 1,
          },
        ],
        {
          shouldDirty: true,
          shouldValidate: true,
        },
      );

      return;
    }

    const updatedOrder = order.map((menuItem) => {
      if (menuItem.menuItemId !== menuItemId) return menuItem;

      return {
        ...menuItem,
        quantity: menuItem.quantity + 1,
      };
    });

    setValue('order', updatedOrder, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function decreaseQuantity(menuItemId: string) {
    const menuItem = order.find((menuItem) => menuItem.menuItemId === menuItemId);
    if (!menuItem) return;

    if (menuItem.quantity === 1) {
      const updatedOrder = order.filter((menuItem) => menuItem.menuItemId !== menuItemId);

      setValue('order', updatedOrder, {
        shouldDirty: true,
        shouldValidate: true,
      });

      return;
    }

    const updatedOrder = order.map((menuItem) => {
      if (menuItem.menuItemId !== menuItemId) return menuItem;

      return {
        ...menuItem,
        quantity: menuItem.quantity - 1,
      };
    });

    setValue('order', updatedOrder, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <>
      <div className="border-text m-6 flex h-fit flex-col border-4">
        <div className="bg-tertiary relative flex w-full items-center justify-center gap-2.5 px-6 py-4 text-xl [&_svg]:size-10">
          <Button variant={'ghost'} className="absolute left-4 z-50" disableHover onClick={onBack}>
            <ArrowLeft />
          </Button>
          <span>Cardápio</span>
        </div>
        <div className="border-text/30 text-text relative flex w-full items-center justify-end gap-2.5 border-t-4 p-2 text-xl [&_svg]:size-10 [&_svg]:shrink-0">
          <div className="flex gap-5">
            <span>Total: </span>
            <span>{`R$ ${total.toFixed(2)}`}</span>
          </div>
        </div>
        {MENU.ITEMS.map((item, idx) => {
          const quantity = getMenuItemQuantityById(item.id);

          return (
            <div
              key={`orderitem-${item.label.trim().toLowerCase()}-${idx}`}
              className="border-text/30 text-text inline-flex w-full items-center justify-between gap-2.5 border-t-4 p-4 text-xl"
            >
              <div className="inline-flex items-center gap-2.5 [&_svg]:size-10 [&_svg]:shrink-0">
                <item.icon />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span>{`R$${item.price.toFixed(2)}`}</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setTotal(total + item.price);
                    increaseQuantity(item.id);
                  }}
                >
                  <Plus />
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setTotal(Math.max(0, total - item.price));
                    decreaseQuantity(item.id);
                  }}
                >
                  <Minus />
                </Button>
                <span>{quantity}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="sticky bottom-4 flex items-center justify-center">
        <Button
          type="button"
          variant="primary"
          size="xl"
          className="border-text-hover bg-text text-primary border-4"
          onClick={onBack}
        >
          Concluir
        </Button>
      </div>
    </>
  );
};
