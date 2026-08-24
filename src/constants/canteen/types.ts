import type { JSX, SVGProps } from 'react';

export interface Product {
  id: string;
  label: string;
  price: number;
}

export interface MenuItem extends Product {
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
}

export interface Register {
  id: string;
  sourceOrderItemId?: string;
  product: Product;
  created_at: Date;
  studentId: string;
}

export type OrderStatus = 'cooking' | 'ready';

export interface OrderItemDraft {
  productId: string;
}

export interface OrderItem {
  id: string;
  product: Product;
  status: OrderStatus;
}

export interface Order {
  id: string;
  studentId: string;
  created_at: string;
  payment: number;
  items: OrderItem[];
}

export interface OrderForm {
  studentId: string;
  created_at: string;
  payment: number;
  keepChange: boolean;
  details?: string;
  items: OrderItemDraft[];
}
