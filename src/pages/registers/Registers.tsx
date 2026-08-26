import { useState, type FC } from 'react';
import { useLocation, useNavigate } from 'react-router';
import ROUTES from '../../constants/routes';
import { User } from 'pixelarticons/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Loader } from '../../components/commons/Loader';
import { workspaceApiFetch } from '../../utils/api';
import PeriodPicker from '../../components/commons/PeriodPicker';
import { usePeriod, type Period } from '../../hooks/usePeriod';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { PageNavigator } from '../../components/commons/PageNavigator';
import { SearchBar } from '../../components/commons/SearchBar';
import { Button } from '../../components/commons/Button';
import { cn, formatSignedCurrency, fromCents } from '../../utils/functions';

type ResponsibleAccount = {
  responsibleId: string;
  responsibleName: string;
  accountBalance: number;
};

type Pagination = {
  page: number;
  totalPages: number;
  nextPage: number | null;
};

type ResponsibleAccountsResponse = {
  responsibleAccounts: ResponsibleAccount[];
  pagination: Pagination;
};

type RegistersSummary = {
  revenue: number;
};

const getResponsibleAccounts = async (
  period: Period,
  page: number,
  search: string,
): Promise<ResponsibleAccountsResponse> => {
  const formattedPeriod = `${period.year}${(period.month + 1).toString().padStart(2, '0')}`;

  const params = new URLSearchParams({
    p: formattedPeriod,
    page: String(page),
    limit: String(10),
    search,
  });

  const res = await workspaceApiFetch(`/registers/responsibles?${params}`);
  return res.json();
};

const getRegistersSummary = async (period: Period): Promise<RegistersSummary> => {
  const formattedPeriod = `${period.year}${(period.month + 1).toString().padStart(2, '0')}`;

  const res = await workspaceApiFetch(`/registers/summary?p=${formattedPeriod}`);
  return res.json();
};

export const Registers: FC = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = usePeriod();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);

  const { data: accountsData, isFetching } = useQuery({
    queryKey: ['registers', 'responsibles', workspaceId, period, currentPage, search],
    queryFn: () => getResponsibleAccounts(period, currentPage, search),
    enabled: Boolean(workspaceId),
    placeholderData: keepPreviousData,
    select: (data) => ({
      responsibleAccounts: data.responsibleAccounts,
      totalPages: data.pagination.totalPages,
    }),
  });

  const { data: revenueData } = useQuery({
    queryKey: ['registers', 'summary', workspaceId, period],
    queryFn: () => getRegistersSummary(period),
    enabled: Boolean(workspaceId),
    select: (data) => ({
      revenue: data.revenue,
    }),
  });

  const responsibleAccounts = accountsData?.responsibleAccounts ?? [];
  const totalPages = accountsData?.totalPages ?? 1;

  return (
    <div className="app-page">
      <div className="app-content">
        <div className="app-header raised grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] !border-0 [&_svg]:size-10 [&_svg]:shrink-0">
          <span aria-hidden={true} className="col-start-1" />
          <span className="col-start-2 text-center">Responsáveis</span>
          <PeriodPicker value={period} onChange={setPeriod} className="col-start-3" />
        </div>

        <SearchBar
          query={search}
          setQuery={(query) => {
            setSearch(query);
            setCurrentPage(1);
          }}
          placeholder="Encontre um responsável"
        />

        {isFetching && <Loader />}

        <div className="app-list">
          {responsibleAccounts.map((responsibleAccount) => (
            <Button
              key={responsibleAccount.responsibleId}
              variant="ghost"
              size="lg"
              disableHover
              className="app-row app-row-action !grid !h-auto !min-w-0 grid-cols-[minmax(0,1fr)_9ch] !justify-normal !px-4 !py-3 text-left !font-normal !whitespace-normal"
              onClick={() =>
                navigate({
                  pathname: ROUTES.REGISTERS.DETAIL_PATH(responsibleAccount.responsibleId),
                  search: location.search,
                })
              }
            >
              <div className="inline-flex min-w-0 items-center gap-2.5 [&_svg]:size-10 [&_svg]:shrink-0">
                <User />
                <span>{responsibleAccount.responsibleName}</span>
              </div>
              <span
                className={cn(
                  'text-right tabular-nums',
                  responsibleAccount.accountBalance < 0 && 'text-danger',
                  responsibleAccount.accountBalance > 0 && 'text-success',
                )}
              >
                {formatSignedCurrency(responsibleAccount.accountBalance)}
              </span>
            </Button>
          ))}
        </div>

        <footer className="app-footer">
          <div className="app-total-bar inline-flex justify-end text-right">
            <span>Faturamento: </span>
            {`R$ ${fromCents(revenueData?.revenue ?? 0).toFixed(2)}`}
          </div>
          <PageNavigator
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </footer>
      </div>
    </div>
  );
};
