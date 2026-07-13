import { useState, type FC } from 'react';
import { useLocation, useNavigate } from 'react-router';
import ROUTES from '../../constants/routes';
import { Button } from '../../components/commons/Button';
import { Check, PenSquare, User, UserPlus } from 'pixelarticons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader } from '../../components/commons/Loader';
import { workspaceApiFetch } from '../../utils/api';
import PeriodPicker from '../../components/commons/PeriodPicker';
import { usePeriod, type Period } from '../../hooks/usePeriod';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { ResponsibleForm } from './components/ResponsibleForm';
import { SwipeActionRow } from '../../components/commons/SwipeActionRow';
import { TrashCan } from '../../assets/icons/MenuIcons';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '../../components/commons/Dialog';
import { toast } from 'sonner';

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
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [period, setPeriod] = usePeriod();
  const location = useLocation();
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
  const [formPosition, setFormPosition] = useState<FormPosition>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [drawerOpenIndex, setDrawerOpenIndex] = useState<number | null>(null);

  const isAdding = formPosition !== null;

  const { data: responsiblesTotals = [], isPending } = useQuery({
    queryKey: ['registers', 'responsibles', workspaceId, period],
    queryFn: () => getResponsiblesRegisters(period),
    enabled: Boolean(workspaceId),
    select: (data) => data.responsiblesTotals,
  });

  const deleteResponsible = useMutation({
    mutationFn: async (responsibleId: string): Promise<void> => {
      await workspaceApiFetch(`/responsibles/${responsibleId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registers', 'responsibles', workspaceId] });
      toast.success('Responsável removido com sucesso!');
    },
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
            onClick={() => {
              setFormPosition('top');
              setEditingIndex(null);
              setDrawerOpenIndex(null);
            }}
            aria-label="Adicionar responsável"
            title="Adicionar responsável"
          >
            <UserPlus />
          </Button>
          <PeriodPicker value={period} onChange={setPeriod} className="col-start-4" />
        </div>

        <div className="app-list">
          {formPosition === 'top' && (
            <ResponsibleForm workspaceId={workspaceId} onClose={() => setFormPosition(null)} />
          )}
          {responsiblesTotals
            .sort((responsible1, responsible2) =>
              responsible1.responsibleName.localeCompare(responsible2.responsibleName),
            )
            .map((responsibleTotal, idx) => {
              const isEditing = editingIndex === idx;
              const isDrawerOpen = drawerOpenIndex === idx;

              return (
                <div
                  key={responsibleTotal.responsibleId}
                  className="app-row relative isolate overflow-hidden !p-0"
                >
                  {isEditing ? (
                    <ResponsibleForm
                      className="relative z-10 !border-0"
                      workspaceId={workspaceId}
                      responsibleId={responsibleTotal.responsibleId}
                      method="update"
                      defaultName={responsibleTotal.responsibleName}
                      onClose={() => {
                        setEditingIndex(null);
                        setDrawerOpenIndex(idx);
                      }}
                    />
                  ) : (
                    <div className="app-row-action relative z-10 grid w-full grid-cols-[minmax(0,1fr)_7ch] items-center gap-2.5 px-4 py-3">
                      <div className="inline-flex min-w-0 items-center gap-2.5 [&_svg]:size-10 [&_svg]:shrink-0">
                        <User />
                        <span>{responsibleTotal.responsibleName}</span>
                      </div>
                      <span className="text-center tabular-nums">{`R$${responsibleTotal.total.toFixed(2)}`}</span>
                    </div>
                  )}

                  <SwipeActionRow
                    handleWidth={16}
                    openWidth={136}
                    open={isDrawerOpen}
                    onOpenChange={() => setDrawerOpenIndex(isDrawerOpen ? null : idx)}
                    onTap={() =>
                      navigate({
                        pathname: ROUTES.REGISTERS.DETAIL_PATH(responsibleTotal.responsibleId),
                        search: location.search,
                      })
                    }
                    captureInteractions={!isEditing}
                  >
                    <Button
                      onClick={() => {
                        setEditingIndex(isEditing ? null : idx);
                        setDrawerOpenIndex(isDrawerOpen ? null : idx);
                        setFormPosition(null);
                      }}
                      disabled={isEditing}
                    >
                      <PenSquare />
                    </Button>

                    <Dialog>
                      <DialogTrigger
                        render={<Button size="md" variant="primary" disabled={isEditing} />}
                      >
                        <TrashCan />
                      </DialogTrigger>
                      <DialogContent title="Atenção">
                        <span>Tem certeza que deseja excluir o responsável?</span>
                        <DialogClose
                          render={
                            <Button
                              onClick={() => {
                                deleteResponsible.mutate(responsibleTotal.responsibleId);
                                setEditingIndex(null);
                                setFormPosition(null);
                                setDrawerOpenIndex(null);
                              }}
                            />
                          }
                        >
                          <Check />
                          <span>Sim</span>
                        </DialogClose>
                      </DialogContent>
                    </Dialog>
                  </SwipeActionRow>
                </div>
              );
            })}

          {formPosition === 'bottom' ? (
            <ResponsibleForm workspaceId={workspaceId} onClose={() => setFormPosition(null)} />
          ) : (
            <Button
              className="app-row app-row-action !h-auto !w-full justify-center gap-2.5 rounded-none py-4"
              variant="ghost"
              size="lg"
              disabled={isAdding}
              onClick={() => {
                setFormPosition('bottom');
                setEditingIndex(null);
                setDrawerOpenIndex(null);
              }}
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
