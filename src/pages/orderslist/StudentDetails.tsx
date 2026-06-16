import type { FC } from 'react';
import { ORDERS } from '../../constants/orderstemp';
import { Link, useParams } from 'react-router';
import ROUTES from '../../constants/routes';
import { ArrowLeft } from 'pixelarticons/react';
import { getStudentTotal } from '../../utils/selectors';

export const StudentDetails: FC = () => {
  const { responsibleId, studentId } = useParams();
  const total = getStudentTotal(studentId);

  return (
    <div className="border-text m-6 flex h-fit flex-col border-4">
      <div className="bg-tertiary relative flex w-full items-center justify-center gap-2.5 px-6 py-4 text-xl [&_svg]:size-10">
        <Link
          key="back-responsible-details"
          to={ROUTES.ORDERSLIST.DETAIL_PATH(responsibleId)}
          className="absolute left-4 z-50"
        >
          <ArrowLeft />
        </Link>
        Pedidos
      </div>

      {ORDERS.ORDERS.map((order) => {
        if (studentId !== order.studentId) return;

        return (
          <div
            className="border-text/30 text-text inline-flex w-full items-center justify-between gap-2.5 border-t-4 p-4 text-xl [&_svg]:size-10"
            key={order.id}
          >
            <div className="inline-flex items-center gap-2.5">
              <order.product.icon />
              <span>{order.product.label}</span>
            </div>
            <div className="flex gap-5 whitespace-nowrap">
              <span>{order.created_at}</span>
              <span>{`R$ ${order.product.price.toFixed(2)}`}</span>
            </div>
          </div>
        );
      })}

      <div className="border-text/30 text-text relative flex w-full items-center justify-end gap-2.5 border-t-4 p-4 text-xl [&_svg]:size-10">
        <div className="flex gap-5">
          <span>Total: </span>
          <span>{`R$ ${total.toFixed(2)}`}</span>
        </div>
      </div>
    </div>
  );
};
