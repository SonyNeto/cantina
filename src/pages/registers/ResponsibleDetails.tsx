import { useState, type FC } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import ROUTES from '../../constants/routes';
import { ArrowLeft, Check, User, UserPlus } from 'pixelarticons/react';
import { Button } from '../../components/commons/Button';
import { X } from '../../assets/icons/MenuIcons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SchoolClass, Student } from '../../constants/school/types';
import { Loader } from '../../components/commons/Loader';
import { workspaceApiFetch } from '../../utils/api';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '../../components/commons/Select';
import { usePeriod, type Period } from '../../hooks/usePeriod';
import PeriodPicker from '../../components/commons/PeriodPicker';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';

type StudentTotal = {
  id: string;
  name: string;
  schoolClassLabel: string;
  total: number;
};

type SchoolClassesResponse = {
  schoolClasses: SchoolClass[];
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

type CreateStudentInput = {
  name: string;
  classId: string;
};

type StudentResponse = {
  student: Student;
};

const getSchoolClasses = async (): Promise<SchoolClassesResponse> => {
  const res = await workspaceApiFetch('/classes');
  return res.json();
};

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
  const queryClient = useQueryClient();
  const [period, setPeriod] = usePeriod();
  const location = useLocation();
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);

  const { data: schoolClasses = [], isPending: isSchoolClassesPending } = useQuery({
    queryKey: ['schoolClasses', workspaceId],
    queryFn: getSchoolClasses,
    enabled: Boolean(workspaceId),
    select: (data) => data.schoolClasses,
  });

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const { responsibleId } = useParams();

  const { data: responsibleTotals, isPending } = useQuery({
    queryKey: ['registers', workspaceId, responsibleId, period],
    queryFn: () => getResponsibleRegisters(responsibleId ?? '', period),
    enabled: Boolean(workspaceId && responsibleId),
    select: (data) => data.responsibleTotals,
  });

  const createStudent = useMutation({
    mutationFn: async ({ name, classId }: CreateStudentInput): Promise<StudentResponse> => {
      const res = await workspaceApiFetch(`/responsibles/${responsibleId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          classId,
        }),
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registers', workspaceId, responsibleId] });
    },
  });

  const responsibleStudents = responsibleTotals?.studentsTotals ?? [];

  const classesByShift = schoolClasses.reduce<Record<string, SchoolClass[]>>((acc, schoolClass) => {
    const shiftLabel = schoolClass.shiftLabel ?? schoolClass.shiftId;
    acc[shiftLabel] = [...(acc[shiftLabel] ?? []), schoolClass];
    return acc;
  }, {});

  if (!responsibleId) {
    return <div>Respnsável não encontrado</div>;
  }

  return isPending ? (
    <Loader />
  ) : (
    <div className="app-page">
      <div className="app-panel">
        <div className="app-panel-header grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] [&_svg]:size-10 [&_svg]:shrink-0">
          <Link
            key="back-registers"
            to={{ pathname: ROUTES.REGISTERS.ROOT, search: location.search }}
            className="z-30 justify-self-start"
          >
            <ArrowLeft />
          </Link>
          <span className="justify-self-center text-center">{`Alunos de ${responsibleTotals?.responsibleName}`}</span>
          <PeriodPicker value={period} onChange={setPeriod} className="col-start-3" />
        </div>

        <div className="app-list">
          {responsibleStudents.map((student) => (
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
        </div>

        {isAdding ? (
          <form
            className="app-form-row z-50 flex justify-between rounded-none"
            onSubmit={(e) => {
              e.preventDefault();

              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              const classId = formData.get('classId') as string;

              createStudent.mutate({ name, classId });
              setIsAdding(false);
            }}
          >
            <div className="flex min-w-0 flex-col items-center gap-2.5">
              <input
                name="name"
                id={`add-student-name`}
                type="text"
                placeholder="Nome do aluno"
                className="app-input w-full max-w-[21ch] truncate"
              />
              <Select
                name="classId"
                id="add-student-class"
                items={schoolClasses.map((schoolClass) => ({
                  label: schoolClass.label,
                  value: schoolClass.id,
                }))}
              >
                <SelectTrigger
                  placeholder="Selecione uma turma"
                  className="w-full max-w-[21ch] min-w-0"
                />
                <SelectContent className="">
                  {!isSchoolClassesPending &&
                    Object.entries(classesByShift).map(([shiftLabel, classes]) => (
                      <SelectGroup label={shiftLabel} key={shiftLabel}>
                        {classes.map((schoolClass) => (
                          <SelectItem value={schoolClass.id} key={schoolClass.id}>
                            {schoolClass.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                </SelectContent>
              </Select>
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
            className="app-row app-row-action !h-auto !w-full justify-center gap-2.5 rounded-none py-4"
            variant="ghost"
            size="lg"
            disabled={isAdding}
            onClick={() => setIsAdding(true)}
          >
            <UserPlus />
            Adicionar aluno
          </Button>
        )}

        <div className="app-total-bar grid-cols-[minmax(0,1fr)_8ch] [&_svg]:size-10 [&_svg]:shrink-0">
          <span className="text-right">Total: </span>
          <span className="text-right tabular-nums">{`R$${(responsibleTotals?.total ?? 0).toFixed(2)}`}</span>
        </div>
      </div>
    </div>
  );
};
