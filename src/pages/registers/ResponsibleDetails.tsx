import { useState, type FC } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import ROUTES from '../../constants/routes';
import { ArrowLeft, User, UserPlus } from 'pixelarticons/react';
import { Button } from '../../components/commons/Button';
import { useQuery } from '@tanstack/react-query';
import { Loader } from '../../components/commons/Loader';
import { workspaceApiFetch } from '../../utils/api';
import { usePeriod, type Period } from '../../hooks/usePeriod';
import PeriodPicker from '../../components/commons/PeriodPicker';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { AddStudentForm } from './components/AddStudentForm';

type StudentTotal = {
  id: string;
  name: string;
  schoolClassLabel: string;
  total: number;
};

type ResponsibleTotals = {
  responsibleId: string;
  responsibleName: string;
  total: number;
  studentsTotals: StudentTotal[];
};

type ResponsibleRegistersResponse = {
  responsibleTotals: ResponsibleTotals;
};

type FormPosition = 'top' | 'bottom' | null;

const getResponsibleRegisters = async (
  responsibleId: string,
  period: Period,
): Promise<ResponsibleRegistersResponse> => {
  const res = await workspaceApiFetch(
    `/responsibles/${responsibleId}/registers?p=${period.year}${(period.month + 1).toString().padStart(2, '0')}`,
  );
  return res.json();
};

export const ResponsibleDetails: FC = () => {
  const [period, setPeriod] = usePeriod();
  const location = useLocation();
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
  const [formPosition, setFormPosition] = useState<FormPosition>(null);
  const { responsibleId } = useParams();
  const isAdding = formPosition !== null;

  const { data: responsibleTotals, isPending } = useQuery({
    queryKey: ['registers', workspaceId, responsibleId, period],
    queryFn: () => getResponsibleRegisters(responsibleId ?? '', period),
    enabled: Boolean(workspaceId && responsibleId),
    select: (data) => data.responsibleTotals,
  });

  const responsibleStudents = responsibleTotals?.studentsTotals ?? [];

  if (!responsibleId) {
    return <div>Respnsável não encontrado</div>;
  }

  return isPending ? (
    <Loader />
  ) : (
    <div className="app-page">
      <div className="app-panel">
        <div className="app-panel-header grid-cols-[2.5rem_minmax(0,1fr)_2.5rem_2.5rem] [&_svg]:size-10 [&_svg]:shrink-0">
          <Link
            key="back-registers"
            to={{ pathname: ROUTES.REGISTERS.ROOT, search: location.search }}
            className="z-30 justify-self-start"
          >
            <ArrowLeft />
          </Link>
          <span className="justify-self-center text-center">{`Alunos de ${responsibleTotals?.responsibleName}`}</span>
          <Button
            variant="ghost"
            className="border-border/45 bg-panel hover:bg-info-soft hover:text-info focus-visible:ring-accent/35 col-start-3 !size-12 place-items-center self-center justify-self-end rounded-none border-4 !p-0 transition-colors outline-none focus-visible:ring-[3px] [&_svg]:size-7"
            disabled={isAdding}
            onClick={() => setFormPosition('top')}
            aria-label="Adicionar aluno"
            title="Adicionar aluno"
          >
            <UserPlus />
          </Button>
          <PeriodPicker value={period} onChange={setPeriod} className="col-start-4" />
        </div>

        <div className="app-list">
          {formPosition === 'top' && (
            <AddStudentForm
              workspaceId={workspaceId}
              responsibleId={responsibleId}
              onClose={() => setFormPosition(null)}
            />
          )}
          {responsibleStudents
            .sort((student1, student2) => student1.name.localeCompare(student2.name))
            .map((student) => (
              <Link
                key={student.id}
                to={{
                  pathname: ROUTES.REGISTERS.STUDENTS.DETAIL_PATH(
                    responsibleTotals?.responsibleId ?? responsibleId,
                    student.id,
                  ),
                  search: location.search,
                }}
                className="app-row app-row-action z-30 grid-cols-[minmax(0,1fr)_7ch_7ch]"
              >
                <div className="inline-flex min-w-0 items-center gap-2.5 [&_svg]:size-10 [&_svg]:shrink-0">
                  <User />
                  <span>{student.name}</span>
                </div>
                <span className="text-center">{student.schoolClassLabel}</span>
                <span className="text-right tabular-nums">{`R$${student.total.toFixed(2)}`}</span>
              </Link>
            ))}

          {formPosition === 'bottom' ? (
            <AddStudentForm
              workspaceId={workspaceId}
              responsibleId={responsibleId}
              onClose={() => setFormPosition(null)}
            />
          ) : (
            <Button
              className="app-row app-row-action !h-auto !w-full justify-center gap-2.5 rounded-none py-4"
              variant="ghost"
              size="lg"
              disabled={isAdding}
              onClick={() => setFormPosition('bottom')}
            >
              <UserPlus />
              Adicionar aluno
            </Button>
          )}
        </div>

        <div className="app-total-bar grid-cols-[minmax(0,1fr)_8ch] [&_svg]:size-10 [&_svg]:shrink-0">
          <span className="text-right">Total: </span>
          <span className="text-right tabular-nums">{`R$${(responsibleTotals?.total ?? 0).toFixed(2)}`}</span>
        </div>
      </div>
    </div>
  );
};
