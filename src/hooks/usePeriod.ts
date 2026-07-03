import dayjs from 'dayjs';
import { useState } from 'react';
import { useSearchParams } from 'react-router';

export interface Period {
  month: number;
  year: number;
}

type UsePeriodReturn = [Period, (period: Period) => void];

export function usePeriod(): UsePeriodReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialPeriod: Period = searchParams.get('p')
    ? {
        month: dayjs(searchParams.get('p'), 'YYYYMM').month(),
        year: dayjs(searchParams.get('p'), 'YYYYMM').year(),
      }
    : {
        month: dayjs().month(),
        year: dayjs().year(),
      };

  const [period, setPeriod] = useState<Period>(initialPeriod);

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    setSearchParams({
      p: dayjs().month(newPeriod.month).year(newPeriod.year).format('YYYYMM'),
    });
  };

  return [period, handlePeriodChange];
}
