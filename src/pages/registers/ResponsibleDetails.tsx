import { useState, type FC } from 'react';
import { STUDENTS } from '../../constants/school/studentstemp';
import { Link, useParams } from 'react-router';
import ROUTES from '../../constants/routes';
import { ArrowLeft, Check, Plus } from 'pixelarticons/react';
import {
  getResponsibleNameById,
  getResponsibleTotal,
  getStudentTotal,
} from '../../utils/selectors';
import { Button } from '../../components/commons/Button';
import { X } from '../../assets/icons/MenuIcons';

export const ResponsibleDetails: FC = () => {
  const { responsibleId } = useParams();
  const [isAdding, setIsAdding] = useState<boolean>(false);

  if (!responsibleId) {
    return <div>Respnsável não encontrado</div>;
  }

  const total = getResponsibleTotal(responsibleId);
  const responsibleName = getResponsibleNameById(responsibleId);

  return (
    <div className="border-text m-6 flex h-fit flex-col overflow-hidden border-4">
      <div className="bg-tertiary grid w-full grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2.5 px-4 py-4 text-xl [&_svg]:size-10 [&_svg]:shrink-0">
        <Link key="back-registers" to={ROUTES.REGISTERS.ROOT} className="z-50 justify-self-start">
          <ArrowLeft />
        </Link>
        <span className="justify-self-center text-center">{`Alunos de ${responsibleName}`}</span>
        <span aria-hidden="true" />
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
              <span className="text-right tabular-nums">{`R$${totalPerStudent.toFixed(2)}`}</span>
            </Link>
          );
        })}
      </div>

      {isAdding ? (
        <div className="bg-hover/30 border-text/40 z-50 flex w-full items-center justify-between gap-2.5 rounded-none border-t-4 p-4 text-xl font-medium [&_svg]:size-10 [&_svg]:shrink-0">
          <div className="inline-flex items-center gap-2.5">
            <input
              id={`add-responsible-name`}
              type="text"
              placeholder="Nome do aluno"
              className="border-text/40 w-[20ch] border-4 px-2"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Button variant="primary" size="sm" onClick={() => setIsAdding(false)}>
              <Check />
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsAdding(false)}>
              <X />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          className="border-text/40 !h-full !w-full justify-center gap-2.5 rounded-none border-t-4 p-4 text-xl"
          variant="ghost"
          disabled={isAdding}
          onClick={() => setIsAdding(true)}
        >
          <Plus />
          Adicionar aluno
        </Button>
      )}

      <div className="border-text/40 text-text relative grid w-full grid-cols-[minmax(0,1fr)_8ch] items-center gap-2.5 border-t-4 p-2 text-xl [&_svg]:size-10 [&_svg]:shrink-0">
        <span className="text-right">Total: </span>
        <span className="text-right tabular-nums">{`R$${total.toFixed(2)}`}</span>
      </div>
    </div>
  );
};
