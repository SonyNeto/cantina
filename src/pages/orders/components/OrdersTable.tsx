import { useState, type CSSProperties, type FC, type ReactElement } from 'react';
import { Check } from 'pixelarticons/react';
import { Button } from '../../../components/commons/Button';
import { Dialog, DialogClose, DialogContent } from '../../../components/commons/Dialog';
import { SwipeActionRow, type SwipeSide } from '../../../components/commons/SwipeActionRow';
import type { OrderStatus, Product } from '../../../constants/canteen/types';
import { cn } from '../../../utils/functions';

type OrderTableItem = {
  orderId: string;
  created_at: string;
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

type OrdersTableAction = {
  render: ReactElement;
  handleWidth?: number;
  openWidth?: number;
  openThreshold?: number;
  className?: string;
  handleClassName?: string;
  progressStyle?: (progress: number) => CSSProperties;
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
    <div className="app-list">
      {Object.entries(itemsBySchoolClass).map(([schoolClassLabel, items]) => {
        const statusItems = items.filter((item) => item.status === status);

        if (statusItems.length === 0) return null;

        return (
          <div key={schoolClassLabel} className="app-group">
            <div className={cn('app-row app-row-label text-muted px-4 text-xl', labelClassName)}>
              {schoolClassLabel}
            </div>
            {statusItems.map((item) => {
              const student = item.student;
              if (!student) return null;

              const drawerId = `${item.id}-${item.status}`;
              const openSide = openDrawer?.drawerId === drawerId ? openDrawer.side : null;

              const closeDrawer = (side: SwipeSide) => {
                setOpenDrawer((currentDrawer) =>
                  currentDrawer?.drawerId === drawerId && currentDrawer.side === side
                    ? null
                    : currentDrawer,
                );
              };

              const getSwipeAction = (side: SwipeSide) => {
                const action = actions[side];

                if (!action) return undefined;

                return {
                  render: action.render,
                  handleWidth: action.handleWidth,
                  openWidth: action.openWidth,
                  openThreshold: action.openThreshold,
                  className: action.className,
                  handleClassName: action.handleClassName,
                  progressStyle: action.progressStyle,
                };
              };

              return (
                <div
                  className="app-row app-row-tall relative grid-cols-[1fr_1fr] gap-5 [&_svg]:size-10 [&_svg]:shrink-0"
                  key={item.id}
                >
                  <div className="inline-flex items-center justify-center gap-2.5 text-center">
                    <span>{item.product.label}</span>
                  </div>
                  <span className="text-center">{student.name}</span>

                  <SwipeActionRow
                    delta={8}
                    openSide={openSide}
                    onOpenSideChange={(nextSide) => {
                      setOpenDrawer(nextSide ? { drawerId, side: nextSide } : null);

                      if (!nextSide) return;

                      const action = actions[nextSide];
                      if (action?.confirmation) return;

                      action?.onOpen?.(item, () => closeDrawer(nextSide));
                    }}
                    left={getSwipeAction('left')}
                    right={getSwipeAction('right')}
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
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
