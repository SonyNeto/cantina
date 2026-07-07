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
    <div className="app-panel">
      <div className="app-panel-header place-items-center [&_svg]:size-10 [&_svg]:shrink-0">
        <span className="text-center">Escolha um turno</span>
      </div>
      <div className="app-list">
        {shifts.map((shift) => (
          <Button
            key={shift.id}
            type="button"
            variant="ghost"
            size="lg"
            className="app-row app-row-action h-auto grid-cols-[minmax(0,1fr)] justify-items-start rounded-none text-left whitespace-normal"
            onClick={() => onNext(shift.id)}
          >
            <span>{shift.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
