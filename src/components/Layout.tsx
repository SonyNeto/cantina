import type { FC } from 'react';
import { Outlet } from 'react-router'
import { NavBar } from './NavBar';

export const Layout: FC = () => {
  return (
    <div className="flex h-screen w-screen flex-col overflow-auto">
      <NavBar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};
