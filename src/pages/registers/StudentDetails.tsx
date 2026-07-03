import { type FC } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import ROUTES from '../../constants/routes';
import { ArrowLeft } from 'pixelarticons/react';
import { useQuery } from '@tanstack/react-query';
import type { Register } from '../../constants/canteen/types';
import { Loader } from '../../components/commons/Loader';
import { apiUrl } from '../../utils/api';
import PeriodPicker from '../../components/commons/PeriodPicker';
import { usePeriod } from '../../hooks/usePeriod';

type RegistersResponse = {
  registers: Register[];
  studentName: string;
};

const getStudentRegisters = async (studentId: string): Promise<RegistersResponse> => {
  const res = await fetch(apiUrl(`/students/${studentId}/registers`));
  return res.json();
};

export const StudentDetails: FC = () => {
  const { responsibleId, studentId } = useParams();
  const [period, setPeriod] = usePeriod();
  const location = useLocation();

  const { data: registersResponse, isPending } = useQuery({
    queryKey: ['register', studentId, period],
    queryFn: () => getStudentRegisters(studentId ?? ''),
    enabled: Boolean(studentId),
  });

  if (!studentId || !responsibleId) {
    return <div>Aluno não encontrado</div>;
  }

  const studentRegisters =
    registersResponse?.registers.filter((register) => register.studentId === studentId) ?? [];

  const total = studentRegisters.reduce((sum, register) => {
    return sum + register.total;
  }, 0);

  return isPending ? (
    <Loader />
  ) : (
    <div className="border-text m-6 flex h-fit flex-col overflow-hidden border-4">
      <div className="bg-tertiary grid w-full grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2.5 px-4 py-4 text-xl [&_svg]:size-10 [&_svg]:shrink-0">
        <Link
          key="back-responsible-details"
          to={{ pathname: ROUTES.REGISTERS.DETAIL_PATH(responsibleId), search: location.search }}
          className="z-30 justify-self-start"
        >
          <ArrowLeft />
        </Link>
        <span className="justify-self-center text-center">{`Pedidos de ${registersResponse?.studentName}`}</span>
        <PeriodPicker value={period} onChange={setPeriod} className="col-start-3" />
      </div>

      <div className="grid">
        {studentRegisters.map((register) => (
          <div
            className="border-text/40 text-text grid w-full grid-cols-[minmax(0,1fr)_5ch_7ch] items-center gap-5 border-t-4 px-4 py-3 text-xl [&_svg]:size-10 [&_svg]:shrink-0"
            key={register.id}
          >
            <div className="inline-flex items-center gap-2.5">
              <span>{register.product.label}</span>
            </div>
            <span className="text-center tabular-nums">{register.created_at}</span>
            <span className="text-right tabular-nums">{`R$${register.total.toFixed(2)}`}</span>
          </div>
        ))}
      </div>

      <div className="border-text/40 text-text relative flex w-full items-center justify-end gap-2.5 border-t-4 p-2 text-xl [&_svg]:size-10">
        <div className="flex gap-5">
          <span>Total: </span>
          <span>{`R$${total.toFixed(2)}`}</span>
        </div>
      </div>
    </div>
  );
};
