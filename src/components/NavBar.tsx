import type { FC } from "react"
import { Drawer, DrawerContent, DrawerTrigger, DrawerSwipeArea } from "./commons/Drawer";
import { Menu } from 'pixelarticons/react'
import { Button } from "./commons/Button";

export const NavBar: FC = () => {
  return (
    <Drawer swipeDirection="left">
      <DrawerTrigger render={<Button className="size-10 rounded-full hover:bg-hover" variant="ghost" />}>
        <Menu width={30} height={30} />
      </DrawerTrigger>
      <DrawerSwipeArea swipeDirection="right" className="fixed top-10 left-0 h-screen w-[10vw] z-100 bg-red"/>
      <DrawerContent>
        <h1>Drawer Content</h1>
      </DrawerContent>
    </Drawer>
  )
}