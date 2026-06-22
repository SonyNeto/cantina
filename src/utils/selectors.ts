import { REGISTERS } from '../constants/canteen/registerstemp';
import type { Register } from '../constants/canteen/types';
import { SCHOOL_CLASSES } from '../constants/school/classestemp';
import { RESPONSIBLES } from '../constants/school/responsiblestemp';
import { STUDENTS } from '../constants/school/studentstemp';
import type { SchoolClass, ShiftId, Student } from '../constants/school/types';

export function getRegistersByStudentId(studentId: string): Register[] {
  return REGISTERS.REGISTERS.filter((register) => register.studentId === studentId);
}

export function getStudentTotal(studentId: string): number {
  return getRegistersByStudentId(studentId).reduce((total, register) => {
    return total + register.total;
  }, 0);
}

export function getStudentNameById(studentId: string): string {
  const student = STUDENTS.STUDENTS.find((student) => student.id === studentId);
  if (!student) return '';

  return student.name;
}

export function getRegistersByResponsibleId(responsibleId: string): Register[] {
  const responsible = RESPONSIBLES.RESPONSIBLES.find(
    (responsible) => responsible.id === responsibleId,
  );
  if (!responsible) return [];

  return responsible.studentsIds.flatMap((studentId) => getRegistersByStudentId(studentId));
}

export function getResponsibleNameById(responsibleId: string): string {
  const responsible = RESPONSIBLES.RESPONSIBLES.find(
    (responsible) => responsible.id === responsibleId,
  );
  if (!responsible) return '';

  return responsible.name;
}

export function getResponsibleTotal(responsibleId: string): number {
  return getRegistersByResponsibleId(responsibleId).reduce((total, register) => {
    return total + register.total;
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
