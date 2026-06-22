import { useState, type FC } from 'react';
import { RESPONSIBLES } from '../../constants/school/responsiblestemp';
import { Link } from 'react-router';
import ROUTES from '../../constants/routes';
import { getResponsibleTotal } from '../../utils/selectors';
import { Button } from '../../components/commons/Button';
import { Check, User, UserPlus } from 'pixelarticons/react';
import { X } from '../../assets/icons/MenuIcons';

export const Registers: FC = () => {
  const [isAdding, setIsAdding] = useState<boolean>(false);

  return (
    <div className="border-text m-6 flex h-fit flex-col overflow-hidden border-4">
      <div className="bg-tertiary grid w-full place-items-center gap-2.5 px-6 py-4 text-xl">
        <span className="text-center">Responsáveis</span>
      </div>

      <div className="grid">
        {RESPONSIBLES.RESPONSIBLES.map((responsible) => {
          const totalPerResponsible = getResponsibleTotal(responsible.id);

          return (
            <Link
              key={responsible.id}
              to={ROUTES.REGISTERS.DETAIL_PATH(responsible.id)}
              className="border-text/40 text-text z-30 grid w-full grid-cols-[minmax(0,1fr)_7ch] items-center gap-2.5 border-t-4 px-4 py-3 text-xl"
            >
              <div className="inline-flex min-w-0 items-center gap-2.5 [&_svg]:size-10 [&_svg]:shrink-0">
                <User />
                <span>{responsible.name}</span>
              </div>
              <span className="text-right tabular-nums">{`R$${totalPerResponsible.toFixed(2)}`}</span>
            </Link>
          );
        })}

        {isAdding ? (
          <div className="bg-hover/30 border-text/40 z-50 flex w-full items-center justify-between gap-2.5 rounded-none border-t-4 p-4 text-xl font-medium [&_svg]:size-10 [&_svg]:shrink-0">
            <div className="inline-flex items-center gap-2.5">
              <input
                id={`add-responsible-name`}
                type="text"
                placeholder="Nome do responsável"
                className="border-text/40 w-[20ch] border-4 px-2"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Button variant="primary" size="sm" onClick={() => setIsAdding(false)}>
                <Check />
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsAdding(false)}>
                <X />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            className="border-text/40 !h-full !w-full justify-center gap-2.5 rounded-none border-t-4 px-4 py-3 text-xl"
            variant="ghost"
            size="lg"
            disabled={isAdding}
            onClick={() => setIsAdding(true)}
          >
            <UserPlus />
            Adicionar responsável
          </Button>
        )}
      </div>
    </div>
  );
};
