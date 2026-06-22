import type { FC } from 'react';
import { REGISTERS } from '../../constants/canteen/registerstemp';
import { Link, useParams } from 'react-router';
import ROUTES from '../../constants/routes';
import { ArrowLeft } from 'pixelarticons/react';
import { getStudentById, getStudentTotal } from '../../utils/selectors';

export const StudentDetails: FC = () => {
  const { responsibleId, studentId } = useParams();

  if (!studentId || !responsibleId) {
    return <div>Aluno não encontrado</div>;
  }

  const total = getStudentTotal(studentId);
  const studentName = getStudentById(studentId)?.name || '';

  return (
    <div className="border-text m-6 flex h-fit flex-col overflow-hidden border-4">
      <div className="bg-tertiary grid w-full grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2.5 px-4 py-4 text-xl [&_svg]:size-10 [&_svg]:shrink-0">
        <Link
          key="back-responsible-details"
          to={ROUTES.REGISTERS.DETAIL_PATH(responsibleId)}
          className="z-30 justify-self-start"
        >
          <ArrowLeft />
        </Link>
        <span className="justify-self-center text-center">{`Registros de ${studentName}`}</span>
        <span aria-hidden="true" />
      </div>

      <div className="grid">
        {REGISTERS.REGISTERS.map((register) => {
          if (studentId !== register.studentId) return;

          return (
            <div
              className="border-text/40 text-text grid w-full grid-cols-[minmax(0,1fr)_5ch_7ch] items-center gap-5 border-t-4 px-4 py-3 text-xl [&_svg]:size-10 [&_svg]:shrink-0"
              key={register.id}
            >
              <div className="inline-flex items-center gap-2.5">
                <register.product.icon />
                <span>{register.product.label}</span>
              </div>
              <span className="text-center tabular-nums">{register.created_at}</span>
              <span className="text-right tabular-nums">{`R$${register.product.price.toFixed(2)}`}</span>
            </div>
          );
        })}
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
