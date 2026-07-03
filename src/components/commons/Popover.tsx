import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { cn } from '../../utils/functions';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

type PopoverPopupProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Popup>;
type PopoverPositionerProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Positioner>;
type PopoverContentProps = PopoverPopupProps &
  Omit<PopoverPositionerProps, keyof PopoverPopupProps | 'className' | 'style' | 'render'>; // Positioner deals with geomtry, while Popup is the actual content.

const PopoverContent = ({
  className,
  align = 'center',
  sideOffset = 4,
  side,
  collisionPadding,
  collisionAvoidance,
  ...props
}: PopoverContentProps) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Positioner
      align={align}
      side={side}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      collisionAvoidance={collisionAvoidance}
      className={'z-60'}
    >
      <PopoverPrimitive.Popup className={cn('shadow-md outline-none', className)} {...props} />
    </PopoverPrimitive.Positioner>
  </PopoverPrimitive.Portal>
);
const PopoverArrow = PopoverPrimitive.Arrow;

PopoverContent.displayName = PopoverPrimitive.Popup.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverArrow };
