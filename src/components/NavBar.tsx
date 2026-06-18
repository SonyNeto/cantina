import { useState, type FC } from 'react';
import { Drawer, DrawerContent, DrawerTrigger, DrawerSwipeArea } from './commons/Drawer';
import { Menu } from 'pixelarticons/react';
import { Button } from './commons/Button';
import { Link } from 'react-router';
import NAVMENU from '../constants/navmenu.ts';

export const NavBar: FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <div className="bg-secondary border-text/40 sticky top-0 left-0 z-50 flex w-screen flex-col flex-row justify-between border-b-4 p-4">
      <Drawer swipeDirection="left" open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger
          render={
            <Button size="lg" className="z-50 self-start rounded-full" variant="ghost">
              <Menu />
            </Button>
          }
        ></DrawerTrigger>
        <DrawerSwipeArea
          swipeDirection="right"
          className="bg-red fixed top-0 left-0 h-screen w-[10vw]"
        />
        <DrawerContent className="border-text/40 flex h-full flex-col border-r-4">
          {NAVMENU.ITEMS.map((item, idx) => (
            <Link
              key={`navmenu-${item.label.trim().toLowerCase()}-${idx}`}
              to={item.route}
              className="border-text/40 hover:bg-hover text-text hover:text-text-hover inline-flex w-full items-center gap-2.5 border-b-4 p-4 text-xl whitespace-nowrap [&_svg]:size-10 [&_svg]:shrink-0"
              onClick={() => setIsOpen(false)}
            >
              <item.icon width={12} height={12} />
              {item.label}
            </Link>
          ))}
        </DrawerContent>
      </Drawer>

      <img rel="icon" src="/favicon.png" className="size-10" />
    </div>
  );
};
