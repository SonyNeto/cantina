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
  onItemTap?: (item: OrderTableItem) => void;
};

const swipeSides: SwipeSide[] = ['left', 'right'];

export const OrdersTable: FC<OrdersTableProps> = ({
  itemsBySchoolClass,
  status,
  actions,
  labelClassName,
  onItemTap,
}) => {
  const [openDrawer, setOpenDrawer] = useState<{
    drawerId: string;
    side: SwipeSide;
  } | null>(null);

  return (
    <div className="app-list scroll-pb-20 pb-20">
      {Object.entries(itemsBySchoolClass).map(([schoolClassId, items]) => {
        const statusItems = items.filter((item) => item.status === status);

        if (statusItems.length === 0) return null;

        const orderGroups = statusItems.reduce<
          Array<{
            orderId: string;
            student: OrderTableItem['student'];
            details?: string;
            items: OrderTableItem[];
          }>
        >((groups, item) => {
          const currentGroup = groups.at(-1);

          if (currentGroup?.orderId === item.orderId) {
            currentGroup.items.push(item);
            return groups;
          }

          groups.push({
            orderId: item.orderId,
            student: item.student,
            details: item.details,
            items: [item],
          });

          return groups;
        }, []);

        return (
          <div key={schoolClassId} className="app-group">
            <div className={cn('app-row app-row-label text-muted px-4 text-xl', labelClassName)}>
              {statusItems[0].schoolClass?.label ?? 'Turma não encontrada'}
            </div>
            {orderGroups.map((orderGroup, orderIndex) => (
              <Fragment key={orderGroup.orderId}>
                <div className="app-row bg-panel-header raised sticky top-8 z-[45] !min-h-10 !border-0 px-4 py-1 font-bold">
                  <span className="min-w-0 truncate">
                    {orderGroup.student?.name ?? 'Aluno não encontrado'}
                  </span>
                </div>

                {orderGroup.items.map((item) => {
                  const drawerId = `${item.id}-${item.status}`;
                  const openSide = openDrawer?.drawerId === drawerId ? openDrawer.side : null;

                  const closeDrawer = (side: SwipeSide) => {
                    setOpenDrawer((currentDrawer) =>
                      currentDrawer?.drawerId === drawerId && currentDrawer.side === side
                        ? null
                        : currentDrawer,
                    );
                  };

                  return (
                    <div
                      key={item.id}
                      className="app-row app-row-tall relative grid-cols-[minmax(0,1fr)] text-center [&_svg]:size-10 [&_svg]:shrink-0"
                    >
                      <span className="min-w-0 truncate">{item.product.label}</span>

                      <SwipeActionRow
                        swipeDelta={8}
                        openSide={openSide}
                        onTap={onItemTap ? () => onItemTap(item) : undefined}
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
                  );
                })}

                {status === 'cooking' && orderGroup.details?.trim() && (
                  <div className="app-row text-muted !min-h-0 grid-cols-[auto_minmax(0,1fr)] gap-2.5 py-2 text-base [&_svg]:!size-6">
                    <PenSquare aria-hidden="true" />
                    <span className="min-w-0 break-words whitespace-pre-wrap">
                      {orderGroup.details}
                    </span>
                  </div>
                )}

                {orderIndex < orderGroups.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="sunken bg-secondary/35 h-4 !border-0"
                    style={{
                      boxShadow:
                        'inset 0 4px 0 color-mix(in srgb, var(--pixel-dark) 52%, transparent)',
                    }}
                  />
                )}
              </Fragment>
            ))}
          </div>
        );
      })}
    </div>
  );
};
