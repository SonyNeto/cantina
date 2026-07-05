export type ShiftId = string;

export interface Shift {
  id: ShiftId;
  label: string;
}

export interface SchoolClass {
  id: string;
  label: string;
  shiftId: ShiftId;
  shiftLabel?: string;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  responsibleId: string;
}

export interface Responsible {
  id: string;
  name: string;
}
