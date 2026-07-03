import { useState, type ComponentPropsWithoutRef, type FC } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';
import { ArrowLeft, ArrowRight, Calendar2 } from 'pixelarticons/react';
import { MONTHS } from '../../constants/dates';
import { Button } from './Button';
import { cn } from '../../utils/functions';
import type { Period } from '../../hooks/usePeriod';

type PeriodPickerProps = Omit<
  ComponentPropsWithoutRef<typeof PopoverTrigger>,
  'value' | 'onChange' | 'children'
> & {
  value: Period;
  onChange?: (period: Period) => void;
  minYear?: number;
  maxYear?: number;
};

const PeriodPicker: FC<PeriodPickerProps> = ({
  className,
  value,
  onChange,
  minYear = 2000,
  maxYear = 2099,
}) => {
  const [open, setOpen] = useState(false);
  const [displayYear, setDisplayYear] = useState(value?.year || new Date().getFullYear());

  const handleMonthSelect = (monthIndex: number) => {
    onChange?.({ month: monthIndex, year: displayYear });
    setOpen(false);
  };

  const handlePreviousYear = () => {
    if (displayYear > minYear) {
      setDisplayYear(displayYear - 1);
    }
  };

  const handleNextYear = () => {
    if (displayYear < maxYear) {
      setDisplayYear(displayYear + 1);
    }
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={className}>
        <Calendar2 />
      </PopoverTrigger>
      <PopoverContent className="bg-primary border-text w-48 border-4 text-xl">
        <div className="bg-secondary border-text/40 grid grid-cols-[1fr_2fr_1fr] items-center gap-2 border-b-4 p-2">
          <Button
            className="justify-self-start"
            variant="ghost"
            onClick={handlePreviousYear}
            disabled={displayYear <= minYear}
          >
            <ArrowLeft />
          </Button>
          <span className="justify-self-center">{displayYear}</span>
          <Button
            className="justify-self-end"
            variant="ghost"
            onClick={handleNextYear}
            disabled={displayYear >= maxYear}
          >
            <ArrowRight />
          </Button>
        </div>
        <div className="grid grid-cols-3 items-center gap-2">
          {MONTHS.map((month, index) => {
            const isSelected = value?.month === index && value?.year === displayYear;
            const isCurrentMonth =
              new Date().getMonth() === index && new Date().getFullYear() === displayYear;

            return (
              <Button
                key={month}
                variant="ghost"
                size="md"
                className={cn(
                  'p-2',
                  isSelected && 'border-text/40 bg-secondary border-4',
                  !isSelected && isCurrentMonth && 'text-red',
                )}
                onClick={() => handleMonthSelect(index)}
              >
                {month}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PeriodPicker;
