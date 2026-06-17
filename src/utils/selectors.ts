import { ORDERS } from '../constants/canteen/orderstemp';
import type { Order } from '../constants/canteen/types';
import { SCHOOL_CLASSES } from '../constants/school/classestemp';
import { RESPONSIBLES } from '../constants/school/responsiblestemp';
import { STUDENTS } from '../constants/school/studentstemp';
import type { SchoolClass, ShiftId, Student } from '../constants/school/types';

export function getOrdersByStudentId(studentId: string): Order[] {
  return ORDERS.ORDERS.filter((order) => order.studentId === studentId);
}

export function getStudentTotal(studentId: string): number {
  return getOrdersByStudentId(studentId).reduce((total, order) => {
    return total + order.total;
  }, 0);
}

export function getOrdersByResponsibleId(responsibleId: string): Order[] {
  const responsible = RESPONSIBLES.RESPONSIBLES.find(
    (responsible) => responsible.id === responsibleId,
  );
  if (!responsible) return [];

  return responsible.studentsIds.flatMap((studentId) => getOrdersByStudentId(studentId));
}

export function getResponsibleTotal(responsibleId: string): number {
  return getOrdersByResponsibleId(responsibleId).reduce((total, order) => {
    return total + order.total;
  }, 0);
}

export function getClassesByShiftId(shiftId: ShiftId | ''): SchoolClass[] {
  if (!shiftId) return [];

  return SCHOOL_CLASSES.filter((schoolClass) => schoolClass.shiftId === shiftId);
}

export function getStudentsByClassId(classId: string): Student[] {
  if (!classId) return [];

  return STUDENTS.STUDENTS.filter((student) => student.classId === classId);
}
