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
      'border-border/45 bg-panel text-text hover:bg-info-soft hover:text-info focus-visible:ring-accent/35 inline-flex min-w-0 items-center rounded-none border-4 px-2 whitespace-nowrap  outline-none focus-visible:ring-[3px]',
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
      sideOffset={-4}
      className="z-50 w-[var(--anchor-width)]"
    >
      <SelectPrimitive.Popup
        className={cn(
          'border-border/70 bg-panel w-full border-4 shadow-[6px_6px_0_var(--color-shadow)]',
          className,
        )}
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
      'border-border/35 hover:bg-info-soft hover:text-info data-highlighted:bg-info-soft data-highlighted:text-info grid w-full grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center border-b-4 whitespace-nowrap outline-none first:border-t-4 last:border-b-0',
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemIndicator className="col-start-1 flex justify-end">
      <Check />
    </SelectPrimitive.ItemIndicator>
    <SelectPrimitive.ItemText className="col-start-2 min-w-0 truncate text-center text-xl font-medium">
      {children}
    </SelectPrimitive.ItemText>
    <span className="col-start-3" aria-hidden={true} />
  </SelectPrimitive.Item>
);

const SelectGroup = ({ label, children, className, ...props }: SelectGroupProps) => (
  <SelectPrimitive.Group
    className={cn('border-border/35 border-b-4 last:border-b-0', className)}
    {...props}
  >
    <SelectPrimitive.GroupLabel className="bg-panel-header border-border/35 w-full truncate border-b-4 px-2 py-1 text-center text-xl font-bold">
      {label}
    </SelectPrimitive.GroupLabel>
    {children}
  </SelectPrimitive.Group>
);

export { Select, SelectTrigger, SelectContent, SelectItem, SelectGroup };
