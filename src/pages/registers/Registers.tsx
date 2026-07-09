import { useState, type FC } from 'react';
import { Link, useLocation } from 'react-router';
import ROUTES from '../../constants/routes';
import { Button } from '../../components/commons/Button';
import { User, UserPlus } from 'pixelarticons/react';
import { useQuery } from '@tanstack/react-query';
import { Loader } from '../../components/commons/Loader';
import { workspaceApiFetch } from '../../utils/api';
import PeriodPicker from '../../components/commons/PeriodPicker';
import { usePeriod, type Period } from '../../hooks/usePeriod';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { AddResponsibleForm } from './components/AddResponsibleForm';

type ResponsibleRegister = {
  responsibleId: string;
  responsibleName: string;
  total: number;
};

type ResponsiblesRegistersResponse = {
  responsiblesTotals: ResponsibleRegister[];
};

type FormPosition = 'top' | 'bottom' | null;

const getResponsiblesRegisters = async (period: Period): Promise<ResponsiblesRegistersResponse> => {
  const res = await workspaceApiFetch(
    `/registers/responsibles?p=${period.year}${(period.month + 1).toString().padStart(2, '0')}`,
  );
  return res.json();
};

export const Registers: FC = () => {
  const [period, setPeriod] = usePeriod();
  const location = useLocation();
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
  const [formPosition, setFormPosition] = useState<FormPosition>(null);

  const isAdding = formPosition !== null;

  const { data: responsiblesTotals = [], isPending } = useQuery({
    queryKey: ['registers', 'responsibles', workspaceId, period],
    queryFn: () => getResponsiblesRegisters(period),
    enabled: Boolean(workspaceId),
    select: (data) => data.responsiblesTotals,
  });

  return isPending ? (
    <Loader />
  ) : (
    <div className="app-page">
      <div className="app-panel">
        <div className="app-panel-header grid-cols-[2.5rem_minmax(0,1fr)_2.5rem_2.5rem] [&_svg]:size-10 [&_svg]:shrink-0">
          <span aria-hidden={true} className="col-start-1" />
          <span className="col-start-2 text-center">Responsáveis</span>
          <Button
            variant="ghost"
            className="border-border/45 bg-panel hover:bg-info-soft hover:text-info focus-visible:ring-accent/35 col-start-3 !size-12 place-items-center self-center justify-self-end rounded-none border-4 !p-0 transition-colors outline-none focus-visible:ring-[3px] [&_svg]:size-7"
            disabled={isAdding}
            onClick={() => setFormPosition('top')}
            aria-label="Adicionar responsável"
            title="Adicionar responsável"
          >
            <UserPlus />
          </Button>
          <PeriodPicker value={period} onChange={setPeriod} className="col-start-4" />
        </div>

        <div className="app-list">
          {formPosition === 'top' && (
            <AddResponsibleForm workspaceId={workspaceId} onClose={() => setFormPosition(null)} />
          )}
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

          {formPosition === 'bottom' ? (
            <AddResponsibleForm workspaceId={workspaceId} onClose={() => setFormPosition(null)} />
          ) : (
            <Button
              className="app-row app-row-action !h-auto !w-full justify-center gap-2.5 rounded-none py-4"
              variant="ghost"
              size="lg"
              disabled={isAdding}
              onClick={() => setFormPosition('bottom')}
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
