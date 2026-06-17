import RESPONSIBLES_IDS from './ids/responsibles';
import STUDENTS_IDS from './ids/students';
import type { Student } from './types';

interface Students {
  STUDENTS: Student[];
}

export const STUDENTS: Students = {
  STUDENTS: [
    {
      id: STUDENTS_IDS.aluno1,
      name: 'Aluno1',
      classId: 'class-1-morning',
      responsibleId: RESPONSIBLES_IDS.responsible1,
    },
    {
      id: STUDENTS_IDS.aluno2,
      name: 'Aluno2',
      classId: 'class-1-morning',
      responsibleId: RESPONSIBLES_IDS.responsible2,
    },
    {
      id: STUDENTS_IDS.aluno3,
      name: 'Aluno3',
      classId: 'class-inf-4-morning',
      responsibleId: RESPONSIBLES_IDS.responsible1,
    },
    {
      id: STUDENTS_IDS.aluno4,
      name: 'Aluno4',
      classId: 'class-inf-3-morning',
      responsibleId: RESPONSIBLES_IDS.responsible1,
    },
  ],
};
