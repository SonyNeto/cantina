import type { FC, ComponentProps } from 'react';
import { Accordion as AccordionPrimitive } from '@base-ui/react';
import { cn } from '../../utils/functions';

const Accordion = AccordionPrimitive.Root;
const AccordionItem = AccordionPrimitive.Item;
const AccordionTrigger = AccordionPrimitive.Trigger;
const AccordionContent: FC<ComponentProps<typeof AccordionPrimitive.Panel>> = ({
  children,
  className,
  ...props
}) => (
  <AccordionPrimitive.Panel
    className={cn(
      'border-border/35 bg-panel w-full justify-center overflow-hidden rounded-none data-closed:border-b-0 data-open:border-b-4',
      'data-open:animate-accordion-in',
      'data-closed:animate-accordion-out',
      className,
    )}
    {...props}
  >
    <div className="bg-warning-soft flex justify-center p-6">{children}</div>
  </AccordionPrimitive.Panel>
);

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
