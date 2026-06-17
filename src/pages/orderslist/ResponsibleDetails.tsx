import type { FC } from 'react';
import { STUDENTS } from '../../constants/school/studentstemp';
import { Link, useParams } from 'react-router';
import ROUTES from '../../constants/routes';
import { ArrowLeft } from 'pixelarticons/react';
import { getResponsibleTotal, getStudentTotal } from '../../utils/selectors';

export const ResponsibleDetails: FC = () => {
  const { responsibleId } = useParams();

  if (!responsibleId) {
    return <div>Respnsável não encontrado</div>;
  }

  const total = getResponsibleTotal(responsibleId);

  return (
    <div className="border-text m-6 flex h-fit flex-col border-4">
      <div className="bg-tertiary relative flex w-full items-center justify-center gap-2.5 px-6 py-4 text-xl [&_svg]:size-10">
        <Link key="back-orders-list" to={ROUTES.ORDERSLIST.ROOT} className="absolute left-4 z-50">
          <ArrowLeft />
        </Link>
        Alunos
      </div>

      {STUDENTS.STUDENTS.map((student) => {
        if (responsibleId !== student.responsibleId) return;
        const totalPerStudent = getStudentTotal(student.id);

        return (
          <Link
            key={student.id}
            to={ROUTES.ORDERSLIST.STUDENTS.DETAIL_PATH(student.responsibleId, student.id)}
            className="border-text/30 text-text relative z-50 flex w-full items-center justify-between gap-2.5 border-t-4 p-4 text-xl [&_svg]:size-10"
          >
            <span>{student.name}</span>
            <span className="whitespace-nowrap">{`R$ ${totalPerStudent.toFixed(2)}`}</span>
          </Link>
        );
      })}

      <div className="border-text/30 text-text relative flex w-full items-center justify-end gap-2.5 border-t-4 p-4 text-xl [&_svg]:size-10">
        <div className="flex gap-5">
          <span>Total: </span>
          <span>{`R$ ${total.toFixed(2)}`}</span>
        </div>
      </div>
    </div>
  );
};
