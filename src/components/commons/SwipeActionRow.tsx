import type { ComponentPropsWithoutRef, FC, ReactNode } from 'react';
import { useSwipeable } from 'react-swipeable';
import { cn } from '../../utils/functions';

interface SwipeActionRowProps extends ComponentPropsWithoutRef<'div'> {
  swipeDirection?: 'right' | 'left';
  children: ReactNode;
  open?: boolean,
  onOpenChange?: (open: boolean) => void;
}

export const SwipeActionRow: FC<SwipeActionRowProps> = ({
  swipeDirection = 'left',
  className,
  open = false,
  onOpenChange,
  children,
}) => {
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      onOpenChange?.(swipeDirection === 'left');
    },
    onSwipedRight: () => {
      onOpenChange?.(swipeDirection === 'right');
    },
    delta: 25,
    trackTouch: true,
    trackMouse: true,
    preventScrollOnSwipe: false,
  });

  return (
    <div 
      className={cn(
        'absolute inset-y-0 right-0 z-40 flex h-full',
        'transition-transform duration-200',
        open
          ? 'translate-x-0 ease-in'
          : 'translate-x-[calc(100%-1rem)] ease-out',
      )}
    >
      <button
        {...swipeHandlers}
        type="button"
        className="bg-border h-full w-4 shrink-0 touch-pan-y cursor-pointer"
        onClick={() => onOpenChange?.(!open)}
      />
      <div
        className={cn('bg-panel-contrast flex h-full w-34 items-center justify-center gap-2', className)}
        inert={!open}
        aria-hidden={!open}
      >
        {children}
      </div>
    </div>
  );
};
