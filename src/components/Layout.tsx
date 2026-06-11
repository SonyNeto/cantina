import type { FC } from "react"
import { NavBar } from "./NavBar"

export const Layout: FC = () => {
  return (
    <div className="flex h-screen w-screen flex-col">
      <NavBar />
    </div>
  )
}