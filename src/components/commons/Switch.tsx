import { Switch as SwitchPrimitive } from '@base-ui/react/switch';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../utils/functions';

type SwitchProps = ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>;
type SwitchThumbProps = ComponentPropsWithoutRef<typeof SwitchPrimitive.Thumb>;

const Switch = ({ className, children, onCheckedChange, checked }: SwitchProps) => {
  return (
    <SwitchPrimitive.Root
      className={cn('bg-text inline-flex h-4 w-12 items-center', className)}
      onCheckedChange={onCheckedChange}
      checked={checked}
    >
      {children}
    </SwitchPrimitive.Root>
  );
};

const SwitchThumb = ({ className }: SwitchThumbProps) => {
  return (
    <SwitchPrimitive.Thumb
      className={cn(
        'bg-primary border-text/70 h-6 w-6 border-4 transition-transform duration-200 ease-out raised [&[data-checked]]:translate-x-[1.5rem] [&[data-checked]]:sunken',
        className,
      )}
    />
  );
};

export { Switch, SwitchThumb };
