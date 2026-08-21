import { Clock, Library, University, Users } from 'pixelarticons/react';
import { GraduationCap } from '../../../assets/icons/MenuIcons';
import type { WorkspaceList, WorkspaceListResponse } from '../types';
import { useDeleteWorkspaceListItem } from './useDeleteWorkspaceListItem';
import { useWorkspaceListQuery } from './useWorkspaceListQuery';

const defaultPagination = {
  page: 1,
  totalPages: 1,
  nextPage: null,
};

type UseWorkspaceListsOptions = {
  page: number;
  search: string;
  workspaceId?: string;
  responsibleId?: string;
  shiftId?: string;
};

export const useWorkspaceLists = ({
  page,
  search,
  workspaceId,
  responsibleId,
  shiftId,
}: UseWorkspaceListsOptions): WorkspaceList[] => {
  const memberships = useWorkspaceListQuery('memberships', page, search, workspaceId);
  const shifts = useWorkspaceListQuery('shifts', page, search, workspaceId);
  const schoolClasses = useWorkspaceListQuery('schoolClasses', page, search, workspaceId, {
    key: 'shifts',
    param: 'shiftId',
    id: shiftId,
  });
  const responsibles = useWorkspaceListQuery('responsibles', page, search, workspaceId);
  const students = useWorkspaceListQuery('students', page, search, workspaceId, {
    key: 'responsibles',
    param: 'responsibleId',
    id: responsibleId,
  });

  const deleteMembership = useDeleteWorkspaceListItem({
    key: 'memberships',
    page,
    search,
    workspaceId,
  });
  const deleteShift = useDeleteWorkspaceListItem({
    key: 'shifts',
    page,
    search,
    workspaceId,
  });
  const deleteSchoolClass = useDeleteWorkspaceListItem({
    key: 'schoolClasses',
    page,
    search,
    workspaceId,
    parent: { key: 'shifts', param: 'shiftId', id: shiftId },
  });
  const deleteResponsible = useDeleteWorkspaceListItem({
    key: 'responsibles',
    page,
    search,
    workspaceId,
  });
  const deleteStudent = useDeleteWorkspaceListItem({
    key: 'students',
    page,
    search,
    workspaceId,
    parent: { key: 'responsibles', param: 'responsibleId', id: responsibleId },
  });

  const membershipsData =
    memberships.data ??
    ({
      memberships: [],
      pagination: defaultPagination,
    } satisfies WorkspaceListResponse<'memberships'>);
  const shiftsData =
    shifts.data ??
    ({ shifts: [], pagination: defaultPagination } satisfies WorkspaceListResponse<'shifts'>);
  const schoolClassesData =
    schoolClasses.data ??
    ({
      schoolClasses: [],
      pagination: defaultPagination,
    } satisfies WorkspaceListResponse<'schoolClasses'>);
  const responsiblesData =
    responsibles.data ??
    ({
      responsibles: [],
      pagination: defaultPagination,
    } satisfies WorkspaceListResponse<'responsibles'>);
  const studentsData =
    students.data ??
    ({ students: [], pagination: defaultPagination } satisfies WorkspaceListResponse<'students'>);

  return [
    {
      key: 'memberships',
      label: 'Membros',
      icon: University,
      items: membershipsData.memberships,
      pagination: membershipsData.pagination,
      isFetching: memberships.isFetching,
      deleteItem: deleteMembership.mutate,
    },
    {
      key: 'shifts',
      label: 'Turnos',
      icon: Clock,
      items: shiftsData.shifts,
      pagination: shiftsData.pagination,
      isFetching: shifts.isFetching,
      deleteItem: deleteShift.mutate,
      child: { key: 'schoolClasses', param: 'shiftId' },
    },
    {
      key: 'schoolClasses',
      label: 'Turmas',
      icon: Library,
      items: schoolClassesData.schoolClasses,
      pagination: schoolClassesData.pagination,
      isFetching: schoolClasses.isFetching,
      deleteItem: deleteSchoolClass.mutate,
      parent: { key: 'shifts', param: 'shiftId' },
    },
    {
      key: 'responsibles',
      label: 'Responsáveis',
      icon: Users,
      items: responsiblesData.responsibles,
      pagination: responsiblesData.pagination,
      isFetching: responsibles.isFetching,
      deleteItem: deleteResponsible.mutate,
      child: { key: 'students', param: 'responsibleId' },
    },
    {
      key: 'students',
      label: 'Alunos',
      icon: GraduationCap,
      items: studentsData.students,
      pagination: studentsData.pagination,
      isFetching: students.isFetching,
      deleteItem: deleteStudent.mutate,
      parent: { key: 'responsibles', param: 'responsibleId' },
    },
  ];
};
