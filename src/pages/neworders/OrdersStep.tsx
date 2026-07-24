import { useState, type FC } from 'react';
import { Button } from '../../components/commons/Button';
import { useFormContext, useWatch } from 'react-hook-form';
import { ArrowLeft, Banknote, Minus, Plus } from 'pixelarticons/react';
import type { OrderForm, Product } from '../../constants/canteen/types';
import { useQuery } from '@tanstack/react-query';
import { Loader } from '../../components/commons/Loader';
import { workspaceApiFetch } from '../../utils/api';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { fromCents, toCents } from '../../utils/functions';

interface Props {
  onBack: () => void;
  isSubmitting: boolean;
}

type MenuItemsResponse = {
  menuItems: Product[];
};

const getMenuItems = async (): Promise<MenuItemsResponse> => {
  const res = await workspaceApiFetch('/menu-items');
  return res.json();
};

export const OrdersStep: FC<Props> = ({ onBack, isSubmitting }) => {
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
  const [isImmediatePayment, setIsImmediatePayment] = useState<boolean>(false);

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

  const payment =
    useWatch({
      control,
      name: 'payment',
    }) ?? 0;

  const total = items.reduce((sum, orderItem) => {
    const product = menuItems.find((item) => item.id === orderItem.productId);

    return sum + (product?.price ?? 0);
  }, 0);

  const change = Math.max(payment - total, 0);

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

  function setPayment(value: number) {
    setValue('payment', value, {
      shouldDirty: true,
      shouldValidate: true,
    });
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
                <span className="text-right tabular-nums">{`R$${fromCents(item.price).toFixed(2)}`}</span>
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
          <div className="app-total-bar [&_svg]:size-10 [&_svg]:shrink-0">
            <div className="ml-auto grid w-full max-w-sm grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-2">
              {isImmediatePayment ? (
                <>
                  <div className="inline-flex min-w-0 items-center justify-end gap-2.5">
                    <Button
                      variant="primary"
                      size="lg"
                      className="border-success/60 bg-success text-primary hover:bg-success/85"
                      aria-label="Remover pagamento"
                      aria-pressed="true"
                      onClick={() => {
                        setIsImmediatePayment(false);
                        setPayment(0);
                      }}
                    >
                      <Banknote />
                    </Button>
                    <span>Pagamento:</span>
                  </div>
                  <div className="inline-flex min-w-0 items-center justify-end gap-1">
                    <span>R$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      defaultValue={fromCents(total).toFixed(2)}
                      aria-label="Valor do pagamento"
                      className="app-input w-full max-w-[7ch] text-end tabular-nums"
                      onChange={(event) => {
                        const value = Number(event.currentTarget.value.replace(',', '.'));

                        if (Number.isFinite(value)) {
                          setPayment(Math.max(toCents(value), 0));
                        }
                      }}
                      onBlur={(event) => {
                        const input = event.currentTarget;
                        const parsedValue = Number(input.value.replace(',', '.'));
                        const valueInCents = Number.isFinite(parsedValue)
                          ? Math.max(toCents(parsedValue), 0)
                          : 0;

                        input.value = fromCents(valueInCents).toFixed(2);
                        setPayment(valueInCents);
                      }}
                    />
                  </div>

                  <span className="text-right">- Total:</span>
                  <span className="text-right tabular-nums">{`R$ ${fromCents(total).toFixed(2)}`}</span>

                  <div className="border-border/45 col-span-2 border-b-4" />
                  <span className="text-right">Troco:</span>
                  <span
                    className="text-right tabular-nums"
                    aria-label={`Troco: R$ ${fromCents(change).toFixed(2)}`}
                  >
                    {`R$ ${fromCents(change).toFixed(2)}`}
                  </span>
                </>
              ) : (
                <div className="col-span-2 flex items-center justify-end gap-2.5">
                  <Button
                    variant="primary"
                    size="lg"
                    className="border-success/60 bg-success text-primary hover:bg-success/85"
                    aria-label="Adicionar pagamento"
                    aria-pressed="false"
                    onClick={() => {
                      setIsImmediatePayment(true);
                      setPayment(total);
                    }}
                  >
                    <Banknote />
                  </Button>
                  <span className="text-right">Total:</span>
                  <span className="text-right tabular-nums">{`R$ ${fromCents(total).toFixed(2)}`}</span>
                </div>
              )}
            </div>
          </div>

          <div className="app-action-footer">
            <Button
              type="submit"
              disabled={isSubmitting}
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
