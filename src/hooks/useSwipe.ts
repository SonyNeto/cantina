import { useRef, type MouseEventHandler, type PointerEvent, type PointerEventHandler } from 'react';

export type SwipeDirection = 'left' | 'right';

export interface SwipeGesture {
  deltaX: number;
  deltaY: number;
  absX: number;
  absY: number;
  direction: SwipeDirection;
  isHorizontalSwipe: boolean;
}

interface UseSwipeProps {
  delta?: number;
  onStart?: () => void;
  onMove?: (gesture: SwipeGesture) => void;
  onRelease?: (gesture: SwipeGesture) => void;
  onTap?: () => void;
  onCancel?: () => void;
}

interface UseSwipeReturn {
  onPointerDown: PointerEventHandler<HTMLElement>;
  onPointerUp: PointerEventHandler<HTMLElement>;
  onPointerCancel: PointerEventHandler<HTMLElement>;
  onPointerMove: PointerEventHandler<HTMLElement>;
  onClick: MouseEventHandler<HTMLElement>;
}

const IDLE_POINTER_ID = -1;

function getSwipeGesture(
  event: PointerEvent<HTMLElement>,
  startX: number,
  startY: number,
  delta: number,
): SwipeGesture {
  const deltaX = event.clientX - startX;
  const deltaY = event.clientY - startY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  return {
    deltaX,
    deltaY,
    absX,
    absY,
    direction: deltaX < 0 ? 'left' : 'right',
    isHorizontalSwipe: absX >= delta && absX > absY,
  };
}

function releasePointerCapture(event: PointerEvent<HTMLElement>, pointerId: number) {
  if (pointerId !== IDLE_POINTER_ID && event.currentTarget.hasPointerCapture(pointerId)) {
    event.currentTarget.releasePointerCapture(pointerId);
  }
}

export function useSwipe({
  delta = 25,
  onStart,
  onMove,
  onRelease,
  onTap,
  onCancel,
}: UseSwipeProps): UseSwipeReturn {
  const gestureRef = useRef({
    startX: 0,
    startY: 0,
    pointerId: IDLE_POINTER_ID,
  });

  const didSwipeRef = useRef<boolean>(false);

  return {
    onPointerDown: (event) => {
      gestureRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        pointerId: event.pointerId,
      };

      didSwipeRef.current = false;

      event.currentTarget.setPointerCapture(event.pointerId);
      onStart?.();
    },

    onPointerUp: (event) => {
      const { startX, startY, pointerId } = gestureRef.current;

      if (event.pointerId !== pointerId) return;

      releasePointerCapture(event, pointerId);

      gestureRef.current.pointerId = IDLE_POINTER_ID;

      const gesture = getSwipeGesture(event, startX, startY, delta);

      didSwipeRef.current = gesture.isHorizontalSwipe;
      onRelease?.(gesture);
    },

    onPointerCancel: (event) => {
      const { pointerId } = gestureRef.current;

      if (event.pointerId !== pointerId) return;

      releasePointerCapture(event, pointerId);

      gestureRef.current.pointerId = IDLE_POINTER_ID;
      onCancel?.();
    },

    onPointerMove: (event) => {
      const { startX, startY, pointerId } = gestureRef.current;

      if (event.pointerId !== pointerId) return;

      onMove?.(getSwipeGesture(event, startX, startY, delta));
    },

    onClick: () => {
      if (didSwipeRef.current) {
        didSwipeRef.current = false;
        return;
      }

      onTap?.();
    },
  };
}
