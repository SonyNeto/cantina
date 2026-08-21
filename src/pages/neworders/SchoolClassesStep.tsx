import type { FC } from 'react';
import { Button } from '../../components/commons/Button';
import { ArrowLeft } from 'pixelarticons/react';
import { useQuery } from '@tanstack/react-query';
import type { SchoolClass, ShiftId } from '../../constants/school/types';
import { Loader } from '../../components/commons/Loader';
import { workspaceApiFetch } from '../../utils/api';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';

interface Props {
  onNext: (schoolClassId: string) => void;
  onBack: () => void;
  shiftId: ShiftId | '';
}

type SchoolClassesResponse = {
  schoolClasses: SchoolClass[];
};

const getSchoolClasses = async (shiftId: ShiftId | ''): Promise<SchoolClassesResponse> => {
  const res = await workspaceApiFetch(`/shifts/${shiftId}/schoolClasses`);
  return res.json();
};

export const SchoolClassesStep: FC<Props> = ({ onNext, onBack, shiftId }) => {
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
    <div className="app-content">
      <div className="app-header grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] [&_svg]:size-10">
        <Button variant={'ghost'} className="justify-self-start" disableHover onClick={onBack}>
          <ArrowLeft />
        </Button>
        <span className="justify-self-center text-center">Escolha uma turma</span>
        <span aria-hidden="true" />
      </div>
      <div className="app-list">
        {schoolClasses.map((schoolClass) => (
          <Button
            key={schoolClass.id}
            type="button"
            variant="ghost"
            size="lg"
            className="app-row app-row-action h-auto grid-cols-[minmax(0,1fr)] justify-items-start rounded-none text-left whitespace-normal"
            onClick={() => onNext(schoolClass.id)}
          >
            <span>{schoolClass.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
