import { PenSquare, Coffee, Notebook } from 'pixelarticons/react';
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
      label: 'Lista de Pedidos',
      route: ROUTES.ORDERSLIST.ROOT,
      icon: Notebook,
    },
  ],
};

export default NAVMENU;
