import type { FC } from 'react';
import { Cancel, Check, InfoBox, Loader, WarningDiamond } from 'pixelarticons/react';
import { Toaster } from 'sonner';

const toastIconClassName = 'size-7 shrink-0';

export const Toast: FC = () => {
  return (
    <Toaster
      position="bottom-center"
      gap={12}
      duration={3500}
      icons={{
        success: <Check className={toastIconClassName} />,
        info: <InfoBox className={toastIconClassName} />,
        warning: <WarningDiamond className={toastIconClassName} />,
        error: <Cancel className={toastIconClassName} />,
        loading: <Loader className={`${toastIconClassName} animate-spin`} />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'font-text flex w-fit min-w-80 max-w-[calc(100vw-2rem)] items-center justify-center gap-3 rounded-none border-4 px-4 py-3 text-center shadow-[6px_6px_0_var(--color-shadow)] sm:min-w-96',
          title: 'text-xl font-medium leading-tight',
          description: 'text-text/80 text-base leading-snug',
          content: 'flex min-w-0 flex-col gap-2',
          icon: 'text-text flex shrink-0 items-center [&_svg]:size-10',
          actionButton:
            'font-text border-border/60 bg-accent text-primary ml-auto inline-flex items-center justify-center rounded-none border-4 px-3 py-1.5 text-base font-medium whitespace-nowrap  hover:bg-accent-hover',
          cancelButton:
            'font-text border-border/60 bg-panel text-text inline-flex items-center justify-center rounded-none border-4 px-3 py-1.5 text-base font-medium whitespace-nowrap  hover:bg-info-soft hover:text-info',
          success: 'bg-success-soft text-success border-success',
          info: 'bg-info-soft text-info border-info',
          warning: 'bg-warning-soft text-text border-warning',
          error: 'bg-danger-soft text-danger border-danger',
          loading: 'bg-panel-header text-text border-border',
        },
      }}
    />
  );
};
