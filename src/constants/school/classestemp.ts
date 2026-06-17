import type { SchoolClass, Shift } from './types';

export const SHIFTS: Shift[] = [
  {
    id: 'morning',
    label: 'Manhã',
  },
  {
    id: 'afternoon',
    label: 'Tarde',
  },
];

export const SCHOOL_CLASSES: SchoolClass[] = [
  {
    id: 'class-inf-3-morning',
    label: 'Infantil III',
    shiftId: 'morning',
  },
  {
    id: 'class-inf-4-morning',
    label: 'Infantil IV',
    shiftId: 'morning',
  },
  {
    id: 'class-1-morning',
    label: '1º Ano',
    shiftId: 'morning',
  },
  {
    id: 'class-2-morning',
    label: '2º Ano',
    shiftId: 'morning',
  },
  {
    id: 'class-1-afternoon',
    label: '1º Ano',
    shiftId: 'afternoon',
  },
];
