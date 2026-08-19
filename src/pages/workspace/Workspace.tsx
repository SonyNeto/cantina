import { useState, type FC, type JSX } from 'react';
import { Tab, TabPanel, Tabs, TabsIndicator, TabsList } from '../../components/commons/Tabs';
import { Clock, Library, Users } from 'pixelarticons/react';
import { GraduationCap } from '../../assets/icons/MenuIcons';
import { workspaceApiFetch } from '../../utils/api';
import type { Responsible, SchoolClass, Shift, Student } from '../../constants/school/types';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useQuery } from '@tanstack/react-query';
import { Loader } from '../../components/commons/Loader';

type Pagination = {
  page: number;
  totalPages: number;
  nextPage: number | null;
};

type ListItem = {
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

  console.log({
    shiftsData,
    schoolClassesData,
    responsiblesData,
    studentsData,
  });

  const listConfig = [
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

  return (
    <Tabs defaultValue="shifts" onValueChange={() => setCurrentPage(1)} className="app-page">
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
          >
            {items.map((item) => {
              return (
                <div key={item.id} className="app-row">
                  {'label' in item ? item.label : item.name}
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
