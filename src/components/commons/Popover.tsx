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
      <PopoverPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/20 backdrop-blur-xs" />
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
        centered && '!fixed !inset-0 flex items-center justify-center p-4 !transform-none',
      )}
    >
      <PopoverPrimitive.Popup
        className={cn('shadow-md outline-none', matchTriggerWidth && 'w-full', className)}
        {...props}
      />
    </PopoverPrimitive.Positioner>
  </PopoverPrimitive.Portal>
);
const PopoverArrow = PopoverPrimitive.Arrow;

PopoverContent.displayName = PopoverPrimitive.Popup.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverClose };
