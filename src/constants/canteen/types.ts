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
  product: Product;
  created_at: Date;
  studentId: string;
  total: number;
}

export type OrderStatus = 'cooking' | 'ready';

export interface OrderItemDraft {
  productId: string;
  status: OrderStatus;
}

export interface OrderItem {
  id: string;
  product: Product;
  status: OrderStatus;
  total: number;
}

export interface Order {
  id: string;
  studentId: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderForm {
  studentId: string;
  created_at: string;
  items: OrderItemDraft[];
}
