import type { FC } from 'react';
import { RESPONSIBLES } from '../../constants/school/responsiblestemp';
import { Link } from 'react-router';
import ROUTES from '../../constants/routes';
import { getResponsibleTotal } from '../../utils/selectors';

export const OrdersList: FC = () => {
  return (
    <div className="border-text m-6 flex h-fit flex-col overflow-hidden border-4">
      <div className="bg-tertiary flex w-full justify-center gap-2.5 px-6 py-4 text-xl">
        Responsáveis
      </div>

      <div className="grid">
        {RESPONSIBLES.RESPONSIBLES.map((responsible) => {
          const totalPerResponsible = getResponsibleTotal(responsible.id);

          return (
            <Link
              key={responsible.id}
              to={ROUTES.ORDERSLIST.DETAIL_PATH(responsible.id)}
              className="border-text/30 text-text relative z-50 grid w-full grid-cols-[minmax(0,1fr)_8ch] items-center gap-2.5 border-t-4 p-4 text-xl [&_svg]:size-10 [&_svg]:shrink-0"
            >
              <span>{responsible.name}</span>
              <span className="text-right tabular-nums">{`R$ ${totalPerResponsible.toFixed(2)}`}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
