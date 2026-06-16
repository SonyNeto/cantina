import { Cake } from 'pixelarticons/react';
import { Bread, Cashew, Mango, Guajava } from '../assets/icons/MenuIcons';
import type { SVGProps, JSX } from 'react';
import MENU_ITEMS_IDS from './ids/menuitems';

export interface Item {
  id: string;
  label: string;
  price: number;
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
}
interface Menu {
  ITEMS: Item[];
}

export const MENU: Menu = {
  ITEMS: [
    {
      id: MENU_ITEMS_IDS.cake,
      label: 'Bolo',
      price: 4.5,
      icon: Cake,
    },
    {
      id: MENU_ITEMS_IDS.bread,
      label: 'Queijo quente',
      price: 4.0,
      icon: Bread,
    },
    {
      id: MENU_ITEMS_IDS.cashew,
      label: 'Suco de Caju',
      price: 2.5,
      icon: Cashew,
    },
    {
      id: MENU_ITEMS_IDS.mango,
      label: 'Suco de Manga',
      price: 2.5,
      icon: Mango,
    },
    {
      id: MENU_ITEMS_IDS.guajava,
      label: 'Suco de Goiaba',
      price: 2.5,
      icon: Guajava,
    },
  ],
};
