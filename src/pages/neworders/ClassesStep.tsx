import type { FC } from 'react';
import { Button } from '../../components/commons/Button';
import { ArrowLeft } from 'pixelarticons/react';
import { useQuery } from '@tanstack/react-query';
import type { SchoolClass, ShiftId } from '../../constants/school/types';
import { Loader } from '../../components/commons/Loader';
import { workspaceApiFetch } from '../../utils/api';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';

interface Props {
  onNext: (classId: string) => void;
  onBack: () => void;
  shiftId: ShiftId | '';
}

type SchoolClassesResponse = {
  schoolClasses: SchoolClass[];
};

const getSchoolClasses = async (shiftId: ShiftId | ''): Promise<SchoolClassesResponse> => {
  const res = await workspaceApiFetch(`/shifts/${shiftId}/classes`);
  return res.json();
};

export const ClassesStep: FC<Props> = ({ onNext, onBack, shiftId }) => {
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);

  const { data: schoolClasses = [], isPending } = useQuery({
    queryKey: ['schoolClasses', workspaceId, shiftId],
    queryFn: () => getSchoolClasses(shiftId),
    enabled: Boolean(workspaceId && shiftId),
    select: (data) => data.schoolClasses,
  });

  return isPending ? (
    <Loader />
  ) : (
    <div className="border-text m-6 flex h-fit flex-col overflow-hidden border-4">
      <div className="bg-tertiary grid w-full grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2.5 px-4 py-4 text-xl [&_svg]:size-10">
        <Button variant={'ghost'} className="justify-self-start" disableHover onClick={onBack}>
          <ArrowLeft />
        </Button>
        <span className="justify-self-center text-center">Escolha uma turma</span>
        <span aria-hidden="true" />
      </div>
      <div className="grid">
        {schoolClasses.map((schoolClass) => (
          <Button
            key={schoolClass.id}
            type="button"
            variant="ghost"
            size="lg"
            className="bg-primary border-text/40 grid h-auto w-full grid-cols-[minmax(0,1fr)] justify-items-start rounded-none border-t-4 p-4 text-left text-xl whitespace-normal"
            onClick={() => onNext(schoolClass.id)}
          >
            <span>{schoolClass.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
