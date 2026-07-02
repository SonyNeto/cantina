import { Select as SelectPrimitive } from '@base-ui/react/select';
import { Check, ChevronDown2 } from 'pixelarticons/react';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../utils/functions';

type SelectTriggerProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
  placeholder: string;
};
type SelectContentProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Popup>;
type SelectItemProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Item>;
type SelectGroupProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Group> & {
  label: string;
};

const Select = SelectPrimitive.Root;

const SelectTrigger = ({ placeholder, className, ...props }: SelectTriggerProps) => (
  <SelectPrimitive.Trigger
    className={cn(
      'border-text/40 inline-flex min-w-0 items-center border-4 px-2 whitespace-nowrap',
      className,
    )}
    {...props}
  >
    <SelectPrimitive.Value
      className="min-w-0 flex-1 truncate text-left text-xl font-medium"
      placeholder={placeholder}
    />
    <SelectPrimitive.Icon className="ml-auto shrink-0">
      <ChevronDown2 />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
);

const SelectContent = ({ children, className, ...props }: SelectContentProps) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Positioner
      alignItemWithTrigger={false}
      disableAnchorTracking={true}
      collisionAvoidance={{
        side: 'none',
        align: 'none',
        fallbackAxisSide: 'none',
      }}
      sideOffset={2}
      className="z-50 w-(--anchor-width)"
    >
      <SelectPrimitive.Popup
        className={cn('border-text/40 bg-primary border-4', className)}
        {...props}
      >
        <SelectPrimitive.List className="max-h-[calc(var(--available-height)-0.5rem)] overflow-y-auto">
          {children}
        </SelectPrimitive.List>
      </SelectPrimitive.Popup>
    </SelectPrimitive.Positioner>
  </SelectPrimitive.Portal>
);

const SelectItem = ({ children, className, ...props }: SelectItemProps) => (
  <SelectPrimitive.Item
    className={cn(
      'hover:bg-text/40 grid w-full grid-cols-[2.5rem_1fr_2.5rem] items-center whitespace-nowrap',
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemIndicator className="col-start-1 flex justify-end">
      <Check />
    </SelectPrimitive.ItemIndicator>
    <SelectPrimitive.ItemText className="col-start-2 flex justify-center truncate text-xl font-medium">
      {children}
    </SelectPrimitive.ItemText>
    <span className="col-start-3" aria-hidden={true} />
  </SelectPrimitive.Item>
);

const SelectGroup = ({ label, children, className, ...props }: SelectGroupProps) => (
  <SelectPrimitive.Group className={className} {...props}>
    <SelectPrimitive.GroupLabel className="bg-secondary w-full truncate text-center text-xl font-medium">
      {label}
    </SelectPrimitive.GroupLabel>
    {children}
  </SelectPrimitive.Group>
);

export { Select, SelectTrigger, SelectContent, SelectItem, SelectGroup };
