import { useState, type FC } from 'react';
import { Link, useLocation } from 'react-router';
import ROUTES from '../../constants/routes';
import { Button } from '../../components/commons/Button';
import { Check, User, UserPlus } from 'pixelarticons/react';
import { X } from '../../assets/icons/MenuIcons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader } from '../../components/commons/Loader';
import { workspaceApiFetch } from '../../utils/api';
import type { Responsible } from '../../constants/school/types';
import PeriodPicker from '../../components/commons/PeriodPicker';
import { usePeriod, type Period } from '../../hooks/usePeriod';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { toast } from 'sonner';
import { z } from 'zod';

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

const getResponsiblesRegisters = async (period: Period): Promise<ResponsiblesRegistersResponse> => {
  const res = await workspaceApiFetch(
    `/registers/responsibles?p=${period.year}${(period.month + 1).toString().padStart(2, '0')}`,
  );
  return res.json();
};

const createResponsibleSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do responsável'),
});

export const Registers: FC = () => {
  const queryClient = useQueryClient();
  const [period, setPeriod] = usePeriod();
  const location = useLocation();
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);

  const { data: responsiblesTotals = [], isPending } = useQuery({
    queryKey: ['registers', 'responsibles', workspaceId, period],
    queryFn: () => getResponsiblesRegisters(period),
    enabled: Boolean(workspaceId),
    select: (data) => data.responsiblesTotals,
  });

  const createResponsible = useMutation({
    mutationFn: async (name: string): Promise<ResponsibleResponse> => {
      const res = await workspaceApiFetch('/responsibles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
        }),
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registers', 'responsibles', workspaceId] });
    },
  });

  const [isAdding, setIsAdding] = useState<boolean>(false);
  return isPending ? (
    <Loader />
  ) : (
    <div className="app-page">
      <div className="app-panel">
        <div className="app-panel-header grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] [&_svg]:size-10 [&_svg]:shrink-0">
          <span aria-hidden={true} className="col-start-1" />
          <span className="col-start-2 text-center">Responsáveis</span>
          <PeriodPicker value={period} onChange={setPeriod} className="col-start-3" />
        </div>

        <div className="app-list">
          {responsiblesTotals
            .sort((responsible1, responsible2) =>
              responsible1.responsibleName.localeCompare(responsible2.responsibleName),
            )
            .map((responsibleTotal) => (
              <Link
                key={responsibleTotal.responsibleId}
                to={{
                  pathname: ROUTES.REGISTERS.DETAIL_PATH(responsibleTotal.responsibleId),
                  search: location.search,
                }}
                className="app-row app-row-action z-30 grid-cols-[minmax(0,1fr)_7ch]"
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
              className="app-form-row z-50 flex min-w-0 justify-between rounded-none"
              onSubmit={(e) => {
                e.preventDefault();

                const formData = new FormData(e.currentTarget);
                const result = createResponsibleSchema.safeParse({
                  name: String(formData.get('name') ?? ''),
                });

                if (!result.success) {
                  toast.error(result.error.issues[0].message);
                  return;
                }

                createResponsible.mutate(result.data.name);
                setIsAdding(false);
              }}
            >
              <div className="inline-flex min-w-0 items-center gap-2.5">
                <input
                  name="name"
                  id={`add-responsible-name`}
                  type="text"
                  placeholder="Nome do responsável"
                  className="app-input w-full max-w-[20ch] truncate"
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
              className="app-row app-row-action !h-auto !w-full justify-center gap-2.5 rounded-none py-4"
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
    </div>
  );
};
