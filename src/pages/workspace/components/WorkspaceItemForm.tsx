import { ResponsibleForm } from '../../registers/components/ResponsibleForm';
import { StudentForm } from '../../registers/components/StudentForm';
import type { WorkspaceFormRequest } from '../types';
import { CreateInvite } from './CreateInvite';
import { SchoolClassForm } from './SchoolClassForm';
import { ShiftForm } from './ShiftForm';

type WorkspaceItemFormProps = {
  request: WorkspaceFormRequest;
  workspaceId?: string;
  responsibleId?: string;
  shiftId?: string;
  inviteOpen: boolean;
  onInviteOpenChange: (open: boolean) => void;
  onClose: () => void;
};

export const WorkspaceItemForm = ({
  request,
  workspaceId,
  responsibleId,
  shiftId,
  inviteOpen,
  onInviteOpenChange,
  onClose,
}: WorkspaceItemFormProps) => {
  const isEditing = Boolean(request.item);
  const method = isEditing ? 'update' : 'post';
  const className = isEditing ? 'relative z-10 !border-0' : undefined;

  switch (request.key) {
    case 'shifts':
      return (
        <ShiftForm
          className={className}
          workspaceId={workspaceId}
          shiftId={request.item?.id}
          method={method}
          defaultLabel={request.item?.label}
          onClose={onClose}
        />
      );
    case 'schoolClasses': {
      const formShiftId = shiftId ?? request.item?.shiftId;

      if (!formShiftId) return null;

      return (
        <SchoolClassForm
          className={className}
          workspaceId={workspaceId}
          shiftId={formShiftId}
          schoolClassId={request.item?.id}
          method={method}
          defaultLabel={request.item?.label}
          onClose={onClose}
        />
      );
    }
    case 'responsibles':
      return (
        <ResponsibleForm
          className={className}
          workspaceId={workspaceId}
          responsibleId={request.item?.id}
          method={method}
          defaultName={request.item?.name}
          onClose={onClose}
        />
      );
    case 'students': {
      const formResponsibleId = responsibleId ?? request.item?.responsibleId;

      if (!formResponsibleId) return null;

      return (
        <StudentForm
          className={className}
          workspaceId={workspaceId}
          responsibleId={formResponsibleId}
          studentId={request.item?.id}
          method={method}
          defaultName={request.item?.name}
          defaultSchoolClass={request.item?.schoolClassId}
          onClose={onClose}
        />
      );
    }
    case 'memberships':
      return <CreateInvite open={inviteOpen} onOpenChange={onInviteOpenChange} />;
  }
};
