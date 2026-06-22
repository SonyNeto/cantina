import type { FC } from 'react';
import { ORDERS } from '../../constants/canteen/orderstemp';
import { getClassByClassId, getStudentById } from '../../utils/selectors';
import { Check } from 'pixelarticons/react';
import { Button } from '../../components/commons/Button';
import { Cooking, X } from '../../assets/icons/MenuIcons';

export const Orders: FC = () => {
  return (
    <div className="border-text m-6 flex h-fit flex-col overflow-hidden border-4">
      <div className="bg-tertiary flex w-full flex-col items-center justify-center px-4 py-4 text-xl [&_svg]:size-10 [&_svg]:shrink-0">
        <span className="text-center">Em preparação</span>
        <Cooking />
      </div>

      <div className="grid">
        {ORDERS.ORDERS.map((order) => {
          if (order.status === 'ready') return;
          const student = getStudentById(order.studentId);
          if (!student) return;

          const studentName = student.name;
          const studentClassName = getClassByClassId(student.classId)?.label;

          return (
            <div
              className="border-text/40 text-text grid w-full grid-cols-[minmax(0,1fr)_5ch_7ch] items-center gap-5 border-t-4 px-4 py-3 text-xl [&_svg]:size-10 [&_svg]:shrink-0"
              key={order.id}
            >
              <div className="inline-flex items-center gap-2.5">
                <order.product.icon />
                <span>{order.product.label}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-center">{studentName}</span>
                <span className="text-center">{studentClassName}</span>
              </div>
              <Button className="justify-self-end">
                <Check />
              </Button>
            </div>
          );
        })}
      </div>

      <div className="bg-tertiary flex w-full flex-col items-center justify-center border-t-4 px-4 py-4 text-xl [&_svg]:size-10 [&_svg]:shrink-0">
        <span className="text-center">Pronto</span>
        <Check />
      </div>

      <div className="grid">
        {ORDERS.ORDERS.map((order) => {
          if (order.status === 'cooking') return;
          const student = getStudentById(order.studentId);
          if (!student) return;

          const studentName = student.name;
          const studentClassName = getClassByClassId(student.classId)?.label;

          return (
            <div
              className="border-text/40 text-text grid w-full grid-cols-[minmax(0,1fr)_5ch_7ch] items-center gap-5 border-t-4 px-4 py-3 text-xl [&_svg]:size-10 [&_svg]:shrink-0"
              key={order.id}
            >
              <div className="inline-flex items-center gap-2.5">
                <order.product.icon />
                <span>{order.product.label}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-center">{studentName}</span>
                <span className="text-center">{studentClassName}</span>
              </div>
              <Button className="justify-self-end">
                <X />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
