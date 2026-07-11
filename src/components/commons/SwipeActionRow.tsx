import {
  useCallback,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type FC,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/functions';
import { useSwipe, type SwipeDirection, type SwipeGesture } from '../../hooks/useSwipe';

interface SwipeActionRowProps extends ComponentPropsWithoutRef<'div'> {
  swipeDirection?: SwipeDirection;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onTap?: () => void;
  captureInteractions?: boolean;
  handleWidth?: number;
  openWidth?: number;
}

function clampTranslate(translate: number, maxTranslate: number) {
  return Math.max(Math.min(translate, maxTranslate), 0);
}

export const SwipeActionRow: FC<SwipeActionRowProps> = ({
  swipeDirection = 'left',
  className,
  open = false,
  onOpenChange,
  onTap,
  captureInteractions = true,
  children,
  handleWidth = 16,
  openWidth = 0,
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const gestureStartTranslateRef = useRef<number>(0);
  const [panelWidth, setPanelWidth] = useState<number>(0);
  const [translate, setTranslate] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const closedTranslate = Math.max(panelWidth - handleWidth, 0);
  const openTranslate = Math.max(closedTranslate - openWidth, 0);

  const setPanelRef = useCallback(
    (panel: HTMLDivElement | null) => {
      panelRef.current = panel;

      if (!panel) return;

      const nextPanelWidth = panel.offsetWidth;
      const nextClosedTranslate = Math.max(nextPanelWidth - handleWidth, 0);

      setPanelWidth(nextPanelWidth);
      setTranslate(nextClosedTranslate);
      gestureStartTranslateRef.current = nextClosedTranslate;
    },
    [handleWidth],
  );

  const getMaxTranslate = () => Math.max((panelRef.current?.offsetWidth ?? 0) - handleWidth, 0);

  const getDirectionalDelta = (deltaX: number) => (swipeDirection === 'left' ? deltaX : -deltaX);

  const getGestureTranslate = (deltaX: number) =>
    clampTranslate(
      gestureStartTranslateRef.current + getDirectionalDelta(deltaX),
      getMaxTranslate(),
    );

  const setPanelOpen = (nextOpen: boolean) => {
    setTranslate(nextOpen ? openTranslate : getMaxTranslate());

    if (nextOpen === open) return;

    onOpenChange?.(nextOpen);
  };

  const snapPanel = (currentTranslate: number) => {
    const snapThreshold = openTranslate + (getMaxTranslate() - openTranslate) / 2;

    setPanelOpen(currentTranslate <= snapThreshold);
  };

  const sharedSwipeHandlers = {
    delta: 25,
    onStart: () => {
      gestureStartTranslateRef.current = translate || 0;
      setIsDragging(true);
    },
    onMove: ({ deltaX }: SwipeGesture) => {
      setTranslate(getGestureTranslate(deltaX));
    },
    onRelease: ({ deltaX }: SwipeGesture) => {
      setIsDragging(false);
      snapPanel(getGestureTranslate(deltaX));
    },
    onCancel: () => {
      setIsDragging(false);
    },
  };

  const rowSwipeHandlers = useSwipe({
    ...sharedSwipeHandlers,
    onTap: () => {
      onTap?.();

      if (open) setTranslate(openTranslate);
    },
  });

  const swipeHandlers = useSwipe({
    ...sharedSwipeHandlers,
    onTap: () => {
      setPanelOpen(!open);
    },
  });

  const transform =
    translate !== null
      ? `translateX(${!open && !isDragging ? closedTranslate : translate}px)`
      : `translateX(${open ? `calc(100% - ${handleWidth + openWidth}px)` : `calc(100% - ${handleWidth}px)`})`;

  return (
    <div className="pointer-events-none absolute inset-0 z-40 h-full w-full overflow-hidden">
      {captureInteractions && (
        <button
          {...rowSwipeHandlers}
          type="button"
          tabIndex={-1}
          className="pointer-events-auto absolute inset-0 z-0 h-full w-[calc(100%-1rem)] cursor-pointer touch-pan-y bg-transparent"
        />
      )}
      <div
        ref={setPanelRef}
        className={cn(
          'bg-panel-contrast pointer-events-auto absolute inset-y-0 right-0 z-10 flex h-full w-full',
          !isDragging && 'transition-transform duration-200',
        )}
        style={{
          transform: transform,
        }}
      >
        <button
          {...swipeHandlers}
          type="button"
          className={cn(`bg-border h-full shrink-0 cursor-pointer touch-pan-y`)}
          style={{ width: `${handleWidth}px` }}
        />
        <div
          className={cn(
            `bg-panel-contrast flex h-full items-center justify-center gap-2`,
            className,
          )}
          style={{ width: `${openWidth}px` }}
          inert={!open}
          aria-hidden={!open}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
