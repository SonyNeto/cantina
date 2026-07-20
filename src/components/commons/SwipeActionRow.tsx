import {
  useCallback,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FC,
  type ReactElement,
} from 'react';
import { cn } from '../../utils/functions';
import { useSwipe, type SwipeGesture } from '../../hooks/useSwipe';
import { ChevronLeft, ChevronRight } from 'pixelarticons/react';
import { Button } from './Button';

export type SwipeSide = 'left' | 'right';

type SwipeSideConfig = {
  render: ReactElement;
  handleWidth?: number;
  openWidth?: number;
  openThreshold?: number;
  className?: string;
  handleClassName?: string;
  progressStyle?: (progress: number) => CSSProperties;
  onOpenThreshold?: () => void;
  onCloseThreshold?: () => void;
};

type AlternatedSwipeSideConfig = Omit<SwipeSideConfig, 'openWidth'> & {
  openWidth?: never;
};

interface SwipeActionRowBaseProps extends Omit<ComponentPropsWithoutRef<'div'>, 'type'> {
  openSide?: SwipeSide | null;
  defaultOpenSide?: SwipeSide | null;
  onOpenSideChange?: (side: SwipeSide | null) => void;
  onTap?: () => void;
  captureInteractions?: boolean;
  delta?: number;
  swipeButtonClassName?: string;
}

type SwipeActionRowProps = SwipeActionRowBaseProps &
  (
    | {
        type?: 'drawer';
        left?: SwipeSideConfig;
        right?: SwipeSideConfig;
      }
    | {
        type: 'alternated';
        left?: AlternatedSwipeSideConfig;
        right?: AlternatedSwipeSideConfig;
      }
  );

function clampTranslate(translate: number, maxTranslate: number, minTranslate: number) {
  return Math.max(Math.min(translate, maxTranslate), minTranslate);
}

export const SwipeActionRow: FC<SwipeActionRowProps> = ({
  left,
  right,
  openSide: controlledOpenSide,
  defaultOpenSide,
  onOpenSideChange,
  onTap,
  captureInteractions = true,
  delta,
  className,
  style,
  swipeButtonClassName,
  type = 'drawer',
  ...props
}) => {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const gestureSideRef = useRef<SwipeSide | null>(null);
  const gestureStartTranslateRef = useRef<number>(0);
  const thresholdReachedRef = useRef<boolean>(false);
  const [uncontrolledOpenSide, setUncontrolledOpenSide] = useState<SwipeSide | null>(
    defaultOpenSide ?? (type === 'alternated' ? 'left' : null),
  );
  const openSide = controlledOpenSide !== undefined ? controlledOpenSide : uncontrolledOpenSide;
  const [panelWidth, setPanelWidth] = useState<number>(0);
  const [activeSide, setActiveSide] = useState<SwipeSide | null>(openSide);
  const [translate, setTranslate] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(openSide ? 1 : 0);

  const setRowRef = useCallback((row: HTMLDivElement | null) => {
    rowRef.current = row;

    if (!row) return;

    setPanelWidth(row.offsetWidth);

    const resizeObserver = new ResizeObserver(() => {
      setPanelWidth(row.offsetWidth);
    });
    resizeObserver.observe(row);

    return () => {
      resizeObserver.disconnect();
      rowRef.current = null;
    };
  }, []);

  const getSideConfig = (side: SwipeSide) => (side === 'left' ? left : right);

  const getHandleWidth = (side: SwipeSide) => getSideConfig(side)?.handleWidth ?? 16;

  const getOpenWidth = (side: SwipeSide) =>
    type === 'alternated' ? panelWidth : (getSideConfig(side)?.openWidth ?? 0);

  const getClosedTranslate = (side: SwipeSide) => Math.max(panelWidth - getHandleWidth(side), 0);

  const getOpenTranslate = (side: SwipeSide) =>
    Math.max(getClosedTranslate(side) - getOpenWidth(side), 0);

  const getGestureTranslate = (side: SwipeSide, deltaX: number) => {
    const directionalDelta = side === 'left' ? -deltaX : deltaX;
    const oppositeConfig = getSideConfig(side === 'left' ? 'right' : 'left');
    const oppositeHandleWidth = oppositeConfig ? (oppositeConfig.handleWidth ?? 16) : 0;

    return clampTranslate(
      gestureStartTranslateRef.current + directionalDelta,
      getClosedTranslate(side),
      oppositeHandleWidth,
    );
  };

  const getProgress = (side: SwipeSide, currentTranslate: number) => {
    const closedTranslate = getClosedTranslate(side);
    const travelDistance = closedTranslate - getOpenTranslate(side);

    if (travelDistance <= 0) return 0;

    return Math.min(Math.max((closedTranslate - currentTranslate) / travelDistance, 0), 1);
  };

  const getSnapThreshold = (side: SwipeSide) => {
    const config = getSideConfig(side);
    const openThreshold = Math.min(Math.max(config?.openThreshold ?? 0.5, 0), 1);
    const closedTranslate = getClosedTranslate(side);

    return closedTranslate - (closedTranslate - getOpenTranslate(side)) * openThreshold;
  };

  const setThresholdReached = (side: SwipeSide, thresholdReached: boolean) => {
    if (thresholdReachedRef.current === thresholdReached) return;

    thresholdReachedRef.current = thresholdReached;

    if (thresholdReached) {
      getSideConfig(side)?.onOpenThreshold?.();
    } else {
      getSideConfig(side)?.onCloseThreshold?.();
    }
  };

  const setPanelOpen = (side: SwipeSide, nextOpen: boolean) => {
    const nextSide = nextOpen
      ? side
      : type === 'alternated'
        ? side === 'left'
          ? 'right'
          : 'left'
        : null;

    setActiveSide(side);
    setTranslate(nextOpen ? getOpenTranslate(side) : getClosedTranslate(side));
    setProgress(nextOpen ? 1 : 0);
    setThresholdReached(side, nextOpen);

    if (nextSide === openSide) return;

    if (controlledOpenSide === undefined) {
      setUncontrolledOpenSide(nextSide);
    }

    onOpenSideChange?.(nextSide);
  };

  const handleStart = (startSide: SwipeSide | null = null) => {
    const side = openSide ?? startSide;

    gestureSideRef.current = side;
    thresholdReachedRef.current = Boolean(side && openSide === side);

    if (!side) return;

    setIsDragging(true);

    const startTranslate = openSide === side ? getOpenTranslate(side) : getClosedTranslate(side);

    gestureStartTranslateRef.current = startTranslate;
    setActiveSide(side);
    setTranslate(startTranslate);
    setProgress(openSide === side ? 1 : 0);
  };

  const handleMove = ({ deltaX }: SwipeGesture) => {
    let side = gestureSideRef.current;

    if (!side) {
      side = deltaX > 0 ? 'left' : deltaX < 0 ? 'right' : null;

      if (!side || !getSideConfig(side)) return;

      gestureSideRef.current = side;
      gestureStartTranslateRef.current = getClosedTranslate(side);

      setIsDragging(true);
      setActiveSide(side);
    }

    const currentTranslate = getGestureTranslate(side, deltaX);

    setTranslate(currentTranslate);
    setProgress(getProgress(side, currentTranslate));
    setThresholdReached(side, currentTranslate <= getSnapThreshold(side));
  };

  const handleRelease = ({ deltaX }: SwipeGesture) => {
    const side = gestureSideRef.current;

    setIsDragging(false);

    if (!side) return;

    const currentTranslate = getGestureTranslate(side, deltaX);
    setPanelOpen(side, currentTranslate <= getSnapThreshold(side));
    gestureSideRef.current = null;
  };

  const handleCancel = () => {
    const side = gestureSideRef.current;

    setIsDragging(false);

    if (!side) return;

    const isOpen = openSide === side;

    setActiveSide(side);
    setTranslate(isOpen ? getOpenTranslate(side) : getClosedTranslate(side));
    setProgress(isOpen ? 1 : 0);
    setThresholdReached(side, isOpen);
    gestureSideRef.current = null;
  };

  const rowSwipeHandlers = useSwipe({
    delta,
    onStart: () => handleStart(),
    onMove: handleMove,
    onRelease: handleRelease,
    onCancel: handleCancel,
    onTap,
  });

  const leftSwipeHandlers = useSwipe({
    delta,
    onStart: () => handleStart('left'),
    onMove: handleMove,
    onRelease: handleRelease,
    onCancel: handleCancel,
    onTap: () => setPanelOpen('left', openSide !== 'left'),
  });

  const rightSwipeHandlers = useSwipe({
    delta,
    onStart: () => handleStart('right'),
    onMove: handleMove,
    onRelease: handleRelease,
    onCancel: handleCancel,
    onTap: () => setPanelOpen('right', openSide !== 'right'),
  });

  const getPanelTranslate = (side: SwipeSide) => {
    if (activeSide === side && (openSide === side || isDragging) && translate !== null) {
      return translate;
    }

    return openSide === side ? getOpenTranslate(side) : getClosedTranslate(side);
  };

  const getPanelTransform = (side: SwipeSide) => {
    const visibleWidth = getHandleWidth(side) + (openSide === side ? getOpenWidth(side) : 0);

    if (panelWidth === 0) {
      return side === 'left'
        ? `translateX(calc(-100% + ${visibleWidth}px))`
        : `translateX(calc(100% - ${visibleWidth}px))`;
    }

    const currentTranslate = getPanelTranslate(side);

    return `translateX(${side === 'left' ? -currentTranslate : currentTranslate}px)`;
  };

  const getContentPanelTransform = (side: SwipeSide) => {
    const visibleWidth = openSide === side ? getOpenWidth(side) : 0;

    if (panelWidth === 0) {
      return side === 'left'
        ? `translateX(calc(-100% + ${visibleWidth}px))`
        : `translateX(calc(100% - ${visibleWidth}px))`;
    }

    const currentTranslate = Math.min(getPanelTranslate(side) + getHandleWidth(side), panelWidth);

    return `translateX(${side === 'left' ? -currentTranslate : currentTranslate}px)`;
  };

  const getPanelProgress = (side: SwipeSide) => {
    if (openSide !== side && !isDragging) return 0;

    return activeSide === side ? progress : openSide === side ? 1 : 0;
  };

  const getAlternatedTransform = () => {
    if (isDragging && activeSide && translate !== null) {
      const panelTranslate = activeSide === 'left' ? -translate : -panelWidth + translate;

      return `translateX(${panelTranslate}px)`;
    }

    return `translateX(${openSide === 'right' ? -panelWidth : 0}px)`;
  };

  return (
    <div
      ref={setRowRef}
      className={cn(
        'pointer-events-none inset-0 z-40 h-full w-full overflow-hidden',
        type === 'drawer' ? 'absolute' : 'relative flex',
        className,
      )}
      style={style}
      {...props}
    >
      {captureInteractions && (
        <button
          {...rowSwipeHandlers}
          type="button"
          tabIndex={-1}
          className={cn(
            'pointer-events-auto absolute inset-0 h-full w-full cursor-pointer touch-pan-y bg-transparent',
            type === 'drawer' ? 'z-0' : 'z-15',
            swipeButtonClassName,
          )}
        />
      )}

      {(['left', 'right'] as const).map((side) => {
        const sideConfig = getSideConfig(side);

        if (!sideConfig) return null;

        return (
          <div
            key={side}
            className={cn(
              'bg-panel-contrast sunken pointer-events-auto z-10 flex h-full w-full',
              type === 'drawer'
                ? ['absolute inset-y-0', side === 'left' ? 'left-0' : 'right-0']
                : 'relative shrink-0',
              side === 'left' && 'flex-row-reverse',
              !isDragging && 'transition-transform duration-200',
              sideConfig.className,
            )}
            style={{
              ...sideConfig.progressStyle?.(getPanelProgress(side)),
              transform:
                type === 'alternated' ? getAlternatedTransform() : getContentPanelTransform(side),
            }}
          >
            <div
              className={cn(
                'flex h-full items-center justify-center gap-2',
                type === 'alternated' && 'w-full shrink-0',
              )}
              style={
                type === 'drawer' ? { width: `${getOpenWidth(side)}px` } : undefined
              }
              inert={openSide !== side}
              aria-hidden={openSide !== side}
            >
              {sideConfig.render}
            </div>
          </div>
        );
      })}

      {(['left', 'right'] as const).map((side) => {
        const sideConfig = getSideConfig(side);

        if (!sideConfig) return null;

        const swipeHandlers = side === 'left' ? leftSwipeHandlers : rightSwipeHandlers;

        return (
          <div
            key={`${side}-handle`}
            className={cn(
              'pointer-events-none absolute inset-y-0 z-20 h-full w-full',
              type === 'alternated' && (side === 'left' ? 'left-0' : 'left-full'),
              !isDragging && 'transition-transform duration-200',
            )}
            style={{
              transform: type === 'alternated' ? getAlternatedTransform() : getPanelTransform(side),
            }}
          >
            <div
              className={cn(
                'absolute shrink-0',
                type === 'drawer'
                  ? ['inset-y-0 h-full', side === 'left' ? 'right-0' : 'left-0']
                  : ['top-2 size-12', side === 'left' ? 'right-6' : 'left-6'],
              )}
              style={type === 'drawer' ? { width: `${getHandleWidth(side)}px` } : undefined}
            >
              {type === 'alternated' ? (
                <Button {...swipeHandlers} variant="ghost" size="lg" className="pointer-events-auto touch-pan-y !size-full !hover:text-info">
                  {side === 'left' ? <ChevronRight /> : <ChevronLeft />}
                </Button>
              ) : (
                <button
                  {...swipeHandlers}
                  type="button"
                  className={cn(
                    'bg-border border-info/50 pointer-events-auto h-full w-full cursor-pointer touch-pan-y border-4',
                    side === 'left' ? 'sunken' : 'raised',
                    sideConfig.handleClassName,
                  )}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
