import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible';
import type { ComponentProps, FC } from 'react';
import { cn } from '../../utils/functions';

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger: FC<ComponentProps<typeof CollapsiblePrimitive.Trigger>> = ({
  className,
  ...props
}) => <CollapsiblePrimitive.Trigger className={cn('w-full', className)} {...props} />;

const CollapsibleContent: FC<ComponentProps<typeof CollapsiblePrimitive.Panel>> = ({
  children,
  className,
  ...props
}) => (
  <CollapsiblePrimitive.Panel
    className={cn(
      'border-border/70 bg-panel h-[var(--collapsible-panel-height)] w-full overflow-hidden rounded-none border-4 text-xl shadow-[6px_6px_0_var(--color-shadow)] transition-[height] duration-150 ease-out outline-none',
      className,
    )}
    {...props}
  >
    <div className="bg-panel-contrast/50 w-full min-w-0">{children}</div>
  </CollapsiblePrimitive.Panel>
);

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
