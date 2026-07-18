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
    <DialogPrimitive.Backdrop className="bg-text/25 fixed inset-0 z-[80] backdrop-blur-sm [backdrop-filter:blur(6px)] [-webkit-backdrop-filter:blur(6px)]" />
    <DialogPrimitive.Viewport className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <DialogPrimitive.Popup
        className={cn(
          'border-border/70 bg-panel flex w-full max-w-sm flex-col overflow-hidden rounded-none border-4 text-xl shadow-[6px_6px_0_var(--color-shadow)] outline-none',
          'data-open:animate-Dialog-in',
          'data-closed:animate-Dialog-out',
          className,
        )}
        {...props}
      >
        <div className="bg-panel-header flex h-14 items-center justify-between gap-3 pr-1 pl-4 raised">
          {title && (
            <DialogPrimitive.Title className="min-w-0 truncate text-xl font-bold">
              {title}
            </DialogPrimitive.Title>
          )}
          <DialogPrimitive.Close
            render={
              <Button variant="ghost" className="border-border/40 rounded-none border-l-4">
                <X />
              </Button>
            }
          />
        </div>
        {children && (
          <div className="bg-panel-contrast/50 flex w-full min-w-0 flex-col gap-4 p-5 text-xl font-medium">
            {children}
          </div>
        )}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Viewport>
  </DialogPrimitive.Portal>
);

const DialogClose = DialogPrimitive.Close;
const DialogDescription = DialogPrimitive.Description;

export { Dialog, DialogTrigger, DialogContent, DialogClose, DialogDescription };
