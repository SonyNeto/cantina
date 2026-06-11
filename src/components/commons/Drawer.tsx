import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { ArrowBarLeft } from 'pixelarticons/react';
import type { ComponentProps, FC } from "react";
import { cn } from "../../utils/functions";
import { Button } from "./Button";

const Drawer = DrawerPrimitive.Root;
const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerContent: FC<
  ComponentProps<typeof DrawerPrimitive.Content>
> = ({ children, className, ...props }) => (
  <DrawerPrimitive.Portal>
    <DrawerPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/10 backdrop-blur-xs" />
    <DrawerPrimitive.Viewport className="fixed inset-0 z-50">
      <DrawerPrimitive.Popup
        className={cn(
          'fixed top-0 left-0 z-50 flex h-screen w-full max-w-64 flex-col bg-secundary shadow-lg',
          'data-open:animate-drawer-in',
          'data-closed:animate-drawer-out',
          className,
        )}
      >
        <DrawerPrimitive.Content {...props}>
            <DrawerPrimitive.Close
              className="absolute top-2 right-3 cursor-pointer rounded-full p-1 transition-all hover:text-red-500"
              render={
                <Button variant="ghost" size="sm" className="size-10 rounded-full">
                  <ArrowBarLeft width={30} height={30} />
                </Button>
              }
            />
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

export { Drawer, DrawerTrigger, DrawerContent, DrawerSwipeArea, DrawerTitle, DrawerDescription, DrawerClose };
