import type { ComponentType, SVGProps } from 'react';
import type {
  Membership,
  Responsible,
  SchoolClass,
  Shift,
  Student,
} from '../../constants/school/types';

export type Pagination = {
  page: number;
  totalPages: number;
  nextPage: number | null;
};

export type WorkspaceListItems = {
  memberships: Membership;
  shifts: Shift;
  schoolClasses: SchoolClass;
  responsibles: Responsible;
  students: Student;
};

export type WorkspaceListKey = keyof WorkspaceListItems;
export type WorkspaceListItem = WorkspaceListItems[WorkspaceListKey];

export type WorkspaceListResponse<K extends WorkspaceListKey> = {
  [P in K]: WorkspaceListItems[P][];
} & {
  pagination: Pagination;
};

export type WorkspaceListRelation = {
  key: WorkspaceListKey;
  param: string;
};

export type WorkspaceList = {
  key: WorkspaceListKey;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  items: WorkspaceListItem[];
  pagination: Pagination;
  isFetching: boolean;
  deleteItem: (id: string) => void;
  parent?: WorkspaceListRelation;
  child?: WorkspaceListRelation;
};

export type WorkspaceFormRequest = {
  [K in WorkspaceListKey]: {
    key: K;
    item?: WorkspaceListItems[K];
  };
}[WorkspaceListKey];

export type WorkspaceParentFilter = {
  key: WorkspaceListKey;
  param: 'responsibleId' | 'shiftId';
  id?: string;
};
