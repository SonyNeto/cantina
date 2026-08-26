import { useState, type FC } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { ArrowLeft, Banknote, Check, User } from 'pixelarticons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import ROUTES from '../../constants/routes';
import type { Register } from '../../constants/canteen/types';
import { Loader } from '../../components/commons/Loader';
import { Button } from '../../components/commons/Button';
import { workspaceApiFetch } from '../../utils/api';
import { usePeriod, type Period } from '../../hooks/usePeriod';
import PeriodPicker from '../../components/commons/PeriodPicker';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { cn, formatSignedCurrency, fromCents, toCents } from '../../utils/functions';

type Responsible = {
  id: string;
  name: string;
  accountBalance: number;
};

type ResponsibleRegister = Omit<Register, 'created_at'> & {
  created_at: string;
  student: {
    id: string;
    name: string;
  };
};

type ResponsibleRegistersResponse = {
  responsible: Responsible;
  registers: ResponsibleRegister[];
  consumption: number;
};

type ResponsiblePayment = {
  id: string;
  created_at: string;
  payment: number;
  responsibleId: string;
  type: 'manual' | 'order';
};

type ResponsiblePaymentsResponse = {
  payments: ResponsiblePayment[];
};

type ResponsibleEntry =
  | (ResponsibleRegister & { entryType: 'register' })
  | (ResponsiblePayment & { entryType: 'payment' });

type ResponsibleResponse = {
  responsible: Responsible;
};

function parseCurrencyInput(value: string) {
  const parsedValue = Number(value.replace(',', '.'));

  return Number.isFinite(parsedValue) ? Math.max(toCents(parsedValue), 0) : 0;
}

const getResponsibleRegisters = async (
  responsibleId: string,
  period: Period,
): Promise<ResponsibleRegistersResponse> => {
  const formattedPeriod = `${period.year}${(period.month + 1).toString().padStart(2, '0')}`;
  const res = await workspaceApiFetch(
    `/responsibles/${responsibleId}/registers?p=${formattedPeriod}`,
  );

  return res.json();
};

const getResponsiblePayments = async (
  responsibleId: string,
  period: Period,
): Promise<ResponsiblePaymentsResponse> => {
  const formattedPeriod = `${period.year}${(period.month + 1).toString().padStart(2, '0')}`;
  const res = await workspaceApiFetch(
    `/responsibles/${responsibleId}/payments?p=${formattedPeriod}`,
  );

  return res.json();
};

export const ResponsibleDetails: FC = () => {
  const queryClient = useQueryClient();
  const [period, setPeriod] = usePeriod();
  const [isAddingBalance, setIsAddingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState('');
  const location = useLocation();
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
  const { responsibleId } = useParams();

  const { data: registersData, isPending } = useQuery({
    queryKey: ['registers', workspaceId, responsibleId, period],
    queryFn: () => getResponsibleRegisters(responsibleId ?? '', period),
    enabled: Boolean(workspaceId && responsibleId),
  });

  const { data: paymentsData, isPending: isPaymentsPending } = useQuery({
    queryKey: ['payments', workspaceId, responsibleId, period],
    queryFn: () => getResponsiblePayments(responsibleId ?? '', period),
    enabled: Boolean(workspaceId && responsibleId),
  });

  const addBalance = useMutation({
    mutationFn: async (amount: number): Promise<ResponsibleResponse> => {
      const res = await workspaceApiFetch(`/responsibles/${responsibleId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment: amount }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? 'Não foi possível adicionar o pagamento');
      }

      return data;
    },
    onSuccess: async () => {
      setBalanceInput('');
      setIsAddingBalance(false);
      toast.success('Pagamento adicionado com sucesso!');

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['registers', workspaceId, responsibleId] }),
        queryClient.invalidateQueries({
          queryKey: ['registers', 'responsibles', workspaceId],
        }),
        queryClient.invalidateQueries({ queryKey: ['payments', workspaceId, responsibleId] }),
      ]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!responsibleId) {
    return <div>Responsável não encontrado</div>;
  }

  const entries = [
    ...(registersData?.registers ?? []).map(
      (register): ResponsibleEntry => ({ ...register, entryType: 'register' }),
    ),
    ...(paymentsData?.payments ?? []).map(
      (payment): ResponsibleEntry => ({ ...payment, entryType: 'payment' }),
    ),
  ].sort((firstEntry, secondEntry) => {
    return new Date(secondEntry.created_at).getTime() - new Date(firstEntry.created_at).getTime();
  });

  const entriesByDate = entries.reduce<Record<string, ResponsibleEntry[]>>((acc, entry) => {
    const date = dayjs(entry.created_at).toISOString().slice(0, 10);

    acc[date] ??= [];
    acc[date].push(entry);

    return acc;
  }, {});

  return isPending || isPaymentsPending ? (
    <Loader />
  ) : (
    <div className="app-page">
      <div className="app-content">
        <div className="app-header grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] [&_svg]:size-10 [&_svg]:shrink-0">
          <Link
            key="back-registers"
            to={{ pathname: ROUTES.REGISTERS.ROOT, search: location.search }}
            className="z-30 justify-self-start"
          >
            <ArrowLeft />
          </Link>
          <span className="justify-self-center text-center">
            {`Registros de ${registersData?.responsible.name ?? ''}`}
          </span>
          <PeriodPicker value={period} onChange={setPeriod} className="col-start-3" />
        </div>

        <div className="app-list">
          {Object.entries(entriesByDate).map(([date, entries]) => (
            <div key={date} className="app-group">
              <div className="app-row app-row-label text-muted px-4 text-xl">
                {dayjs(date).format('DD/MM')}
              </div>
              {entries.map((entry) =>
                entry.entryType === 'register' ? (
                  <div
                    key={`register-${entry.id}`}
                    className="app-row grid-cols-[minmax(0,1fr)_9ch]"
                  >
                    <div className="inline-flex min-w-0 items-center gap-2.5 [&_svg]:size-10 [&_svg]:shrink-0">
                      <User />
                      <div className="flex min-w-0 flex-col">
                        <span className="min-w-0 whitespace-normal">{entry.product.label}</span>
                        <span className="text-muted min-w-0 text-base whitespace-normal">
                          {entry.student.name}
                        </span>
                      </div>
                    </div>
                    <span className="text-danger self-center text-right tabular-nums">
                      -R${fromCents(entry.product.price).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <div
                    key={`payment-${entry.id}`}
                    className="app-row grid-cols-[minmax(0,1fr)_8ch]"
                  >
                    <div className="inline-flex min-w-0 items-center gap-2.5 [&_svg]:size-10 [&_svg]:shrink-0">
                      <Banknote />
                      <div className="flex min-w-0 flex-col">
                        <span>Pagamento</span>
                        <span className="text-muted min-w-0 text-base whitespace-normal">
                          {entry.type === 'order' ? 'Pagamento do pedido' : 'Pagamento adicionado'}
                        </span>
                      </div>
                    </div>
                    <span className="text-success self-center text-right tabular-nums">
                      +R${fromCents(entry.payment).toFixed(2)}
                    </span>
                  </div>
                ),
              )}
            </div>
          ))}
        </div>

        <footer className="app-footer">
          <form
            className="app-total-bar [&_svg]:size-10 [&_svg]:shrink-0"
            onSubmit={(event) => {
              event.preventDefault();

              const amount = parseCurrencyInput(balanceInput);

              if (amount <= 0) {
                toast.error('Informe um valor maior que zero');
                return;
              }

              addBalance.mutate(amount);
            }}
          >
            <div className="ml-auto grid w-full max-w-sm grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-2">
              <Button
                variant="primary"
                size="lg"
                className="border-success/60 bg-success text-primary hover:bg-success/85 !size-12 !p-0"
                aria-label={
                  isAddingBalance ? 'Cancelar adição de pagamento' : 'Adicionar pagamento'
                }
                aria-pressed={isAddingBalance}
                title="Adicionar pagamento"
                onClick={() => {
                  const nextIsAddingPayment = !isAddingBalance;

                  setIsAddingBalance(nextIsAddingPayment);
                  setBalanceInput(
                    nextIsAddingPayment
                      ? fromCents(registersData?.consumption ?? 0).toFixed(2)
                      : '',
                  );
                }}
              >
                <Banknote />
              </Button>

              <div className="col-span-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-2">
                {isAddingBalance && (
                  <>
                    <label htmlFor="responsible-balance" className="text-right">
                      Adicionar pagamento:
                    </label>
                    <div className="inline-flex min-w-0 items-center justify-end gap-1">
                      <span>R$</span>
                      <input
                        id="responsible-balance"
                        type="text"
                        inputMode="decimal"
                        autoFocus
                        value={balanceInput}
                        placeholder="0,00"
                        aria-label="Valor do saldo"
                        className="app-input w-full max-w-[7ch] text-end tabular-nums"
                        onChange={(event) => setBalanceInput(event.currentTarget.value)}
                        onBlur={() => {
                          const amount = parseCurrencyInput(balanceInput);
                          setBalanceInput(amount > 0 ? fromCents(amount).toFixed(2) : '');
                        }}
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        aria-label="Confirmar saldo"
                        disabled={addBalance.isPending}
                      >
                        <Check />
                      </Button>
                    </div>
                    <div className="border-border/45 col-span-2 border-b-4" />
                  </>
                )}

                <span className="text-right">Saldo: </span>
                <span className="text-success text-right tabular-nums">
                  {`R$${fromCents(
                    Math.max(registersData?.responsible.accountBalance ?? 0, 0),
                  ).toFixed(2)}`}
                </span>
                <span className="text-right">Consumo: </span>
                <span className="text-danger text-right tabular-nums">
                  {`-R$${fromCents(registersData?.consumption ?? 0).toFixed(2)}`}
                </span>
                <div className="border-border/45 col-span-2 border-b-4" />
                <span className="text-right">Total: </span>
                <span
                  className={cn(
                    'text-right tabular-nums',
                    (registersData?.responsible.accountBalance ?? 0) < 0 && 'text-danger',
                    (registersData?.responsible.accountBalance ?? 0) > 0 && 'text-success',
                  )}
                >
                  {formatSignedCurrency(registersData?.responsible.accountBalance ?? 0)}
                </span>
              </div>
            </div>
          </form>
        </footer>
      </div>
    </div>
  );
};
