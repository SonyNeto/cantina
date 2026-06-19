import type { FC } from 'react';
import { STUDENTS } from '../../constants/school/studentstemp';
import { Link, useParams } from 'react-router';
import ROUTES from '../../constants/routes';
import { ArrowLeft } from 'pixelarticons/react';
import {
  getResponsibleNameById,
  getResponsibleTotal,
  getStudentTotal,
} from '../../utils/selectors';

export const ResponsibleDetails: FC = () => {
  const { responsibleId } = useParams();

  if (!responsibleId) {
    return <div>Respnsável não encontrado</div>;
  }

  const total = getResponsibleTotal(responsibleId);
  const responsibleName = getResponsibleNameById(responsibleId);

  return (
    <div className="border-text m-6 flex h-fit flex-col overflow-hidden border-4">
      <div className="bg-tertiary relative flex w-full items-center justify-center gap-2.5 px-6 py-4 text-xl [&_svg]:size-10 [&_svg]:shrink-0">
        <Link key="back-registers" to={ROUTES.REGISTERS.ROOT} className="absolute left-4 z-50">
          <ArrowLeft />
        </Link>
        {`Alunos de ${responsibleName}`}
      </div>

      <div className="grid">
        {STUDENTS.STUDENTS.map((student) => {
          if (responsibleId !== student.responsibleId) return;
          const totalPerStudent = getStudentTotal(student.id);

          return (
            <Link
              key={student.id}
              to={ROUTES.REGISTERS.STUDENTS.DETAIL_PATH(student.responsibleId, student.id)}
              className="border-text/40 text-text hover:bg-hover hover:text-text-hover relative z-50 grid w-full grid-cols-[minmax(0,1fr)_8ch] items-center gap-2.5 border-t-4 p-4 text-xl transition-all [&_svg]:size-10 [&_svg]:shrink-0"
            >
              <span>{student.name}</span>
              <span className="text-right tabular-nums">{`R$ ${totalPerStudent.toFixed(2)}`}</span>
            </Link>
          );
        })}
      </div>

      <div className="border-text/40 text-text relative grid w-full grid-cols-[minmax(0,1fr)_8ch] items-center gap-2.5 border-t-4 p-2 text-xl [&_svg]:size-10 [&_svg]:shrink-0">
        <span className="text-right">Total: </span>
        <span className="text-right tabular-nums">{`R$ ${total.toFixed(2)}`}</span>
      </div>
    </div>
  );
};
