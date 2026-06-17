import RESPONSIBLES_IDS from './ids/responsibles';
import STUDENTS_IDS from './ids/students';
import type { Responsible } from './types';

interface Responsibles {
  RESPONSIBLES: Responsible[];
}

export const RESPONSIBLES: Responsibles = {
  RESPONSIBLES: [
    {
      id: RESPONSIBLES_IDS.responsible1,
      name: 'Responsável 1',
      studentsIds: [STUDENTS_IDS.aluno1, STUDENTS_IDS.aluno3, STUDENTS_IDS.aluno4],
    },
    {
      id: RESPONSIBLES_IDS.responsible2,
      name: 'Responsável 2',
      studentsIds: [STUDENTS_IDS.aluno2],
    },
  ],
};
