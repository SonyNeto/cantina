import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';
import { ArrowBarLeft } from 'pixelarticons/react';
import type { ComponentProps, FC } from 'react';
import { cn } from '../../utils/functions';
import { Button } from './Button';

const Drawer = DrawerPrimitive.Root;
const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerContent: FC<ComponentProps<typeof DrawerPrimitive.Content>> = ({
  children,
  className,
  ...props
}) => (
  <DrawerPrimitive.Portal>
    <DrawerPrimitive.Backdrop className="bg-text/20 fixed inset-0 z-50 backdrop-blur-sm" />
    <DrawerPrimitive.Viewport className="fixed inset-0 z-50">
      <DrawerPrimitive.Popup
        className={cn(
          'border-border/70 bg-panel fixed top-0 left-0 z-50 flex h-dvh w-full max-w-72 flex-col border-r-4 shadow-[6px_0_0_var(--color-shadow)]',
          'data-open:animate-drawer-in',
          'data-closed:animate-drawer-out',
        )}
      >
        <DrawerPrimitive.Content className={className} {...props}>
          <div className="border-border/40 bg-panel-header flex justify-end border-b-4 p-3">
            <DrawerPrimitive.Close
              render={
                <Button variant="ghost" size="lg" className="hover:text-danger rounded-none">
                  <ArrowBarLeft />
                </Button>
              }
            />
          </div>
          {children}
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Popup>
    </DrawerPrimitive.Viewport>
  </DrawerPrimitive.Portal>
);

const DrawerSwipeArea = DrawerPrimitive.SwipeArea;
//const DrawerHeader = DrawerPrimitive.Header;
const DrawerTitle = DrawerPrimitive.Title;
const DrawerDescription = DrawerPrimitive.Description;
const DrawerClose = DrawerPrimitive.Close;

export {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerSwipeArea,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
};
