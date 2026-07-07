import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import type { ComponentProps, FC } from 'react';
import { cn } from '../../utils/functions';
import { Button } from './Button';
import { X } from '../../assets/icons/MenuIcons';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;

const DialogContent: FC<ComponentProps<typeof DialogPrimitive.Popup>> = ({
  children,
  className,
  title,
  ...props
}) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Backdrop className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm [-webkit-backdrop-filter:blur(6px)] [backdrop-filter:blur(6px)]" />
    <DialogPrimitive.Viewport className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <DialogPrimitive.Popup
        className={cn(
          'border-text/40 bg-primary flex w-full max-w-sm flex-col overflow-hidden rounded-none border-4 text-xl shadow-md outline-none',
          'data-open:animate-Dialog-in',
          'data-closed:animate-Dialog-out',
          className,
        )}
        {...props}
      >
        <div className="border-text/40 flex h-14 items-center justify-between gap-3 border-b-4 bg-secondary pl-4 pr-1">
          {title && (
            <DialogPrimitive.Title className="min-w-0 truncate text-xl font-bold">
              {title}
            </DialogPrimitive.Title>
          )}
          <DialogPrimitive.Close
            render={
              <Button variant="ghost" className="border-text/40 rounded-none border-l-4">
                <X />
              </Button>
            }
          />
        </div>
        {children && (
          <div className="bg-hover/30 flex w-full min-w-0 flex-col gap-4 p-5 text-xl font-medium">
            {children}
          </div>
        )}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Viewport>
  </DialogPrimitive.Portal>
);

const DialogDescription = DialogPrimitive.Description;

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
};
