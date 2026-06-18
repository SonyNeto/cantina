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
      'bg-primary border-text/40 w-full justify-center overflow-hidden rounded-none border-t-4',
      'data-open:animate-accordion-in',
      'data-closed:animate-accordion-out',
      className,
    )}
    {...props}
  >
    <div className="bg-hover/30 flex justify-center p-6">{children}</div>
  </AccordionPrimitive.Panel>
);

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
