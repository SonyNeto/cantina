import { useState, type FC, type JSX } from 'react';
import { Tab, TabPanel, Tabs, TabsIndicator, TabsList } from '../../components/commons/Tabs';
import { Check, Clock, Library, PenSquare, University, Users } from 'pixelarticons/react';
import { GraduationCap, TrashCan } from '../../assets/icons/MenuIcons';
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
import { SwipeActionRow } from '../../components/commons/SwipeActionRow';
import { Button } from '../../components/commons/Button';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '../../components/commons/Dialog';
import { useSearchParams } from 'react-router';

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
  responsibleId?: string,
  shiftId?: string,
): Promise<ListResponse<K>> => {
  //review this nomenclature
  const params = new URLSearchParams({
    page: String(page),
    limit: String(10),
    search,
  });
  if (responsibleId) params.set('responsibleId', responsibleId);
  if (shiftId) params.set('shiftId', shiftId);

  const res = await workspaceApiFetch(`/${object}?${params}`);
  return res.json();
};

const useListQuery = <K extends ListKey>(
  key: K,
  page: number,
  search: string,
  workspaceId?: string,
  filter?: {
    responsibleId?: string;
    shiftId?: string;
  },
) => {
  return useQuery({
    queryKey: [
      'workspaces',
      key,
      workspaceId,
      page,
      search,
      filter?.responsibleId,
      filter?.shiftId,
    ],
    queryFn: () => getList(key, page, search, filter?.responsibleId, filter?.shiftId),
    enabled: Boolean(workspaceId),
  });
};

const defaultPagination = {
  page: 1,
  totalPages: 1,
  nextPage: null,
};

const defaultTab = 'memberships';

export const Workspace: FC = () => {
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [drawerOpenIndex, setDrawerOpenIndex] = useState<number | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = searchParams.get('tab') ?? defaultTab;
  const responsibleId = searchParams.get('responsibleId') ?? undefined;
  const shiftId = searchParams.get('shiftId') ?? undefined;

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
  } = useListQuery('schoolClasses', currentPage, search, workspaceId, { shiftId });

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
  } = useListQuery('students', currentPage, search, workspaceId, { responsibleId });

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
      case 'schoolClasses':
        return <></>;
      case 'responsibles':
        return <ResponsibleForm workspaceId={workspaceId} onClose={() => setIsAdding(false)} />;
      case 'students':
        if (!responsibleId) return null;

        return (
          <StudentForm
            workspaceId={workspaceId}
            responsibleId={responsibleId}
            onClose={() => setIsAdding(false)}
          />
        );
      case 'memberships':
        return <></>;
    }
  };

  return (
    <Tabs
      defaultValue={defaultTab}
      onValueChange={(value) => {
        setCurrentPage(1);
        setIsAdding(false);
        setSearchParams({
          tab: value,
        });
      }}
      value={tab}
      className="app-page"
    >
      <TabsList className="relative flex items-center">
        {listConfig.map((list) => {
          const tabComponent = (
            <Tab key={list.key} value={list.key}>
              <list.icon />
            </Tab>
          );

          if (list.key === tab) return tabComponent;
          if (list.key === 'schoolClasses' || list.key === 'students') return;
          return tabComponent;
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
            {items.map((item, idx) => {
              const isEditing = editingIndex === idx;
              const isDrawerOpen = drawerOpenIndex === idx;
              return (
                <div key={item.id} className="app-row relative isolate overflow-hidden !p-0">
                  <div className="app-row-action relative z-10 grid w-full grid-cols-[minmax(0,1fr)_7ch] items-center gap-2.5 py-4 pr-8 pl-4">
                    <span>
                      {'label' in item ? item.label : 'name' in item ? item.name : item.email}
                    </span>
                    <span>{'role' in item && item.role}</span>

                    <SwipeActionRow
                      right={{
                        content: (
                          <>
                            <Button
                              onClick={() => {
                                setEditingIndex(isEditing ? null : idx);
                                setDrawerOpenIndex(isDrawerOpen ? null : idx);
                                setIsAdding(false);
                              }}
                              disabled={isEditing}
                            >
                              <PenSquare />
                            </Button>

                            <Dialog>
                              <DialogTrigger
                                render={<Button size="md" variant="primary" disabled={isEditing} />}
                              >
                                <TrashCan />
                              </DialogTrigger>
                              <DialogContent title="Atenção">
                                <span>Tem certeza que deseja excluir?</span>
                                <DialogClose
                                  render={
                                    <Button
                                      onClick={() => {
                                        //deleteResponsible.mutate(responsibleTotal.responsibleId);
                                        setEditingIndex(null);
                                        setIsAdding(false);
                                        setDrawerOpenIndex(null);
                                      }}
                                    />
                                  }
                                >
                                  <Check />
                                  <span>Sim</span>
                                </DialogClose>
                              </DialogContent>
                            </Dialog>
                          </>
                        ),
                        handleWidth: 16,
                        width: 136,
                      }}
                      openSide={isDrawerOpen ? 'right' : null}
                      onOpenSideChange={(side) => setDrawerOpenIndex(side === 'right' ? idx : null)}
                      onTap={() => {
                        if (list.key === 'shifts') {
                          setSearchParams({
                            tab: 'schoolClasses',
                            shiftId: item.id,
                          });

                          return;
                        }

                        if (list.key === 'responsibles') {
                          setSearchParams({
                            tab: 'students',
                            responsibleId: item.id,
                          });

                          return;
                        }
                      }}
                      captureInteractions={!isEditing}
                    />
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
