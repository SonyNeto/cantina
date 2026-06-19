import { PenSquare, Coffee, User } from 'pixelarticons/react';
import ROUTES from './routes';

const NAVMENU = {
  ITEMS: [
    {
      label: 'Iniciar Pedidos',
      route: ROUTES.NEWORDERS,
      icon: PenSquare,
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
