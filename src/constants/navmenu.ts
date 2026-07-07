import { PenSquare, Coffee, User } from 'pixelarticons/react';
import ROUTES from './routes';
import { Pan } from '../assets/icons/MenuIcons';
import type { WorkspaceAccessLevel } from '../utils/workspaceAccess';

type NavMenuItem = {
  label: string;
  route: string;
  accessLevel: WorkspaceAccessLevel;
  icon: typeof PenSquare;
};

const NAVMENU = {
  ITEMS: [
    {
      label: 'Iniciar Pedidos',
      route: ROUTES.NEWORDERS,
      accessLevel: 'member',
      icon: PenSquare,
    },
    {
      label: 'Pedidos',
      route: ROUTES.ORDERS,
      accessLevel: 'member',
      icon: Pan,
    },
    {
      label: 'Cardápio',
      route: ROUTES.MENU,
      accessLevel: 'admin',
      icon: Coffee,
    },
    {
      label: 'Registros',
      route: ROUTES.REGISTERS.ROOT,
      accessLevel: 'admin',
      icon: User,
    },
  ] satisfies NavMenuItem[],
};

export default NAVMENU;
