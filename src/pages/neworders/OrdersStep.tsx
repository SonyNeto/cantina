import { useState, type FC } from 'react';
import { Button } from '../../components/commons/Button';
import { useFormContext, useWatch } from 'react-hook-form';
import { ArrowLeft, Banknote, Check, Minus, PenSquare, Plus } from 'pixelarticons/react';
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
  const [haveDetails, setHaveDetails] = useState<boolean>(false);

  const { data: menuItems = [], isPending } = useQuery({
    queryKey: ['menuItems', workspaceId],
    queryFn: getMenuItems,
    enabled: Boolean(workspaceId),
    select: (data) => data.menuItems,
  });

  const { control, register, setValue, unregister } = useFormContext<OrderForm>();

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

  function setDetails(details: string) {
    setValue('details', details, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  const selectedProductsSummary = items.reduce<Record<string, Product & { quantity: number }>>(
    (summary, item) => {
      const product = menuItems.find((menuItem) => menuItem.id === item.productId);
      if (!product) return summary;

      summary[product.id] ??= { ...product, quantity: 0 };
      summary[product.id].quantity++;

      return summary;
    },
    {},
  );

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
            <div className="ml-auto grid w-full max-w-sm grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-2">
              {Object.keys(selectedProductsSummary).length > 0 && (
                <>
                  <ul className="col-span-3 grid max-h-32 gap-y-1.5 overflow-y-auto pr-1 pb-2 text-xl">
                    {Object.values(selectedProductsSummary).map((product) => (
                      <li
                        key={product.id}
                        className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-baseline gap-x-2.5"
                      >
                        <span aria-hidden="true" />
                        <span className="min-w-0 truncate text-right" title={product.label}>
                          <span className="tabular-nums">{product.quantity}x </span>
                          {`${product.label}:`}
                        </span>
                        <span className="text-right whitespace-nowrap tabular-nums">
                          {`R$ ${fromCents(product.price * product.quantity).toFixed(2)}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-border/45 col-span-3 col-start-1 border-b-4" />
                </>
              )}

              <div className="col-span-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2.5">
                <div
                  className={
                    isImmediatePayment
                      ? 'flex flex-col items-center gap-2.5'
                      : 'flex items-center gap-2.5'
                  }
                >
                  <Button
                    variant="primary"
                    size="lg"
                    className="border-success/60 bg-success text-primary hover:bg-success/85"
                    aria-label={isImmediatePayment ? 'Remover pagamento' : 'Adicionar pagamento'}
                    aria-pressed={isImmediatePayment}
                    onClick={() => {
                      const nextIsImmediatePayment = !isImmediatePayment;

                      setIsImmediatePayment(nextIsImmediatePayment);
                      setPayment(nextIsImmediatePayment ? total : 0);
                    }}
                  >
                    <Banknote />
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    aria-label={haveDetails ? 'Remover observação' : 'Adicionar observação'}
                    aria-pressed={haveDetails}
                    onClick={() => {
                      setHaveDetails(!haveDetails);
                      unregister('details');
                    }}
                  >
                    <PenSquare />
                  </Button>
                </div>

                <div className="col-span-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-2">
                  {isImmediatePayment ? (
                    <>
                      <span className="text-right">Pagamento:</span>
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
                      {change > 0 && (
                        <div className="col-span-2 grid grid-cols-[1fr_2rem] items-center gap-x-2.5">
                          <span className="text-right text-xl">Deixar troco como saldo</span>
                          <span className="relative block size-8 justify-self-end">
                            <input
                              type="checkbox"
                              {...register('keepChange')}
                              aria-label="Deixar troco como saldo"
                              className="peer absolute inset-0 z-10 size-full cursor-pointer appearance-none outline-none"
                            />
                            <span
                              aria-hidden="true"
                              className="bg-panel-contrast sunken peer-checked:bg-success peer-checked:text-primary peer-focus-visible:ring-accent/35 flex size-8 items-center justify-center peer-focus-visible:ring-[3px] [&_svg]:size-6 [&_svg]:opacity-0 peer-checked:[&_svg]:opacity-100"
                            >
                              <Check />
                            </span>
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-right">Total:</span>
                      <span className="text-right tabular-nums">{`R$ ${fromCents(total).toFixed(2)}`}</span>
                    </>
                  )}
                </div>
              </div>

              {haveDetails && (
                <textarea
                  maxLength={100}
                  placeholder="Escreva uma observação sobre o pedido"
                  className="app-input col-span-3 !h-auto !p-2 w-full"
                  onChange={(event) => {
                    setDetails(event.currentTarget.value);
                  }}
                />
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
