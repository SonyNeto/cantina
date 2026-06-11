import type { FC } from 'react';
import { Drawer, DrawerContent, DrawerTrigger, DrawerSwipeArea } from './commons/Drawer';
import { Menu } from 'pixelarticons/react';
import { Button } from './commons/Button';

export const NavBar: FC = () => {
  return (
    <Drawer swipeDirection="left">
      <DrawerTrigger
        render={
          <Button size="lg" className="rounded-full" variant="ghost">
            <Menu />
          </Button>
        }
      >
      </DrawerTrigger>
      <DrawerSwipeArea
        swipeDirection="right"
        className="bg-red fixed top-10 left-0 h-screen w-[10vw]"
      />
      <DrawerContent>
        <h1>Drawer Content</h1>
      </DrawerContent>
    </Drawer>
  );
};
