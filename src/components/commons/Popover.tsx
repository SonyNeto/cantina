import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { cn } from '../../utils/functions';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverClose = PopoverPrimitive.Close;

type PopoverPopupProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Popup>;
type PopoverPositionerProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Positioner>;
type PopoverContentProps = PopoverPopupProps &
  Omit<PopoverPositionerProps, keyof PopoverPopupProps | 'className' | 'style' | 'render'> & {
    matchTriggerWidth?: boolean;
    backdrop?: boolean;
    centered?: boolean;
  }; // Positioner deals with geometry, while Popup is the actual content.

const PopoverContent = ({
  className,
  backdrop = false,
  centered = false,
  align = 'center',
  alignOffset,
  sideOffset = 4,
  side,
  collisionPadding,
  collisionAvoidance,
  matchTriggerWidth = false,
  ...props
}: PopoverContentProps) => (
  <PopoverPrimitive.Portal>
    {backdrop && (
      <PopoverPrimitive.Backdrop className="bg-text/20 fixed inset-0 z-50 backdrop-blur-sm" />
    )}
    <PopoverPrimitive.Positioner
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      collisionAvoidance={collisionAvoidance}
      className={cn(
        'z-60',
        matchTriggerWidth && 'w-[var(--anchor-width)]',
        centered && '!fixed !inset-0 flex !transform-none items-center justify-center p-4',
      )}
    >
      <PopoverPrimitive.Popup
        className={cn(
          'border-border/60 bg-panel border-4 shadow-[6px_6px_0_var(--color-shadow)] outline-none',
          matchTriggerWidth && 'w-full',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Positioner>
  </PopoverPrimitive.Portal>
);
const PopoverArrow = PopoverPrimitive.Arrow;

PopoverContent.displayName = PopoverPrimitive.Popup.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverClose };
