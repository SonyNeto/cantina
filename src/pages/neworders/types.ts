import type { ShiftId } from '../../constants/school/types';

export type NewOrderForm = {
  shiftId: ShiftId | '';
  classId: string;
  studentId: string;
  order: {
    menuItemId: string;
    quantity: number;
  }[];
};
