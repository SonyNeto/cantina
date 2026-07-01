import { useState, type FC } from 'react';
import { Link } from 'react-router';
import { v4 as uuid } from 'uuid';
import ROUTES from '../../constants/routes';
import { Button } from '../../components/commons/Button';
import { Check, User, UserPlus } from 'pixelarticons/react';
import { X } from '../../assets/icons/MenuIcons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader } from '../../components/commons/Loader';
import { apiUrl } from '../../utils/api';
import type { Responsible } from '../../constants/school/types';

type ResponsibleRegister = {
  responsibleId: string;
  responsibleName: string;
  total: number;
};

type ResponsiblesRegistersResponse = {
  responsiblesTotals: ResponsibleRegister[];
};

type ResponsibleResponse = {
  responsible: Responsible;
};

const getResponsiblesRegisters = async (): Promise<ResponsiblesRegistersResponse> => {
  const res = await fetch(apiUrl('/registers/responsibles'));
  return res.json();
};

export const Registers: FC = () => {
  const queryClient = useQueryClient();

  const { data: responsiblesRegistersResponse, isPending } = useQuery({
    queryKey: ['registers', 'responsibles'],
    queryFn: getResponsiblesRegisters,
  });

  const createResponsible = useMutation({
    mutationFn: async (name: string): Promise<ResponsibleResponse> => {
      const res = await fetch(apiUrl('/responsibles'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: uuid(),
          name,
        }),
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registers', 'responsibles'] });
    },
  });

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const responsiblesTotals = responsiblesRegistersResponse?.responsiblesTotals ?? [];

  return isPending ? (
    <Loader />
  ) : (
    <div className="border-text m-6 flex h-fit flex-col overflow-hidden border-4">
      <div className="bg-tertiary grid w-full place-items-center gap-2.5 px-6 py-4 text-xl">
        <span className="text-center">Responsáveis</span>
      </div>

      <div className="grid">
        {responsiblesTotals.map((responsibleTotal) => (
          <Link
            key={responsibleTotal.responsibleId}
            to={ROUTES.REGISTERS.DETAIL_PATH(responsibleTotal.responsibleId)}
            className="border-text/40 text-text z-30 grid w-full grid-cols-[minmax(0,1fr)_7ch] items-center gap-2.5 border-t-4 px-4 py-3 text-xl"
          >
            <div className="inline-flex min-w-0 items-center gap-2.5 [&_svg]:size-10 [&_svg]:shrink-0">
              <User />
              <span>{responsibleTotal.responsibleName}</span>
            </div>
            <span className="text-right tabular-nums">{`R$${responsibleTotal.total.toFixed(2)}`}</span>
          </Link>
        ))}

        {isAdding ? (
          <form
            className="bg-hover/30 border-text/40 z-50 flex w-full items-center justify-between gap-2.5 rounded-none border-t-4 p-4 text-xl font-medium"
            onSubmit={(e) => {
              e.preventDefault();

              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;

              createResponsible.mutate(name);
              setIsAdding(false);
            }}
          >
            <div className="inline-flex items-center gap-2.5">
              <input
                name="name"
                id={`add-responsible-name`}
                type="text"
                placeholder="Nome do responsável"
                className="border-text/40 w-[20ch] border-4 px-2"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Button type="submit" variant="primary" size="sm">
                <Check />
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsAdding(false)}>
                <X />
              </Button>
            </div>
          </form>
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
