import { useState, type FC } from 'react';
import { useLocation, useNavigate } from 'react-router';
import ROUTES from '../../constants/routes';
import { Button } from '../../components/commons/Button';
import { Check, PenSquare, User, UserPlus } from 'pixelarticons/react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { PageNavigator } from '../../components/commons/PageNavigator';
import { SearchBar } from '../../components/commons/SearchBar';
import { cn } from '../../utils/functions';

type ResponsibleRegister = {
  responsibleId: string;
  responsibleName: string;
  total: number;
};

type Pagination = {
  page: number;
  totalPages: number;
  nextPage: number | null;
};

type ResponsiblesRegistersResponse = {
  responsiblesTotals: ResponsibleRegister[];
  pagination: Pagination;
};

type FormPosition = 'top' | 'bottom' | null;

const getResponsiblesRegisters = async (
  period: Period,
  page: number,
  search: string,
): Promise<ResponsiblesRegistersResponse> => {
  const formattedPeriod = `${period.year}${(period.month + 1).toString().padStart(2, '0')}`;

  const params = new URLSearchParams({
    p: formattedPeriod,
    page: String(page),
    limit: String(7),
    search,
  });

  const res = await workspaceApiFetch(`/registers/responsibles?${params}`);
  return res.json();
};

export const Registers: FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [period, setPeriod] = usePeriod();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
  const [formPosition, setFormPosition] = useState<FormPosition>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [drawerOpenIndex, setDrawerOpenIndex] = useState<number | null>(null);

  const isAdding = formPosition !== null;

  const { data: registersData, isFetching } = useQuery({
    queryKey: ['registers', 'responsibles', workspaceId, period, currentPage, search],
    queryFn: () => getResponsiblesRegisters(period, currentPage, search),
    enabled: Boolean(workspaceId),
    placeholderData: keepPreviousData,
    select: (data) => ({
      responsiblesTotals: data.responsiblesTotals,
      totalPages: data.pagination.totalPages,
    }),
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

  const responsiblesTotals = registersData?.responsiblesTotals ?? [];
  const totalPages = registersData?.totalPages ?? 1;

  return (
    <div className="app-page">
      <div className="app-panel">
        <div className="app-panel-header grid-cols-[2.5rem_minmax(0,1fr)_2.5rem_2.5rem] [&_svg]:size-10 [&_svg]:shrink-0">
          <span aria-hidden={true} className="col-start-1" />
          <span className="col-start-2 text-center">Responsáveis</span>
          <Button
            variant="ghost"
            className="border-border/45 bg-panel hover:bg-info-soft hover:text-info focus-visible:ring-accent/35 col-start-3 !size-12 place-items-center self-center justify-self-end rounded-none border-4 !p-0  outline-none focus-visible:ring-[3px] [&_svg]:size-7"
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

        {formPosition === 'top' && (
          <ResponsibleForm workspaceId={workspaceId} onClose={() => setFormPosition(null)} />
        )}

        <SearchBar
          query={search}
          setQuery={(query) => {
            setSearch(query);
            setCurrentPage(1);
          }}
          placeholder="Encontre um responsável"
        />

        {isFetching && <Loader />}

          <div className={cn("app-list", isFetching? 'max-h-0' : 'max-h-[100vh]')}>
            {responsiblesTotals.map((responsibleTotal, idx) => {
              const isEditing = editingIndex === idx;
              const isDrawerOpen = drawerOpenIndex === idx;

              if (isFetching) return null;

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
                    right={{
                      render: (
                        <>
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
                        </>
                      ),
                      handleWidth: 16,
                      openWidth: 136,
                    }}
                    openSide={isDrawerOpen ? 'right' : null}
                    onOpenSideChange={(side) => setDrawerOpenIndex(side === 'right' ? idx : null)}
                    onTap={() =>
                      navigate({
                        pathname: ROUTES.REGISTERS.DETAIL_PATH(responsibleTotal.responsibleId),
                        search: location.search,
                      })
                    }
                    captureInteractions={!isEditing}
                  />
                </div>
              );
            })}
          </div>

        <PageNavigator
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};
