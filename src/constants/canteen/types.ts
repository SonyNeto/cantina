import type { JSX, SVGProps } from 'react';

export interface Item {
  id: string;
  label: string;
  price: number;
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
}

export interface Order {
  id: string;
  product: Item;
  created_at: string;
  studentId: string;
  total: number;
}
