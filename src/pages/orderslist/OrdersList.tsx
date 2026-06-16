import type { FC } from 'react';
import { RESPONSIBLES } from '../../constants/responsiblestemp';
import { Link } from 'react-router';
import ROUTES from '../../constants/routes';
import { getResponsibleTotal } from '../../utils/selectors';

export const OrdersList: FC = () => {
  return (
    <div className="border-text m-6 flex h-fit flex-col border-4">
      <div className="bg-tertiary flex w-full justify-center gap-2.5 px-6 py-4 text-xl">
        Responsáveis
      </div>

      {RESPONSIBLES.RESPONSIBLES.map((responsible) => {
        const totalPerResponsible = getResponsibleTotal(responsible.id);

        return (
          <Link
            key={responsible.id}
            to={ROUTES.ORDERSLIST.DETAIL_PATH(responsible.id)}
            className="border-text/30 text-text relative z-50 flex w-full items-center justify-between gap-2.5 border-t-4 p-4 text-xl [&_svg]:size-10"
          >
            <span>{responsible.name}</span>
            <span className="whitespace-nowrap">{`R$ ${totalPerResponsible.toFixed(2)}`}</span>
          </Link>
        );
      })}
    </div>
  );
};
