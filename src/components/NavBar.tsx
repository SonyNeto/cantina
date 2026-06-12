import type { FC } from 'react';
import { Drawer, DrawerContent, DrawerTrigger, DrawerSwipeArea } from './commons/Drawer';
import { Menu } from 'pixelarticons/react';
import { Button } from './commons/Button';
import { Link } from 'react-router';
import NAVMENU from '../constants/navmenu.ts'

export const NavBar: FC = () => {
  return (
    <div className="sticky top-0 left-0 z-50 flex w-screen flex-col bg-secondary border-b-4 border-text/30 p-4">
      <Drawer swipeDirection="left">
        <DrawerTrigger
          render={
            <Button size="lg" className="rounded-full z-50" variant="ghost">
              <Menu />
            </Button>
          }
        >
        </DrawerTrigger>
        <DrawerSwipeArea
          swipeDirection="right"
          className="bg-red fixed top-0 left-0 h-screen w-[10vw]"
        />
        <DrawerContent className="flex h-full flex-col border-r-4 border-text/30">
          {NAVMENU.ITEMS.map((item, idx) => (
            <Link key={`navmenu-${item.label.trim().toLowerCase()}-${idx}`} to={item.route} className="inline-flex items-center gap-2.5 w-full whitespace-nowrap border-b-4 border-text/30 hover:bg-hover text-xl text-text hover:text-text-hover [&_svg]:size-10 p-4">
              <item.icon width={12} height={12}/>
              {item.label}
            </Link>
          ))}
        </DrawerContent>
      </Drawer>
    </div>
  );
};
