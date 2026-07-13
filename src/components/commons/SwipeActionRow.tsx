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

interface SwipeActionRowProps extends ComponentPropsWithoutRef<'div'> {
  left?: SwipeSideConfig;
  right?: SwipeSideConfig;
  openSide?: SwipeSide | null;
  onOpenSideChange?: (side: SwipeSide | null) => void;
  onTap?: () => void;
  captureInteractions?: boolean;
  delta?: number;
}

function clampTranslate(translate: number, maxTranslate: number) {
  return Math.max(Math.min(translate, maxTranslate), 0);
}

export const SwipeActionRow: FC<SwipeActionRowProps> = ({
  left,
  right,
  openSide = null,
  onOpenSideChange,
  onTap,
  captureInteractions = true,
  delta,
  className,
  style,
  ...props
}) => {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const gestureSideRef = useRef<SwipeSide | null>(null);
  const gestureStartTranslateRef = useRef<number>(0);
  const thresholdReachedRef = useRef<boolean>(false);
  const [panelWidth, setPanelWidth] = useState<number>(0);
  const [activeSide, setActiveSide] = useState<SwipeSide | null>(openSide);
  const [translate, setTranslate] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(openSide ? 1 : 0);

  const setRowRef = useCallback((row: HTMLDivElement | null) => {
    rowRef.current = row;

    if (!row) return;

    setPanelWidth(row.offsetWidth);
  }, []);

  const getSideConfig = (side: SwipeSide) => (side === 'left' ? left : right);

  const getHandleWidth = (side: SwipeSide) => getSideConfig(side)?.handleWidth ?? 16;

  const getOpenWidth = (side: SwipeSide) => getSideConfig(side)?.openWidth ?? 0;

  const getClosedTranslate = (side: SwipeSide) => Math.max(panelWidth - getHandleWidth(side), 0);

  const getOpenTranslate = (side: SwipeSide) =>
    Math.max(getClosedTranslate(side) - getOpenWidth(side), 0);

  const getGestureTranslate = (side: SwipeSide, deltaX: number) => {
    const directionalDelta = side === 'left' ? -deltaX : deltaX;

    return clampTranslate(
      gestureStartTranslateRef.current + directionalDelta,
      getClosedTranslate(side),
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
    const nextSide = nextOpen ? side : null;

    setActiveSide(side);
    setTranslate(nextOpen ? getOpenTranslate(side) : getClosedTranslate(side));
    setProgress(nextOpen ? 1 : 0);
    setThresholdReached(side, nextOpen);

    if (nextSide === openSide) return;

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

  const getPanelProgress = (side: SwipeSide) => {
    if (openSide !== side && !isDragging) return 0;

    return activeSide === side ? progress : openSide === side ? 1 : 0;
  };

  return (
    <div
      ref={setRowRef}
      className={cn(
        'pointer-events-none absolute inset-0 z-40 h-full w-full overflow-hidden',
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
          className="pointer-events-auto absolute inset-0 z-0 h-full w-full cursor-pointer touch-pan-y bg-transparent"
        />
      )}

      {left && (
        <div
          className={cn(
            'bg-panel-contrast pointer-events-auto absolute inset-y-0 left-0 z-10 flex h-full w-full flex-row-reverse',
            !isDragging && 'transition-transform duration-200',
            left.className,
          )}
          style={{
            ...left.progressStyle?.(getPanelProgress('left')),
            transform: getPanelTransform('left'),
          }}
        >
          <button
            {...leftSwipeHandlers}
            type="button"
            className={cn(
              'bg-border h-full shrink-0 cursor-pointer touch-pan-y',
              left.handleClassName,
            )}
            style={{ width: `${getHandleWidth('left')}px` }}
          />
          <div
            className="flex h-full items-center justify-center gap-2"
            style={{ width: `${getOpenWidth('left')}px` }}
            inert={openSide !== 'left'}
            aria-hidden={openSide !== 'left'}
          >
            {left.render}
          </div>
        </div>
      )}

      {right && (
        <div
          className={cn(
            'bg-panel-contrast pointer-events-auto absolute inset-y-0 right-0 z-10 flex h-full w-full',
            !isDragging && 'transition-transform duration-200',
            right.className,
          )}
          style={{
            ...right.progressStyle?.(getPanelProgress('right')),
            transform: getPanelTransform('right'),
          }}
        >
          <button
            {...rightSwipeHandlers}
            type="button"
            className={cn(
              'bg-border h-full shrink-0 cursor-pointer touch-pan-y',
              right.handleClassName,
            )}
            style={{ width: `${getHandleWidth('right')}px` }}
          />
          <div
            className="flex h-full items-center justify-center gap-2"
            style={{ width: `${getOpenWidth('right')}px` }}
            inert={openSide !== 'right'}
            aria-hidden={openSide !== 'right'}
          >
            {right.render}
          </div>
        </div>
      )}
    </div>
  );
};
