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
import { cn, formatSignedCurrency, fromCents } from '../../utils/functions';

type ResponsibleRegister = {
  responsibleId: string;
  responsibleName: string;
  consumption: number;
  total: number;
};

type Pagination = {
  page: number;
  totalPages: number;
  nextPage: number | null;
};

type ResponsiblesRegistersResponse = {
  responsiblesTotals: ResponsibleRegister[];
  pagination: Pagination;
};

type RegistersSummary = {
  revenue: number;
};

const getResponsiblesRegisters = async (
  period: Period,
  page: number,
  search: string,
): Promise<ResponsiblesRegistersResponse> => {
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

  const { data: registersData, isFetching } = useQuery({
    queryKey: ['registers', 'responsibles', workspaceId, period, currentPage, search],
    queryFn: () => getResponsiblesRegisters(period, currentPage, search),
    enabled: Boolean(workspaceId),
    placeholderData: keepPreviousData,
    select: (data) => ({
      responsiblesTotals: data.responsiblesTotals,
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

  const responsiblesTotals = registersData?.responsiblesTotals ?? [];
  const totalPages = registersData?.totalPages ?? 1;

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
          {responsiblesTotals.map((responsibleTotal) => (
            <button
              type="button"
              key={responsibleTotal.responsibleId}
              className="app-row app-row-action grid-cols-[minmax(0,1fr)_9ch] text-left"
              onClick={() =>
                navigate({
                  pathname: ROUTES.REGISTERS.DETAIL_PATH(responsibleTotal.responsibleId),
                  search: location.search,
                })
              }
            >
              <div className="inline-flex min-w-0 items-center gap-2.5 [&_svg]:size-10 [&_svg]:shrink-0">
                <User />
                <span>{responsibleTotal.responsibleName}</span>
              </div>
              <span
                className={cn(
                  'text-right tabular-nums',
                  responsibleTotal.total < 0 && 'text-danger',
                  responsibleTotal.total > 0 && 'text-success',
                )}
              >
                {formatSignedCurrency(responsibleTotal.total)}
              </span>
            </button>
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
