import { useState, type FC } from 'react';
import { Link, useParams } from 'react-router';
import { v4 as uuid } from 'uuid';
import ROUTES from '../../constants/routes';
import { ArrowLeft, Check, User, UserPlus } from 'pixelarticons/react';
import { Button } from '../../components/commons/Button';
import { X } from '../../assets/icons/MenuIcons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SchoolClass, Student } from '../../constants/school/types';
import { Loader } from '../../components/commons/Loader';
import { apiUrl } from '../../utils/api';

type StudentTotal = {
  id: string;
  name: string;
  total: number;
};

type SchoolClassesResponse = {
  schoolClasses: SchoolClass[];
};

type ResponsibleTotals = {
  responsibleId: string;
  total: number;
  studentsTotals: StudentTotal[];
};

type ResponsibleRegistersResponse = {
  responsibleTotals: ResponsibleTotals;
};

type CreateStudentInput = {
  name: string;
  classId: string;
};

type StudentResponse = {
  student: Student;
};

const getSchoolClasses = async (): Promise<SchoolClassesResponse> => {
  const res = await fetch(apiUrl('/classes'));
  return res.json();
};

const getResponsibleRegisters = async (
  responsibleId: string,
): Promise<ResponsibleRegistersResponse> => {
  const res = await fetch(apiUrl(`/responsibles/${responsibleId}/registers`));
  return res.json();
};

export const ResponsibleDetails: FC = () => {
  const queryClient = useQueryClient();

  const { data: schoolClassesResponse, isPending: isSchoolClassesPending } = useQuery({
    queryKey: ['schoolClasses'],
    queryFn: getSchoolClasses,
  });

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const { responsibleId } = useParams();

  const { data: responsibleRegistersResponse, isPending } = useQuery({
    queryKey: ['registers', responsibleId],
    queryFn: () => getResponsibleRegisters(responsibleId ?? ''),
    enabled: Boolean(responsibleId),
  });

  const createStudent = useMutation({
    mutationFn: async ({ name, classId }: CreateStudentInput): Promise<StudentResponse> => {
      const res = await fetch(apiUrl(`/responsibles/${responsibleId}/students`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: uuid(),
          name,
          classId,
        }),
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registers', responsibleId] });
    },
  });

  const schoolClasses = schoolClassesResponse?.schoolClasses ?? [];
  const responsibleTotals = responsibleRegistersResponse?.responsibleTotals;
  const responsibleStudents = responsibleTotals?.studentsTotals ?? [];

  if (!responsibleId) {
    return <div>Respnsável não encontrado</div>;
  }

  return isPending ? (
    <Loader />
  ) : (
    <div className="border-text m-6 flex h-fit flex-col overflow-hidden border-4">
      <div className="bg-tertiary grid w-full grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2.5 px-4 py-4 text-xl [&_svg]:size-10 [&_svg]:shrink-0">
        <Link key="back-registers" to={ROUTES.REGISTERS.ROOT} className="z-30 justify-self-start">
          <ArrowLeft />
        </Link>
        <span aria-hidden="true" />
      </div>

      <div className="grid">
        {responsibleStudents.map((student) => (
          <Link
            key={student.id}
            to={ROUTES.REGISTERS.STUDENTS.DETAIL_PATH(
              responsibleTotals?.responsibleId ?? responsibleId,
              student.id,
            )}
            className="border-text/40 text-text z-30 grid w-full grid-cols-[minmax(0,1fr)_7ch] items-center gap-2.5 border-t-4 px-4 py-3 text-xl"
          >
            <div className="inline-flex min-w-0 items-center gap-2.5 [&_svg]:size-10 [&_svg]:shrink-0">
              <User />
              <span>{student.name}</span>
            </div>
            <span className="text-right tabular-nums">{`R$${student.total.toFixed(2)}`}</span>
          </Link>
        ))}
      </div>

      {isAdding ? (
        <form
          className="bg-hover/30 border-text/40 z-50 flex w-full items-center justify-between gap-2.5 rounded-none border-t-4 p-4 text-xl font-medium"
          onSubmit={(e) => {
            e.preventDefault();

            const formData = new FormData(e.currentTarget);
            const name = formData.get('name') as string;
            const classId = formData.get('classId') as string;

            createStudent.mutate({ name, classId });
            setIsAdding(false);
          }}
        >
          <div className="flex flex-col items-center gap-2.5">
            <input
              name="name"
              id={`add-student-name`}
              type="text"
              placeholder="Nome do aluno"
              className="border-text/40 w-[20ch] border-4 px-2"
            />
            <select
              name="classId"
              id={`add-student-class`}
              className="border-text/40 w-[20ch] border-4 px-2"
            >
              <option value="" disabled>
                Selecione uma turma
              </option>
              {!isSchoolClassesPending &&
                schoolClasses.map((schoolClass) => (
                  <option value={schoolClass.id} key={schoolClass.id}>
                    {schoolClass.label}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Button type="submit" variant="primary" size="sm">
              <Check />
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsAdding(false)}>
              <X />
            </Button>
          </div>
        </form>
      ) : (
        <Button
          className="border-text/40 !h-full !w-full justify-center gap-2.5 rounded-none border-t-4 px-4 py-3 text-xl"
          variant="ghost"
          size="lg"
          disabled={isAdding}
          onClick={() => setIsAdding(true)}
        >
          <UserPlus />
          Adicionar aluno
        </Button>
      )}

      <div className="border-text/40 text-text relative grid w-full grid-cols-[minmax(0,1fr)_8ch] items-center gap-2.5 border-t-4 p-2 text-xl [&_svg]:size-10 [&_svg]:shrink-0">
        <span className="text-right">Total: </span>
        <span className="text-right tabular-nums">{`R$${(responsibleTotals?.total ?? 0).toFixed(2)}`}</span>
      </div>
    </div>
  );
};
