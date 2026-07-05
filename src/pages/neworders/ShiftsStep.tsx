import { type FC } from 'react';
import { Button } from '../../components/commons/Button';
import { useQuery } from '@tanstack/react-query';
import type { Shift, ShiftId } from '../../constants/school/types';
import { Loader } from '../../components/commons/Loader';
import { workspaceApiFetch } from '../../utils/api';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';

interface Props {
  onNext: (shiftId: ShiftId) => void;
}

type ShiftsResponse = {
  shifts: Shift[];
};

const getShifts = async (): Promise<ShiftsResponse> => {
  const res = await workspaceApiFetch('/shifts');
  return res.json();
};

export const ShiftsStep: FC<Props> = ({ onNext }) => {
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);

  const { data: shifts = [], isPending } = useQuery({
    queryKey: ['shifts', workspaceId],
    queryFn: getShifts,
    enabled: Boolean(workspaceId),
    select: (data) => data.shifts,
  });

  return isPending ? (
    <Loader />
  ) : (
    <div className="border-text m-6 flex h-fit flex-col overflow-hidden border-4">
      <div className="bg-tertiary grid w-full place-items-center gap-2.5 px-6 py-4 text-xl [&_svg]:size-10 [&_svg]:shrink-0">
        <span className="text-center">Escolha um turno</span>
      </div>
      <div className="grid">
        {shifts.map((shift) => (
          <Button
            key={shift.id}
            type="button"
            variant="ghost"
            size="lg"
            className="bg-primary border-text/40 grid h-auto w-full grid-cols-[minmax(0,1fr)] justify-items-start rounded-none border-t-4 p-4 text-left text-xl whitespace-normal"
            onClick={() => onNext(shift.id)}
          >
            <span>{shift.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
