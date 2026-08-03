import { useState, type FC } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import ROUTES from '../../constants/routes';
import { ArrowLeft, Check } from 'pixelarticons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Register } from '../../constants/canteen/types';
import { Loader } from '../../components/commons/Loader';
import { workspaceApiFetch } from '../../utils/api';
import PeriodPicker from '../../components/commons/PeriodPicker';
import { usePeriod, type Period } from '../../hooks/usePeriod';
import dayjs from 'dayjs';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { PageNavigator } from '../../components/commons/PageNavigator';
import { cn, fromCents } from '../../utils/functions';

type Pagination = {
  page: number;
  totalPages: number;
  nextPage: number | null;
};

type RegistersResponse = {
  registersByDate: Record<string, Register[]>;
  studentName: string;
  total: number;
  pagination: Pagination;
};

const getStudentRegisters = async (
  studentId: string,
  period: Period,
  page: number,
): Promise<RegistersResponse> => {
  const res = await workspaceApiFetch(
    `/students/${studentId}/registers?p=${period.year}${(period.month + 1).toString().padStart(2, '0')}&page=${page}&limit=${8}`,
  );

  return res.json();
};

export const StudentDetails: FC = () => {
  const queryClient = useQueryClient();
  const { responsibleId, studentId } = useParams();
  const [period, setPeriod] = usePeriod();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);

  const { data: registersData, isPending } = useQuery({
    queryKey: ['register', workspaceId, studentId, period, currentPage],
    queryFn: () => getStudentRegisters(studentId ?? '', period, currentPage),
    enabled: Boolean(workspaceId && studentId),
    select: (data) => ({
      studentName: data.studentName,
      registersByDate: data.registersByDate,
      total: data.total,
      totalPages: data.pagination.totalPages,
    }),
  });

  const updateRegisterPayment = useMutation({
    mutationFn: async ({ registerId, paid }: { registerId: string; paid: boolean }) => {
      const res = await workspaceApiFetch(`/registers/${registerId}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paid,
        }),
      });

      if (!res.ok) {
        throw new Error('Erro ao atualizar o pagamento do registro');
      }

      return;
    },

    onMutate: async ({ registerId, paid }) => {
      await queryClient.cancelQueries({
        queryKey: ['register', workspaceId, studentId, period, currentPage],
      });

      const previousRegisters = queryClient.getQueryData<RegistersResponse>([
        'register',
        workspaceId,
        studentId,
        period,
        currentPage,
      ]);

      queryClient.setQueryData<RegistersResponse>(
        ['register', workspaceId, studentId, period, currentPage],
        (currentData) => {
          if (!currentData) return currentData;

          const updatedRegistersByDate = Object.fromEntries(
            Object.entries(currentData.registersByDate).map(([date, registers]) => [
              date,
              registers.map((register) =>
                register.id === registerId
                  ? { ...register, payment: paid ? register.product.price : 0 }
                  : register,
              ),
            ]),
          );

          const total = Object.values(updatedRegistersByDate)
            .flat()
            .reduce((acc, register) => acc + register.product.price - register.payment, 0);

          return {
            ...currentData,
            registersByDate: updatedRegistersByDate,
            total,
          };
        },
      );

      return { previousRegisters };
    },

    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ['register', workspaceId, studentId, period, currentPage],
      });
    },

    onError: (_error, _variables, context) => {
      if (context?.previousRegisters) {
        queryClient.setQueryData(
          ['register', workspaceId, studentId, period, currentPage],
          context.previousRegisters,
        );
      }
    },
  });

  if (!studentId || !responsibleId) {
    return <div>Aluno não encontrado</div>;
  }

  const registersByDate = registersData?.registersByDate ?? {};
  const totalPages = registersData?.totalPages ?? 1;
  const total = registersData?.total ?? 0;

  return isPending ? (
    <Loader />
  ) : (
    <div className="app-page">
      <div className="app-content">
        <div className="app-header grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] [&_svg]:size-10 [&_svg]:shrink-0">
          <Link
            key="back-responsible-details"
            to={{ pathname: ROUTES.REGISTERS.DETAIL_PATH(responsibleId), search: location.search }}
            className="z-30 justify-self-start"
          >
            <ArrowLeft />
          </Link>
          <span className="justify-self-center text-center">{`Pedidos de ${registersData?.studentName}`}</span>
          <PeriodPicker value={period} onChange={setPeriod} className="col-start-3" />
        </div>

        <div className="app-list">
          {Object.entries(registersByDate).map(([date, registers]) => {
            return (
              <div key={date} className="app-group">
                <div className="app-row app-row-label text-muted px-4 text-xl">
                  {dayjs(date).format('DD/MM')}
                </div>
                {registers.map((register) => (
                  <div
                    className="app-row grid-cols-[minmax(0,1fr)_7ch_auto] gap-2.5 [&_svg]:size-10 [&_svg]:shrink-0"
                    key={register.id}
                  >
                    <div className="inline-flex min-w-0 items-center gap-2.5">
                      <span className="truncate" title={register.product.label}>
                        {register.product.label}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'text-right tabular-nums',
                        register.payment === register.product.price && 'line-through',
                      )}
                    >
                      R${fromCents(register.product.price).toFixed(2)}
                      {register.payment > 0 && register.payment < register.product.price && (
                        <>
                          <br />- R${fromCents(register.payment).toFixed(2)}
                        </>
                      )}
                    </span>
                    <div className="flex items-center justify-end gap-2.5 whitespace-nowrap">
                      <span className="relative block size-8">
                        <input
                          type="checkbox"
                          checked={register.payment === register.product.price}
                          aria-label={`Marcar ${register.product.label} como pago`}
                          className="peer absolute inset-0 z-10 size-full cursor-pointer appearance-none outline-none"
                          onChange={(event) => {
                            updateRegisterPayment.mutate({
                              registerId: register.id,
                              paid: event.currentTarget.checked,
                            });
                          }}
                        />
                        <span
                          aria-hidden="true"
                          className="bg-panel-contrast sunken peer-checked:bg-success peer-checked:text-primary peer-focus-visible:ring-accent/35 flex size-8 items-center justify-center peer-focus-visible:ring-[3px] [&_svg]:size-6 [&_svg]:opacity-0 peer-checked:[&_svg]:opacity-100"
                        >
                          <Check />
                        </span>
                      </span>
                      <span className="">Pago</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <footer className="app-footer">
          <div className="app-total-bar justify-end [&_svg]:size-10">
            <div className="flex gap-5">
              <span>Total: </span>
              <span>{`R$${fromCents(total).toFixed(2)}`}</span>
            </div>
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
