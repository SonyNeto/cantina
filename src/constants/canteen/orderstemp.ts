import dayjs from 'dayjs';
import { MENU } from './menuitemstemp';
import STUDENTS_IDS from '../school/ids/students';
import type { Item, Order } from './types';

interface Orders {
  ORDERS: Order[];
}

const MENU_ITEMS = Object.fromEntries(MENU.ITEMS.map((item) => [item.id, item])) as Record<
  string,
  Item
>;

export const ORDERS: Orders = {
  ORDERS: [
    {
      id: `order-${STUDENTS_IDS.aluno1}-${MENU_ITEMS.cake.id}-${dayjs('2026-06-15').format('DD/MM')}`,
      product: MENU_ITEMS.cake,
      created_at: dayjs('2026-06-15').format('DD/MM'),
      studentId: STUDENTS_IDS.aluno1,
      total: MENU_ITEMS.cake.price,
    },
    {
      id: `order-${STUDENTS_IDS.aluno1}-${MENU_ITEMS.mango.id}-${dayjs('2026-06-15').format('DD/MM')}`,
      product: MENU_ITEMS.mango,
      created_at: dayjs('2026-06-15').format('DD/MM'),
      studentId: STUDENTS_IDS.aluno1,
      total: MENU_ITEMS.mango.price,
    },
    {
      id: `order-${STUDENTS_IDS.aluno1}-${MENU_ITEMS.bread.id}-${dayjs('2026-06-12').format('DD/MM')}`,
      product: MENU_ITEMS.bread,
      created_at: dayjs('2026-06-12').format('DD/MM'),
      studentId: STUDENTS_IDS.aluno1,
      total: MENU_ITEMS.bread.price,
    },
    {
      id: `order-${STUDENTS_IDS.aluno2}-${MENU_ITEMS.bread.id}-${dayjs('2026-06-15').format('DD/MM')}`,
      product: MENU_ITEMS.bread,
      created_at: dayjs('2026-06-15').format('DD/MM'),
      studentId: STUDENTS_IDS.aluno2,
      total: MENU_ITEMS.bread.price,
    },
    {
      id: `order-${STUDENTS_IDS.aluno3}-${MENU_ITEMS.cake.id}-${dayjs('2026-06-15').format('DD/MM')}`,
      product: MENU_ITEMS.cake,
      created_at: dayjs('2026-06-15').format('DD/MM'),
      studentId: STUDENTS_IDS.aluno3,
      total: MENU_ITEMS.cake.price,
    },
    {
      id: `order-${STUDENTS_IDS.aluno4}-${MENU_ITEMS.cake.id}-${dayjs('2026-06-15').format('DD/MM')}`,
      product: MENU_ITEMS.cake,
      created_at: dayjs('2026-06-15').format('DD/MM'),
      studentId: STUDENTS_IDS.aluno4,
      total: MENU_ITEMS.cake.price,
    },
  ],
};
