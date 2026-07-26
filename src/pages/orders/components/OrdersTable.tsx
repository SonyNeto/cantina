import { Fragment, useState, type FC } from 'react';
import { Check, PenSquare } from 'pixelarticons/react';
import { Button } from '../../../components/commons/Button';
import { Dialog, DialogClose, DialogContent } from '../../../components/commons/Dialog';
import {
  SwipeActionRow,
  type SwipeDrawerAction,
  type SwipeSide,
} from '../../../components/commons/SwipeActionRow';
import type { OrderStatus, Product } from '../../../constants/canteen/types';
import { cn } from '../../../utils/functions';

type OrderTableItem = {
  orderId: string;
  created_at: string;
  details?: string;
  student: {
    id: string;
    name: string;
  } | null;
  schoolClass: {
    id: string;
    label: string;
  } | null;
  id: string;
  product: Product;
  status: OrderStatus;
};

type ActionConfirmation = {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: (item: OrderTableItem) => void;
};

type OrdersTableAction = SwipeDrawerAction & {
  onOpen?: (item: OrderTableItem, closeDrawer: () => void) => void;
  confirmation?: ActionConfirmation;
};

type OrdersTableProps = {
  itemsBySchoolClass: Record<string, OrderTableItem[]>;
  status: OrderStatus;
  actions: Partial<Record<SwipeSide, OrdersTableAction>>;
  labelClassName?: string;
};

const swipeSides: SwipeSide[] = ['left', 'right'];

export const OrdersTable: FC<OrdersTableProps> = ({
  itemsBySchoolClass,
  status,
  actions,
  labelClassName,
}) => {
  const [openDrawer, setOpenDrawer] = useState<{
    drawerId: string;
    side: SwipeSide;
  } | null>(null);

  return (
    <div className="app-list scroll-pb-20 pb-20">
      {Object.entries(itemsBySchoolClass).map(([schoolClassLabel, items]) => {
        const statusItems = items.filter((item) => item.status === status);

        if (statusItems.length === 0) return null;

        return (
          <div key={schoolClassLabel} className="app-group">
            <div className={cn('app-row app-row-label text-muted px-4 text-xl', labelClassName)}>
              {schoolClassLabel}
            </div>
            {statusItems.map((item, itemIndex) => {
              const student = item.student;
              if (!student) return null;

              const drawerId = `${item.id}-${item.status}`;
              const openSide = openDrawer?.drawerId === drawerId ? openDrawer.side : null;
              const isLastItemFromOrder = statusItems[itemIndex + 1]?.orderId !== item.orderId;
              const hasNextOrder = itemIndex < statusItems.length - 1;

              const closeDrawer = (side: SwipeSide) => {
                setOpenDrawer((currentDrawer) =>
                  currentDrawer?.drawerId === drawerId && currentDrawer.side === side
                    ? null
                    : currentDrawer,
                );
              };

              return (
                <Fragment key={item.id}>
                  <div className="app-row app-row-tall relative grid-cols-[1fr_1fr] gap-5 [&_svg]:size-10 [&_svg]:shrink-0">
                    <div className="inline-flex items-center justify-center gap-2.5 text-center">
                      <span>{item.product.label}</span>
                    </div>
                    <span className="text-center">{student.name}</span>

                    <SwipeActionRow
                      swipeDelta={8}
                      openSide={openSide}
                      onOpenSideChange={(nextSide) => {
                        setOpenDrawer(nextSide ? { drawerId, side: nextSide } : null);

                        if (!nextSide) return;

                        const action = actions[nextSide];
                        if (action?.confirmation) return;

                        action?.onOpen?.(item, () => closeDrawer(nextSide));
                      }}
                      left={actions.left}
                      right={actions.right}
                    />

                    {swipeSides.map((side) => {
                      const confirmation = actions[side]?.confirmation;

                      if (!confirmation) return null;

                      return (
                        <Dialog
                          key={side}
                          open={openSide === side}
                          onOpenChange={(nextOpen) => {
                            if (!nextOpen) setOpenDrawer(null);
                          }}
                        >
                          <DialogContent title={confirmation.title}>
                            <span>{confirmation.message}</span>
                            <DialogClose
                              render={<Button onClick={() => confirmation.onConfirm(item)} />}
                            >
                              <Check />
                              <span>{confirmation.confirmLabel ?? 'Sim'}</span>
                            </DialogClose>
                          </DialogContent>
                        </Dialog>
                      );
                    })}
                  </div>

                  {status === 'cooking' && isLastItemFromOrder && item.details?.trim() && (
                    <div className="app-row text-muted !min-h-0 grid-cols-[auto_minmax(0,1fr)] gap-2.5 py-2 text-base [&_svg]:!size-6">
                      <PenSquare aria-hidden="true" />
                      <span className="min-w-0 break-words whitespace-pre-wrap">
                        {item.details}
                      </span>
                    </div>
                  )}

                  {isLastItemFromOrder && hasNextOrder && (
                    <div
                      aria-hidden="true"
                      className="sunken bg-secondary/35 h-4 !border-0"
                      style={{
                        boxShadow:
                          'inset 0 4px 0 color-mix(in srgb, var(--pixel-dark) 52%, transparent), inset 0 -4px 0 color-mix(in srgb, var(--pixel-light) 72%, transparent)',
                      }}
                    />
                  )}
                </Fragment>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
