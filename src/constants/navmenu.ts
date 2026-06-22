import { PenSquare, Coffee, User } from 'pixelarticons/react';
import ROUTES from './routes';
import { Pan } from '../assets/icons/MenuIcons';

const NAVMENU = {
  ITEMS: [
    {
      label: 'Iniciar Pedidos',
      route: ROUTES.NEWORDERS,
      icon: PenSquare,
    },
    {
      label: 'Pedidos',
      route: ROUTES.ORDERS,
      icon: Pan,
    },
    {
      label: 'Cardápio',
      route: ROUTES.MENU,
      icon: Coffee,
    },
    {
      label: 'Registros',
      route: ROUTES.REGISTERS.ROOT,
      icon: User,
    },
  ],
};

export default NAVMENU;
