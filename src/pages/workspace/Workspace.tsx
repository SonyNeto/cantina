import { useState, type FC, type JSX } from 'react';
import { Tab, TabPanel, Tabs, TabsIndicator, TabsList } from '../../components/commons/Tabs';
import { Clock, Library, University, Users } from 'pixelarticons/react';
import { GraduationCap } from '../../assets/icons/MenuIcons';
import { workspaceApiFetch } from '../../utils/api';
import type {
  Membership,
  Responsible,
  SchoolClass,
  Shift,
  Student,
} from '../../constants/school/types';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useQuery } from '@tanstack/react-query';
import { Loader } from '../../components/commons/Loader';
import { ResponsibleForm } from '../registers/components/ResponsibleForm';
import { StudentForm } from '../registers/components/StudentForm';

type Pagination = {
  page: number;
  totalPages: number;
  nextPage: number | null;
};

type ListItem = {
  memberships: Membership;
  shifts: Shift;
  schoolClasses: SchoolClass;
  responsibles: Responsible;
  students: Student;
};

type ListKey = keyof ListItem;

type ListResponse<K extends ListKey> = {
  [P in K]: ListItem[P][];
} & {
  pagination: Pagination;
};

type ListConfig<K extends ListKey> = {
  key: K;
  label: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  data: ListResponse<K>;
  isFetching: boolean;
};

const getList = async <K extends keyof ListItem>(
  object: K,
  page: number,
  search: string,
): Promise<ListResponse<K>> => {
  //review this nomenclature
  const params = new URLSearchParams({
    page: String(page),
    limit: String(10),
    search,
  });
  const res = await workspaceApiFetch(`/${object}?${params}`);
  return res.json();
};

const useListQuery = <K extends ListKey>(
  key: K,
  page: number,
  search: string,
  workspaceId?: string,
) => {
  return useQuery({
    queryKey: ['workspaces', key, workspaceId, page, search],
    queryFn: () => getList(key, page, search),
    enabled: Boolean(workspaceId),
  });
};

const defaultPagination = {
  page: 1,
  totalPages: 1,
  nextPage: null,
};

export const Workspace: FC = () => {
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const {
    data: membershipsData = {
      memberships: [],
      pagination: defaultPagination,
    } satisfies ListResponse<'memberships'>,
    isFetching: isFetchingMemberships,
  } = useListQuery('memberships', currentPage, search, workspaceId);

  const {
    data: shiftsData = {
      shifts: [],
      pagination: defaultPagination,
    } satisfies ListResponse<'shifts'>,
    isFetching: isFetchingShifts,
  } = useListQuery('shifts', currentPage, search, workspaceId);

  const {
    data: schoolClassesData = {
      schoolClasses: [],
      pagination: defaultPagination,
    } satisfies ListResponse<'schoolClasses'>,
    isFetching: isFetchingSchoolClasses,
  } = useListQuery('schoolClasses', currentPage, search, workspaceId);

  const {
    data: responsiblesData = {
      responsibles: [],
      pagination: defaultPagination,
    } satisfies ListResponse<'responsibles'>,
    isFetching: isFetchingResponsibles,
  } = useListQuery('responsibles', currentPage, search, workspaceId);

  const {
    data: studentsData = {
      students: [],
      pagination: defaultPagination,
    } satisfies ListResponse<'students'>,
    isFetching: isFetchingStudents,
  } = useListQuery('students', currentPage, search, workspaceId);

  const listConfig = [
    {
      key: 'memberships',
      label: 'Membros',
      icon: University,
      data: membershipsData,
      isFetching: isFetchingMemberships,
    },
    {
      key: 'shifts',
      label: 'Turnos',
      icon: Clock,
      data: shiftsData,
      isFetching: isFetchingShifts,
    },
    {
      key: 'schoolClasses',
      label: 'Turmas',
      icon: Library,
      data: schoolClassesData,
      isFetching: isFetchingSchoolClasses,
    },
    {
      key: 'responsibles',
      label: 'Responsáveis',
      icon: Users,
      data: responsiblesData,
      isFetching: isFetchingResponsibles,
    },
    {
      key: 'students',
      label: 'Alunos',
      icon: GraduationCap,
      data: studentsData,
      isFetching: isFetchingStudents,
    },
  ] satisfies {
    [K in ListKey]: ListConfig<K>;
  }[ListKey][];

  const addForm = (key: ListKey) => {
    switch (key) {
      case 'shifts':
        return <></>;
        break;
      case 'schoolClasses':
        return <></>;
        break;
      case 'responsibles':
        return <ResponsibleForm workspaceId={workspaceId} onClose={() => setIsAdding(false)} />;
        break;
      case 'students':
        return <StudentForm workspaceId={workspaceId} responsibleId={responsibleId} onClose={() => setIsAdding(false)} />;
        break;
      case 'memberships':
        return <></>;
        break;
    }
  };

  return (
    <Tabs
      defaultValue="memberships"
      onValueChange={() => {
        setCurrentPage(1);
        setIsAdding(false);
      }}
      className="app-page"
    >
      <TabsList className="relative flex items-center">
        {listConfig.map((list) => {
          return (
            <Tab key={list.key} value={list.key}>
              <list.icon />
            </Tab>
          );
        })}
        <TabsIndicator />
      </TabsList>

      {listConfig.map((list) => {
        const { key, data, label } = list;
        const items = (
          list.data as {
            [K in ListKey]?: ListItem[K][];
          }
        )[list.key]!;

        return (
          <TabPanel
            key={key}
            value={key}
            title={label}
            currentPage={currentPage}
            totalPages={data.pagination.totalPages}
            setCurrentPage={setCurrentPage}
            search={search}
            setSearch={setSearch}
            searchPlaceholder={`Encontre ${list.label}`}
            onAdd={() => setIsAdding(true)}
            isAdding={isAdding}
          >
            {isAdding && addForm(key)}
            {items.map((item) => {
              return (
                <div key={item.id} className="app-row">
                  <div className="app-row-action relative z-10 grid w-full grid-cols-[minmax(0,1fr)_7ch] items-center gap-2.5 py-3 pr-8 pl-4">
                    <span>
                      {'label' in item ? item.label : 'name' in item ? item.name : item.email}
                    </span>
                    <span>{'role' in item && item.role}</span>
                  </div>
                </div>
              );
            })}
            {list.isFetching && <Loader />}
          </TabPanel>
        );
      })}
    </Tabs>
  );
};
