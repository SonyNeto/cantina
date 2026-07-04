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
            'font-text flex w-fit min-w-80 max-w-[calc(100vw-2rem)] items-center justify-center text-center gap-3 rounded border-4 px-4 py-3 shadow-lg sm:min-w-96',
          title: 'text-xl font-medium leading-tight',
          description: 'text-text/80 text-base leading-snug',
          content: 'flex min-w-0 flex-col gap-2',
          icon: 'text-text flex shrink-0 items-center [&_svg]:size-10',
          actionButton:
            'font-text bg-primary text-text border-text ml-auto inline-flex items-center justify-center rounded border-4 px-3 py-1.5 text-base font-medium whitespace-nowrap transition-all hover:bg-hover hover:text-text-hover',
          cancelButton:
            'font-text bg-primary text-text border-text inline-flex items-center justify-center rounded border-4 px-3 py-1.5 text-base font-medium whitespace-nowrap transition-all hover:bg-hover hover:text-text-hover',
          success: 'bg-primary text-text border-text',
          info: 'bg-secondary text-text border-text',
          warning: 'bg-tertiary text-text border-text',
          error: 'bg-secondary text-text border-text',
          loading: 'bg-secondary text-text border-text',
        },
      }}
    />
  );
};
