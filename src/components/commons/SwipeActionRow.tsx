import {
  Fragment,
  useCallback,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FC,
  type ReactNode,
} from 'react';
import { ChevronLeft, ChevronRight } from 'pixelarticons/react';
import { useSwipe, type SwipeGesture } from '../../hooks/useSwipe';
import { cn } from '../../utils/functions';
import { Button } from './Button';

export type SwipeSide = 'left' | 'right';

export type SwipeAction = {
  content: ReactNode;
  threshold?: number;
  handleWidth?: number;
  panelClassName?: string;
  handleClassName?: string;
  progressStyle?: (progress: number) => CSSProperties;
  onThresholdChange?: (reached: boolean) => void;
};

export type SwipeDrawerAction = SwipeAction & {
  width?: number;
};

export type SwipeAlternatedAction = SwipeAction & {
  width?: never;
};

interface SwipeActionRowBaseProps extends Omit<ComponentPropsWithoutRef<'div'>, 'type'> {
  openSide?: SwipeSide | null;
  defaultOpenSide?: SwipeSide | null;
  onOpenSideChange?: (side: SwipeSide | null) => void;
  onTap?: () => void;
  captureInteractions?: boolean;
  swipeDelta?: number;
  interactionClassName?: string;
}

export type SwipeActionRowProps = SwipeActionRowBaseProps &
  (
    | {
        type?: 'drawer';
        left?: SwipeDrawerAction;
        right?: SwipeDrawerAction;
      }
    | {
        type: 'alternated';
        left: SwipeAlternatedAction;
        right: SwipeAlternatedAction;
      }
  );

type InteractionState = {
  side: SwipeSide | null;
  translate: number | null;
  dragging: boolean;
};

type GesturePhase = 'start' | 'move' | 'release' | 'cancel';

const SWIPE_SIDES = ['left', 'right'] as const;

export const SwipeActionRow: FC<SwipeActionRowProps> = ({
  left,
  right,
  openSide: controlledOpenSide,
  defaultOpenSide,
  onOpenSideChange,
  onTap,
  captureInteractions = true,
  swipeDelta,
  interactionClassName,
  className,
  style,
  type = 'drawer',
  ...props
}) => {
  const gestureRef = useRef<{
    side: SwipeSide | null;
    startTranslate: number;
    thresholdReached: boolean;
  }>({
    side: null,
    startTranslate: 0,
    thresholdReached: false,
  });
  const [uncontrolledOpenSide, setUncontrolledOpenSide] = useState<SwipeSide | null>(
    defaultOpenSide ?? (type === 'alternated' ? 'left' : null),
  );
  const openSide = controlledOpenSide !== undefined ? controlledOpenSide : uncontrolledOpenSide;
  const [panelWidth, setPanelWidth] = useState(0);
  const [interaction, setInteraction] = useState<InteractionState>({
    side: openSide,
    translate: null,
    dragging: false,
  });

  const observeRow = useCallback((row: HTMLDivElement | null) => {
    if (!row) return;

    const updateWidth = () => setPanelWidth(row.offsetWidth);
    const resizeObserver = new ResizeObserver(updateWidth);

    updateWidth();
    resizeObserver.observe(row);

    return () => resizeObserver.disconnect();
  }, []);

  const getSideState = (side: SwipeSide, gesture?: { deltaX: number; startTranslate: number }) => {
    const config = side === 'left' ? left : right;
    const oppositeConfig = side === 'left' ? right : left;
    const handleWidth = config?.handleWidth ?? 16;
    const openWidth = type === 'alternated' ? panelWidth : (config?.width ?? 0);
    const closedTranslate = Math.max(panelWidth - handleWidth, 0);
    const openTranslate = Math.max(closedTranslate - openWidth, 0);
    const isOpen = openSide === side;
    const oppositeHandleWidth = oppositeConfig ? (oppositeConfig.handleWidth ?? 16) : 0;

    const visualTranslate = gesture
      ? Math.max(
          Math.min(
            gesture.startTranslate + (side === 'left' ? -gesture.deltaX : gesture.deltaX),
            closedTranslate,
          ),
          oppositeHandleWidth,
        )
      : interaction.side === side && interaction.dragging && interaction.translate !== null
        ? interaction.translate
        : isOpen
          ? openTranslate
          : closedTranslate;

    const threshold = Math.min(Math.max(config?.threshold ?? 0.5, 0), 1);
    const thresholdTranslate = closedTranslate - (closedTranslate - openTranslate) * threshold;
    const travelDistance = closedTranslate - openTranslate;
    const progress =
      travelDistance > 0
        ? Math.min(Math.max((closedTranslate - visualTranslate) / travelDistance, 0), 1)
        : 0;

    const alternatedTranslate =
      interaction.dragging && interaction.side && interaction.translate !== null
        ? interaction.side === 'left'
          ? -interaction.translate
          : -panelWidth + interaction.translate
        : openSide === 'right'
          ? -panelWidth
          : 0;

    const handleVisibleWidth = handleWidth + (isOpen ? openWidth : 0);
    const contentVisibleWidth = isOpen ? openWidth : 0;
    const handleTransform =
      type === 'alternated'
        ? `translateX(${alternatedTranslate}px)`
        : panelWidth === 0
          ? side === 'left'
            ? `translateX(calc(-100% + ${handleVisibleWidth}px))`
            : `translateX(calc(100% - ${handleVisibleWidth}px))`
          : `translateX(${side === 'left' ? -visualTranslate : visualTranslate}px)`;
    const contentTranslate = Math.min(visualTranslate + handleWidth, panelWidth);
    const panelTransform =
      type === 'alternated'
        ? `translateX(${alternatedTranslate}px)`
        : panelWidth === 0
          ? side === 'left'
            ? `translateX(calc(-100% + ${contentVisibleWidth}px))`
            : `translateX(calc(100% - ${contentVisibleWidth}px))`
          : `translateX(${side === 'left' ? -contentTranslate : contentTranslate}px)`;

    return {
      config,
      side,
      isOpen,
      handleWidth,
      openWidth,
      openTranslate,
      closedTranslate,
      visualTranslate,
      progress,
      thresholdReached: visualTranslate <= thresholdTranslate,
      handleTransform,
      panelTransform,
    };
  };

  const syncThreshold = (side: SwipeSide, reached: boolean) => {
    if (gestureRef.current.thresholdReached === reached) return;

    gestureRef.current.thresholdReached = reached;
    const config = side === 'left' ? left : right;
    config?.onThresholdChange?.(reached);
  };

  const setSideOpen = (side: SwipeSide, nextOpen: boolean) => {
    const nextSide = nextOpen
      ? side
      : type === 'alternated'
        ? side === 'left'
          ? 'right'
          : 'left'
        : null;

    setInteraction({
      side,
      translate: null,
      dragging: false,
    });
    syncThreshold(side, nextOpen);

    if (nextSide === openSide) return;

    if (controlledOpenSide === undefined) setUncontrolledOpenSide(nextSide);
    onOpenSideChange?.(nextSide);
  };

  const handleGesture = (
    phase: GesturePhase,
    requestedSide: SwipeSide | null = null,
    gesture?: SwipeGesture,
  ) => {
    if (phase === 'start') {
      const side = openSide ?? requestedSide;

      gestureRef.current.side = side;
      gestureRef.current.thresholdReached = Boolean(side && openSide === side);

      if (!side) return;

      const sideState = getSideState(side);
      const startTranslate = sideState.isOpen ? sideState.openTranslate : sideState.closedTranslate;

      gestureRef.current.startTranslate = startTranslate;
      setInteraction({ side, translate: startTranslate, dragging: true });
      return;
    }

    const currentGesture = gestureRef.current;

    if (phase === 'cancel') {
      if (!currentGesture.side) return;

      const isOpen = openSide === currentGesture.side;

      setInteraction({
        side: currentGesture.side,
        translate: null,
        dragging: false,
      });
      syncThreshold(currentGesture.side, isOpen);
      gestureRef.current.side = null;
      return;
    }

    if (!gesture) return;

    let side = currentGesture.side;

    if (!side && phase === 'move') {
      side = gesture.deltaX > 0 ? 'left' : gesture.deltaX < 0 ? 'right' : null;

      if (!side || !(side === 'left' ? left : right)) return;

      const sideState = getSideState(side);

      gestureRef.current.side = side;
      gestureRef.current.startTranslate = sideState.closedTranslate;
    }

    if (!side) {
      if (phase === 'release') setInteraction((current) => ({ ...current, dragging: false }));
      return;
    }

    const sideState = getSideState(side, {
      deltaX: gesture.deltaX,
      startTranslate: gestureRef.current.startTranslate,
    });

    if (phase === 'move') {
      setInteraction({ side, translate: sideState.visualTranslate, dragging: true });
      syncThreshold(side, sideState.thresholdReached);
      return;
    }

    setSideOpen(side, sideState.thresholdReached);
    gestureRef.current.side = null;
  };

  const rowSwipeHandlers = useSwipe({
    delta: swipeDelta,
    onStart: () => handleGesture('start'),
    onMove: (gesture) => handleGesture('move', null, gesture),
    onRelease: (gesture) => handleGesture('release', null, gesture),
    onCancel: () => handleGesture('cancel'),
    onTap,
  });
  const leftSwipeHandlers = useSwipe({
    delta: swipeDelta,
    onStart: () => handleGesture('start', 'left'),
    onMove: (gesture) => handleGesture('move', null, gesture),
    onRelease: (gesture) => handleGesture('release', null, gesture),
    onCancel: () => handleGesture('cancel'),
    onTap: () => setSideOpen('left', openSide !== 'left'),
  });
  const rightSwipeHandlers = useSwipe({
    delta: swipeDelta,
    onStart: () => handleGesture('start', 'right'),
    onMove: (gesture) => handleGesture('move', null, gesture),
    onRelease: (gesture) => handleGesture('release', null, gesture),
    onCancel: () => handleGesture('cancel'),
    onTap: () => setSideOpen('right', openSide !== 'right'),
  });

  const sideStates = SWIPE_SIDES.flatMap((side) => {
    const sideState = getSideState(side);

    if (!sideState.config) return [];

    return [{ ...sideState, config: sideState.config }];
  });

  return (
    <div
      ref={observeRow}
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
            interactionClassName,
          )}
        />
      )}

      {sideStates.map(
        ({
          config,
          side,
          progress,
          panelTransform,
          openWidth,
          isOpen,
          handleWidth,
          handleTransform,
        }) => {
          const swipeHandlers = side === 'left' ? leftSwipeHandlers : rightSwipeHandlers;

          return (
            <Fragment key={side}>
              <div
                key={side}
                className={cn(
                  'bg-panel-contrast sunken pointer-events-auto z-10 flex h-full w-full',
                  type === 'drawer'
                    ? ['absolute inset-y-0', side === 'left' ? 'left-0' : 'right-0']
                    : 'relative shrink-0',
                  side === 'left' && 'flex-row-reverse',
                  !interaction.dragging && 'transition-transform duration-200',
                  config.panelClassName,
                )}
                style={{
                  ...config.progressStyle?.(progress),
                  transform: panelTransform,
                }}
              >
                <div
                  className={cn(
                    'flex h-full items-center justify-center gap-2',
                    type === 'alternated' && 'w-full shrink-0',
                  )}
                  style={type === 'drawer' ? { width: `${openWidth}px` } : undefined}
                  inert={!isOpen}
                  aria-hidden={!isOpen}
                >
                  {config.content}
                </div>
              </div>
              <div
                key={`${side}-handle`}
                className={cn(
                  'pointer-events-none absolute inset-y-0 z-20 h-full w-full',
                  type === 'alternated' && (side === 'left' ? 'left-0' : 'left-full'),
                  !interaction.dragging && 'transition-transform duration-200',
                )}
                style={{ transform: handleTransform }}
              >
                <div
                  className={cn(
                    'absolute shrink-0',
                    type === 'drawer'
                      ? ['inset-y-0 h-full', side === 'left' ? 'right-0' : 'left-0']
                      : ['top-2 size-12', side === 'left' ? 'right-6' : 'left-6'],
                  )}
                  style={type === 'drawer' ? { width: `${handleWidth}px` } : undefined}
                >
                  {type === 'alternated' ? (
                    <Button
                      {...swipeHandlers}
                      variant="ghost"
                      size="lg"
                      className="pointer-events-auto !size-full touch-pan-y"
                    >
                      {side === 'left' ? <ChevronRight /> : <ChevronLeft />}
                    </Button>
                  ) : (
                    <button
                      {...swipeHandlers}
                      type="button"
                      className={cn(
                        'bg-border border-info/50 pointer-events-auto h-full w-full cursor-pointer touch-pan-y border-4',
                        side === 'left' ? 'sunken' : 'raised',
                        config.handleClassName,
                      )}
                    />
                  )}
                </div>
              </div>
            </Fragment>
          );
        },
      )}
    </div>
  );
};
