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
    <DrawerPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/10 backdrop-blur-xs" />
    <DrawerPrimitive.Viewport className="fixed inset-0 z-50">
      <DrawerPrimitive.Popup
        className={cn(
          'bg-secondary fixed top-0 left-0 z-50 flex h-screen w-full max-w-64 flex-col shadow-lg',
          'data-open:animate-drawer-in',
          'data-closed:animate-drawer-out',
        )}
      >
        <DrawerPrimitive.Content className={className} {...props}>
          <div className="bg-tertiary border-text/40 flex justify-end border-b-4 p-4">
            <DrawerPrimitive.Close
              render={
                <Button variant="ghost" size="lg" className="rounded-full hover:text-red-600">
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
