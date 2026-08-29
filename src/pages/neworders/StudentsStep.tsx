import type { FC } from 'react';
import { Button } from '../../components/commons/Button';
import { useFormContext } from 'react-hook-form';
import { ArrowLeft } from 'pixelarticons/react';
import { useQuery } from '@tanstack/react-query';
import type { ShiftId, Student } from '../../constants/school/types';
import { Loader } from '../../components/commons/Loader';
import { workspaceApiFetch } from '../../utils/api';
import type { OrderForm, OrderItem, OrderStatus } from '../../constants/canteen/types';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { Cooking } from '../../assets/icons/MenuIcons';

interface Props {
  shiftId: ShiftId | '';
  schoolClassId: string;
  onNext: () => void;
  onBack: () => void;
}

type StudentsResponse = {
  students: Student[];
};

type ActiveOrder = {
  id: string;
  student: {
    id: string;
    name: string;
  } | null;
  items: OrderItem[];
};

type ActiveOrdersResponse = {
  orders: Record<string, ActiveOrder[]>;
  totalItems: number;
};

const ACTIVE_ORDER_STATUS: OrderStatus = 'cooking';

const getStudents = async (
  shiftId: ShiftId | '',
  schoolClassId: string,
): Promise<StudentsResponse> => {
  const res = await workspaceApiFetch(`/shifts/${shiftId}/schoolClasses/${schoolClassId}/students`);
  return res.json();
};

const getActiveOrders = async (): Promise<ActiveOrdersResponse> => {
  const res = await workspaceApiFetch(`/orders/status/${ACTIVE_ORDER_STATUS}`);
  return res.json();
};

export const StudentsStep: FC<Props> = ({ onNext, onBack, shiftId, schoolClassId }) => {
  const { setValue, unregister } = useFormContext<OrderForm>();
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);

  const { data: students = [], isPending } = useQuery({
    queryKey: ['students', workspaceId, schoolClassId],
    queryFn: () => getStudents(shiftId, schoolClassId),
    enabled: Boolean(workspaceId && shiftId && schoolClassId),
    select: (data) => data.students,
  });

  const { data: ordersData } = useQuery({
    queryKey: ['orders', workspaceId, 'status', ACTIVE_ORDER_STATUS],
    queryFn: getActiveOrders,
    enabled: Boolean(workspaceId),
    select: (data) => data.orders,
  });

  function handleSelectStudent(studentId: OrderForm['studentId']) {
    setValue('studentId', studentId, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue('items', []);
    setValue('payment', 0);
    setValue('keepChange', false);
    unregister('details');

    onNext();
  }

  const activeSchoolClassOrders = ordersData?.[schoolClassId] ?? [];

  return isPending ? (
    <Loader />
  ) : (
    <div className="app-content">
      <div className="app-header grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] [&_svg]:size-10 [&_svg]:shrink-0">
        <Button variant={'ghost'} className="justify-self-start" disableHover onClick={onBack}>
          <ArrowLeft />
        </Button>
        <span className="justify-self-center text-center">Escolha um aluno</span>
        <span aria-hidden="true" />
      </div>
      <div className="app-list">
        {students.map((student) => (
          <Button
            key={student.id}
            type="button"
            variant="ghost"
            size="lg"
            className="app-row app-row-action h-auto grid-cols-[minmax(0,1fr)] justify-items-start rounded-none text-left whitespace-normal"
            onClick={() => handleSelectStudent(student.id)}
          >
            <span>{student.name}</span>
          </Button>
        ))}
      </div>

      {activeSchoolClassOrders.length > 0 && (
        <footer className="app-footer max-h-[36vh] z-40 overflow-auto" aria-label="Pedidos ativos da turma">
          <h2 className="bg-panel-header raised flex sticky top-0 min-h-14 w-full items-center justify-center gap-3 px-4 text-xl font-bold [&_svg]:size-10 [&_svg]:shrink-0">
            <span>Pedidos ativos</span>
            <Cooking aria-hidden="true" />
          </h2>

          <div className="app-total-bar min-w-0 !p-0">
            <ul className="border-border/35 grid max-w-full min-w-0 overflow-hidden [&>li+li]:border-t-4">
              {activeSchoolClassOrders.map((order) => {
                const itemsSummary = order.items.reduce<
                  Record<string, OrderItem & { quantity: number }>
                >((summary, item) => {
                  const productId = item.product.id;

                  summary[productId] ??= { ...item, quantity: 0 };
                  summary[productId].quantity++;

                  return summary;
                }, {});

                return (
                  <li
                    key={order.id}
                    className="border-border/35 flex max-w-full min-w-0 items-start justify-between gap-4 px-4 py-3"
                  >
                    <span
                      className="min-w-0 flex-1 break-words whitespace-normal"
                      title={order.student?.name ?? 'Aluno não encontrado'}
                    >
                      {order.student?.name ?? 'Aluno não encontrado'}
                    </span>
                    <ul className="min-w-0 flex-1 text-right">
                      {Object.values(itemsSummary).map((item) => (
                        <li key={item.product.id} className="min-w-0 break-words whitespace-normal">
                          <span className="tabular-nums">{item.quantity}x </span>
                          {item.product.label}
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </div>
        </footer>
      )}
    </div>
  );
};
