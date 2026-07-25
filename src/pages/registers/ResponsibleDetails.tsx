import { useState, type FC } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import ROUTES from '../../constants/routes';
import { ArrowLeft, Check, PenSquare, User, UserPlus } from 'pixelarticons/react';
import { Button } from '../../components/commons/Button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader } from '../../components/commons/Loader';
import { workspaceApiFetch } from '../../utils/api';
import { usePeriod, type Period } from '../../hooks/usePeriod';
import PeriodPicker from '../../components/commons/PeriodPicker';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { StudentForm } from './components/StudentForm';
import { TrashCan } from '../../assets/icons/MenuIcons';
import { SwipeActionRow } from '../../components/commons/SwipeActionRow';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '../../components/commons/Dialog';
import { toast } from 'sonner';
import { PageNavigator } from '../../components/commons/PageNavigator';
import { fromCents } from '../../utils/functions';

type StudentTotal = {
  id: string;
  name: string;
  schoolClassId: string;
  schoolClassLabel: string;
  schoolClassShiftLabel: string;
  total: number;
};

type ResponsibleTotals = {
  responsibleId: string;
  responsibleName: string;
  total: number;
  studentsTotals: StudentTotal[];
};

type Pagination = {
  page: number;
  totalPages: number;
  nextPage: number | null;
};

type ResponsibleRegistersResponse = {
  responsibleTotals: ResponsibleTotals;
  pagination: Pagination;
};

const getResponsibleRegisters = async (
  responsibleId: string,
  period: Period,
  page: number,
): Promise<ResponsibleRegistersResponse> => {
  const res = await workspaceApiFetch(
    `/responsibles/${responsibleId}/registers?p=${period.year}${(period.month + 1).toString().padStart(2, '0')}&page=${page}&limit=${6}`,
  );
  return res.json();
};

export const ResponsibleDetails: FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [period, setPeriod] = usePeriod();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
  const [isAdding, setIsAdding] = useState(false);
  const { responsibleId } = useParams();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [drawerOpenIndex, setDrawerOpenIndex] = useState<number | null>(null);

  const { data: registersData, isPending } = useQuery({
    queryKey: ['registers', workspaceId, responsibleId, period, currentPage],
    queryFn: () => getResponsibleRegisters(responsibleId ?? '', period, currentPage),
    enabled: Boolean(workspaceId && responsibleId),
    select: (data) => ({
      responsibleTotals: data.responsibleTotals,
      studentsTotals: data.responsibleTotals.studentsTotals,
      totalPages: data.pagination.totalPages,
    }),
  });

  const responsibleTotals = registersData?.responsibleTotals;
  const responsibleStudents = registersData?.studentsTotals ?? [];
  const totalPages = registersData?.totalPages ?? 1;

  const deleteStudent = useMutation({
    mutationFn: async ({
      responsibleId,
      studentId,
    }: {
      responsibleId: string;
      studentId: string;
    }): Promise<void> => {
      await workspaceApiFetch(`/responsibles/${responsibleId}/students/${studentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registers', workspaceId, responsibleId] });
      toast.success('Aluno removido com sucesso!');
    },
  });

  if (!responsibleId) {
    return <div>Respnsável não encontrado</div>;
  }

  return isPending ? (
    <Loader />
  ) : (
    <div className="app-page">
      <div className="app-content">
        <div className="app-header grid-cols-[2.5rem_minmax(0,1fr)_2.5rem_2.5rem] [&_svg]:size-10 [&_svg]:shrink-0">
          <Link
            key="back-registers"
            to={{ pathname: ROUTES.REGISTERS.ROOT, search: location.search }}
            className="z-30 justify-self-start"
          >
            <ArrowLeft />
          </Link>
          <span className="justify-self-center text-center">{`Alunos de ${responsibleTotals?.responsibleName}`}</span>
          <Button
            variant="primary"
            className="bg-info hover:bg-info-soft hover:text-info focus-visible:ring-accent/35 col-start-3 !size-12 place-items-center self-center justify-self-end !p-0 outline-none focus-visible:ring-[3px] [&_svg]:size-7"
            disabled={isAdding}
            onClick={() => {
              setIsAdding(true);
              setEditingIndex(null);
              setDrawerOpenIndex(null);
            }}
            aria-label="Adicionar aluno"
            title="Adicionar aluno"
          >
            <UserPlus />
          </Button>
          <PeriodPicker value={period} onChange={setPeriod} className="col-start-4" />
        </div>

        <div className="app-list">
          {isAdding && (
            <StudentForm
              workspaceId={workspaceId}
              responsibleId={responsibleId}
              onClose={() => setIsAdding(false)}
            />
          )}
          {responsibleStudents.map((student, idx) => {
            const isEditing = editingIndex === idx;
            const isDrawerOpen = drawerOpenIndex === idx;

            return (
              <div
                key={student.id}
                className="app-row app-row-tall relative isolate overflow-hidden !p-0"
              >
                {isEditing ? (
                  <StudentForm
                    className="relative z-10 !border-0"
                    workspaceId={workspaceId}
                    responsibleId={responsibleId}
                    studentId={student.id}
                    method="update"
                    defaultName={student.name}
                    defaultClass={student.schoolClassId}
                    onClose={() => {
                      setEditingIndex(null);
                      setDrawerOpenIndex(idx);
                    }}
                  />
                ) : (
                  <div className="app-row-action relative z-10 grid w-full grid-cols-[minmax(0,1fr)_7ch_7ch] items-center gap-2.5 px-4 py-3">
                    <div className="inline-flex min-w-0 items-center gap-2.5 [&_svg]:size-10 [&_svg]:shrink-0">
                      <User />
                      <span>{student.name}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-center">{student.schoolClassLabel}</span>
                      <span className="text-center">{student.schoolClassShiftLabel}</span>
                    </div>
                    <span className="text-center tabular-nums">{`R$${fromCents(student.total).toFixed(2)}`}</span>
                  </div>
                )}
                <SwipeActionRow
                  right={{
                    content: (
                      <>
                        <Button
                          onClick={() => {
                            setEditingIndex(isEditing ? null : idx);
                            setDrawerOpenIndex(isDrawerOpen ? null : idx);
                            setIsAdding(false);
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
                            <span>Tem certeza que deseja excluir o aluno?</span>
                            <DialogClose
                              render={
                                <Button
                                  onClick={() =>
                                    deleteStudent.mutate({
                                      responsibleId,
                                      studentId: student.id,
                                    })
                                  }
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
                    width: 136,
                  }}
                  openSide={isDrawerOpen ? 'right' : null}
                  onOpenSideChange={(side) => setDrawerOpenIndex(side === 'right' ? idx : null)}
                  captureInteractions={!isEditing}
                  onTap={() =>
                    navigate({
                      pathname: ROUTES.REGISTERS.STUDENTS.DETAIL_PATH(
                        responsibleTotals?.responsibleId ?? responsibleId,
                        student.id,
                      ),
                      search: location.search,
                    })
                  }
                />
              </div>
            );
          })}
        </div>
        <footer className="app-footer">
          <div className="app-total-bar grid-cols-[minmax(0,1fr)_8ch] [&_svg]:size-10 [&_svg]:shrink-0">
            <span className="text-right">Total: </span>
            <span className="text-right tabular-nums">{`R$${fromCents(responsibleTotals?.total ?? 0).toFixed(2)}`}</span>
          </div>

          <PageNavigator
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </footer>
      </div>
    </div>
  );
};
