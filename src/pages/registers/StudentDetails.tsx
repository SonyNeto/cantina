import { type FC } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import ROUTES from '../../constants/routes';
import { ArrowLeft } from 'pixelarticons/react';
import { useQuery } from '@tanstack/react-query';
import type { Register } from '../../constants/canteen/types';
import { Loader } from '../../components/commons/Loader';
import { workspaceApiFetch } from '../../utils/api';
import PeriodPicker from '../../components/commons/PeriodPicker';
import { usePeriod, type Period } from '../../hooks/usePeriod';
import dayjs from 'dayjs';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';

type RegistersResponse = {
  registers: Register[];
  studentName: string;
};

const getStudentRegisters = async (
  studentId: string,
  period: Period,
): Promise<RegistersResponse> => {
  const res = await workspaceApiFetch(
    `/students/${studentId}/registers?p=${period.year}${(period.month + 1).toString().padStart(2, '0')}`,
  );
  return res.json();
};

export const StudentDetails: FC = () => {
  const { responsibleId, studentId } = useParams();
  const [period, setPeriod] = usePeriod();
  const location = useLocation();
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);

  const { data: studentRegisterDetails, isPending } = useQuery({
    queryKey: ['register', workspaceId, studentId, period],
    queryFn: () => getStudentRegisters(studentId ?? '', period),
    enabled: Boolean(workspaceId && studentId),
    select: (data) => ({
      studentName: data.studentName,
      registers: data.registers.filter((register) => register.studentId === studentId),
    }),
  });

  if (!studentId || !responsibleId) {
    return <div>Aluno não encontrado</div>;
  }

  const studentRegisters = studentRegisterDetails?.registers ?? [];

  const total = studentRegisters.reduce((sum, register) => {
    return sum + register.total;
  }, 0);

  return isPending ? (
    <Loader />
  ) : (
    <div className="app-page">
      <div className="app-panel">
        <div className="app-panel-header grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] [&_svg]:size-10 [&_svg]:shrink-0">
          <Link
            key="back-responsible-details"
            to={{ pathname: ROUTES.REGISTERS.DETAIL_PATH(responsibleId), search: location.search }}
            className="z-30 justify-self-start"
          >
            <ArrowLeft />
          </Link>
          <span className="justify-self-center text-center">{`Pedidos de ${studentRegisterDetails?.studentName}`}</span>
          <PeriodPicker value={period} onChange={setPeriod} className="col-start-3" />
        </div>

        <div className="app-list">
          {studentRegisters.map((register) => (
            <div
              className="app-row grid-cols-[minmax(0,1fr)_8ch_7ch] gap-5 [&_svg]:size-10 [&_svg]:shrink-0"
              key={register.id}
            >
              <div className="inline-flex items-center gap-2.5">
                <span>{register.product.label}</span>
              </div>
              <span className="text-center tabular-nums">
                {dayjs(register.created_at).format('DD/MM/YYYY')}
              </span>
              <span className="text-right tabular-nums">{`R$${register.total.toFixed(2)}`}</span>
            </div>
          ))}
        </div>

        <div className="app-total-bar justify-end [&_svg]:size-10">
          <div className="flex gap-5">
            <span>Total: </span>
            <span>{`R$${total.toFixed(2)}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
