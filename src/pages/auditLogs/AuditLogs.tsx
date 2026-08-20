import { useState, type FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ChevronDown2, Coffee, University, User } from 'pixelarticons/react';
import { useSearchParams } from 'react-router';
import { Pan } from '../../assets/icons/MenuIcons';
import { Tab, TabPanel, Tabs, TabsIndicator, TabsList } from '../../components/commons/Tabs';
import PeriodPicker from '../../components/commons/PeriodPicker';
import { Loader } from '../../components/commons/Loader';
import { usePeriod, type Period } from '../../hooks/usePeriod';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { workspaceApiFetch } from '../../utils/api';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/commons/Accordion';

type Pagination = {
  page: number;
  totalPages: number;
  nextPage: number | null;
};

type AuditLog = {
  id: string;
  actor: {
    userId: string | null;
    email: string | null;
    role: string;
  };
  action: string;
  target: {
    type: string;
    id: string;
  };
  changes?: Record<string, unknown>;
  metadata?: {
    eventId?: string;
    ip?: string;
    userAgent?: string;
  };
  context?: {
    targetName: string | null;
    studentName: string | null;
    responsibleName: string | null;
    itemLabels: string[];
  };
  createdAt: string;
};

type AuditLogsResponse = {
  auditLogs: AuditLog[];
  pagination: Pagination;
};

const listConfig = [
  {
    key: 'orders',
    label: 'Pedidos',
    icon: Pan,
  },
  {
    key: 'registers',
    label: 'Registros',
    icon: User,
  },
  {
    key: 'menuItems',
    label: 'Cardápio',
    icon: Coffee,
  },
  {
    key: 'workspace',
    label: 'Instituição',
    icon: University,
  },
] as const;

type AuditLogCategory = (typeof listConfig)[number]['key'];

const defaultTab = listConfig[0].key;

const defaultAuditLogsData = {
  auditLogs: [],
  pagination: {
    page: 1,
    totalPages: 1,
    nextPage: null,
  },
} satisfies AuditLogsResponse;

const isAuditLogCategory = (value: string | null): value is AuditLogCategory =>
  listConfig.some(({ key }) => key === value);

const actionLabels: Record<string, string> = {
  'order.create': 'Pedido criado',
  'orderItem.statusUpdated': 'Status do item atualizado',
  'orderItem.deleted': 'Item removido do pedido',
  'orderItem.register': 'Item registrado',
  'register.updatePayment': 'Pagamento atualizado',
  'menuItem.created': 'Item do cardápio criado',
  'menuItem.updated': 'Item do cardápio atualizado',
  'menuItem.deleted': 'Item do cardápio removido',
  'workspace.created': 'Instituição criada',
  'workspaceInvite.created': 'Convite criado',
  'workspaceInvite.accepted': 'Convite aceito',
  'shift.created': 'Turno criado',
  'schoolClass.created': 'Turma criada',
  'responsible.created': 'Responsável criado',
  'responsible.updated': 'Responsável atualizado',
  'responsible.deleted': 'Responsável removido',
  'student.created': 'Aluno criado',
  'student.updated': 'Aluno atualizado',
  'student.deleted': 'Aluno removido',
};

const targetLabels: Record<string, string> = {
  order: 'Pedido',
  orderItem: 'Item do pedido',
  register: 'Registro',
  menuItem: 'Item do cardápio',
  workspace: 'Instituição',
  workspaceInvite: 'Convite',
  membership: 'Membro',
  shift: 'Turno',
  schoolClass: 'Turma',
  responsible: 'Responsável',
  student: 'Aluno',
};

const statusLabels: Record<string, string> = {
  cooking: 'Em preparo',
  ready: 'Pronto',
};

const getAuditLogSummary = (auditLog: AuditLog): string =>
  [
    (auditLog.changes?.product as { label?: string } | undefined)?.label ??
      (typeof auditLog.changes?.name === 'string'
        ? auditLog.changes.name
        : (auditLog.changes?.name as { to?: string } | undefined)?.to) ??
      (typeof auditLog.changes?.label === 'string'
        ? auditLog.changes.label
        : (auditLog.changes?.label as { to?: string } | undefined)?.to),
    (auditLog.changes?.status as { from?: string; to?: string } | undefined)?.from &&
    (auditLog.changes?.status as { from?: string; to?: string } | undefined)?.to
      ? `${
          statusLabels[(auditLog.changes?.status as { from: string; to: string }).from] ??
          (auditLog.changes?.status as { from: string; to: string }).from
        } → ${
          statusLabels[(auditLog.changes?.status as { from: string; to: string }).to] ??
          (auditLog.changes?.status as { from: string; to: string }).to
        }`
      : null,
    typeof auditLog.changes?.itemCount === 'number'
      ? `${auditLog.changes.itemCount} ${auditLog.changes.itemCount === 1 ? 'item' : 'itens'}`
      : null,
    typeof auditLog.changes?.role === 'string'
      ? auditLog.changes.role
      : (auditLog.changes?.role as { to?: string } | undefined)?.to,
  ]
    .filter((detail): detail is string => Boolean(detail))
    .join(' · ') ||
  `${targetLabels[auditLog.target.type] ?? auditLog.target.type} #${auditLog.target.id.slice(-6)}`;

const getAuditLogs = async (
  type: AuditLogCategory,
  period: Period,
  page: number,
  search: string,
): Promise<AuditLogsResponse> => {
  const params = new URLSearchParams({
    p: `${period.year}${String(period.month + 1).padStart(2, '0')}`,
    page: String(page),
    limit: String(20),
    search,
  });
  const res = await workspaceApiFetch(`/audit-logs/${type}?${params}`);

  if (!res.ok) {
    throw new Error('Falha ao buscar registros de auditoria');
  }

  return res.json();
};

export const AuditLogs: FC = () => {
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
  const [period, setPeriod] = usePeriod();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedTab = searchParams.get('tab');
  const tab = isAuditLogCategory(requestedTab) ? requestedTab : defaultTab;

  const { data: auditLogsData = defaultAuditLogsData, isFetching } = useQuery({
    queryKey: ['workspaces', 'auditLogs', workspaceId, tab, period, currentPage, search],
    queryFn: () => getAuditLogs(tab, period, currentPage, search),
    enabled: Boolean(workspaceId),
  });

  const auditLogsByDate = auditLogsData.auditLogs.reduce<Record<string, AuditLog[]>>(
    (auditLogsByDate, auditLog) => {
      const date = dayjs(auditLog.createdAt).format('YYYY-MM-DD');
      auditLogsByDate[date] ??= [];
      auditLogsByDate[date].push(auditLog);

      return auditLogsByDate;
    },
    {},
  );

  const auditLogDateGroups = Object.entries(auditLogsByDate);

  return (
    <Tabs
      defaultValue={defaultTab}
      onValueChange={(value) => {
        setCurrentPage(1);
        setSearchParams((currentSearchParams) => {
          const nextSearchParams = new URLSearchParams(currentSearchParams);
          nextSearchParams.set('tab', value);

          return nextSearchParams;
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

          return tabComponent;
        })}
        <TabsIndicator />
      </TabsList>

      {listConfig.map((list) => {
        const { key, label } = list;

        return (
          <TabPanel
            key={key}
            value={key}
            title={label}
            currentPage={currentPage}
            totalPages={key === tab ? auditLogsData.pagination.totalPages : 1}
            setCurrentPage={setCurrentPage}
            search={search}
            setSearch={setSearch}
            searchPlaceholder={`Encontre ${list.label}`}
            headerAction={
              <PeriodPicker
                value={period}
                onChange={(nextPeriod) => {
                  setPeriod(nextPeriod);
                  setCurrentPage(1);
                }}
                className="col-start-3"
                aria-label="Filtrar auditoria por mês"
                title="Filtrar auditoria por mês"
              />
            }
          >
            {key === tab && (
              <>
                {auditLogDateGroups.map(([date, auditLogs]) => (
                  <div key={date} className="app-group">
                    <div className="app-row app-row-label text-muted px-4 text-xl">
                      {dayjs(date).format('DD/MM')}
                    </div>

                    <Accordion multiple className="!border-b-0">
                      {auditLogs.map((auditLog) => {
                        const actor = auditLog.actor.email ?? auditLog.actor.role;
                        const summary = getAuditLogSummary(auditLog);

                        return (
                          <AccordionItem key={auditLog.id} value={auditLog.id}>
                            <AccordionTrigger className="app-row app-row-action group border-border/35 grid-cols-[minmax(0,1fr)_minmax(6rem,10rem)_2rem] gap-2.5 border-b-4 py-2 text-left">
                              <div className="flex min-w-0 flex-col">
                                <span className="truncate" title={auditLog.action}>
                                  {actionLabels[auditLog.action] ?? auditLog.action}
                                </span>
                                <span className="text-muted truncate text-base" title={summary}>
                                  {summary}
                                </span>
                              </div>

                              <div className="text-muted flex min-w-0 flex-col items-end text-base">
                                <span className="max-w-full truncate" title={actor}>
                                  {actor}
                                </span>
                                <time dateTime={auditLog.createdAt} className="tabular-nums">
                                  {dayjs(auditLog.createdAt).format('HH:mm')}
                                </time>
                              </div>

                              <ChevronDown2 className="size-7 transition-transform group-data-[panel-open]:rotate-180" />
                            </AccordionTrigger>

                            <AccordionContent>
                              <div className="grid w-full min-w-0 gap-4 text-base">
                                <dl className="grid gap-2">
                                  <div className="grid min-w-0 grid-cols-[7rem_minmax(0,1fr)] gap-3">
                                    <dt className="text-muted font-medium">Autor</dt>
                                    <dd className="min-w-0 break-words">{actor}</dd>
                                  </div>

                                  <div className="grid min-w-0 grid-cols-[7rem_minmax(0,1fr)] gap-3">
                                    <dt className="text-muted font-medium">Em</dt>
                                    <dd className="min-w-0 break-words">
                                      {dayjs(auditLog.createdAt).format('DD/MM/YYYY [às] HH:mm:ss')}
                                    </dd>
                                  </div>

                                  {auditLog.context?.targetName &&
                                    auditLog.context.targetName !== auditLog.context.studentName &&
                                    auditLog.context.targetName !==
                                      auditLog.context.responsibleName && (
                                      <div className="grid min-w-0 grid-cols-[7rem_minmax(0,1fr)] gap-3">
                                        <dt className="text-muted font-medium">
                                          {targetLabels[auditLog.target.type] ?? 'Item'}
                                        </dt>
                                        <dd className="min-w-0 break-words">
                                          {auditLog.context.targetName}
                                        </dd>
                                      </div>
                                    )}

                                  {auditLog.context?.studentName && (
                                    <div className="grid min-w-0 grid-cols-[7rem_minmax(0,1fr)] gap-3">
                                      <dt className="text-muted font-medium">
                                        {key === 'orders' ? 'Para' : 'Aluno'}
                                      </dt>
                                      <dd className="min-w-0 break-words">
                                        {auditLog.context.studentName}
                                      </dd>
                                    </div>
                                  )}

                                  {auditLog.context?.responsibleName && (
                                    <div className="grid min-w-0 grid-cols-[7rem_minmax(0,1fr)] gap-3">
                                      <dt className="text-muted font-medium">Responsável</dt>
                                      <dd className="min-w-0 break-words">
                                        {auditLog.context.responsibleName}
                                      </dd>
                                    </div>
                                  )}

                                  {auditLog.context && auditLog.context.itemLabels.length > 0 && (
                                    <div className="grid min-w-0 grid-cols-[7rem_minmax(0,1fr)] gap-3">
                                      <dt className="text-muted font-medium">Itens</dt>
                                      <dd className="min-w-0">
                                        <ul className="list-square grid list-inside gap-1">
                                          {auditLog.context.itemLabels.map((itemLabel, index) => (
                                            <li key={`${itemLabel}-${index}`}>{itemLabel}</li>
                                          ))}
                                        </ul>
                                      </dd>
                                    </div>
                                  )}

                                  {typeof auditLog.changes?.payment === 'number' && (
                                    <div className="grid min-w-0 grid-cols-[7rem_minmax(0,1fr)] gap-3">
                                      <dt className="text-muted font-medium">Pagamento</dt>
                                      <dd className="min-w-0 break-words">
                                        {(auditLog.changes.payment / 100).toLocaleString('pt-BR', {
                                          style: 'currency',
                                          currency: 'BRL',
                                        })}
                                      </dd>
                                    </div>
                                  )}

                                  {typeof auditLog.changes?.keepChange === 'boolean' && (
                                    <div className="grid min-w-0 grid-cols-[7rem_minmax(0,1fr)] gap-3">
                                      <dt className="text-muted font-medium">Manter troco</dt>
                                      <dd className="min-w-0 break-words">
                                        {auditLog.changes.keepChange ? 'Sim' : 'Não'}
                                      </dd>
                                    </div>
                                  )}
                                </dl>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </div>
                ))}

                {!isFetching && auditLogDateGroups.length === 0 && (
                  <div className="app-row flex min-h-32 items-center justify-center text-center">
                    <span className="text-muted">Nenhum registro de auditoria encontrado.</span>
                  </div>
                )}

                {isFetching && <Loader />}
              </>
            )}
          </TabPanel>
        );
      })}
    </Tabs>
  );
};
