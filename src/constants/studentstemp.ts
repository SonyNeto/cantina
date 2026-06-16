import RESPONSIBLES_IDS from './ids/responsibles';
import STUDENTS_IDS from './ids/students';

export interface Student {
  id: string;
  name: string;
  class?: string;
  responsibleId: string;
}

interface Students {
  STUDENTS: Student[];
}

export const STUDENTS: Students = {
  STUDENTS: [
    {
      id: STUDENTS_IDS.aluno1,
      name: 'Aluno1',
      class: '1M',
      responsibleId: RESPONSIBLES_IDS.responsible1,
    },
    {
      id: STUDENTS_IDS.aluno2,
      name: 'Aluno2',
      class: '1M',
      responsibleId: RESPONSIBLES_IDS.responsible2,
    },
    {
      id: STUDENTS_IDS.aluno3,
      name: 'Aluno3',
      class: 'INF4M',
      responsibleId: RESPONSIBLES_IDS.responsible1,
    },
    {
      id: STUDENTS_IDS.aluno4,
      name: 'Aluno4',
      class: 'INF3M',
      responsibleId: RESPONSIBLES_IDS.responsible1,
    },
  ],
};
