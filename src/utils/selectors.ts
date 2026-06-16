import { ORDERS } from '../constants/orderstemp';
import { RESPONSIBLES } from '../constants/responsiblestemp';

export function getOrdersByStudentId(studentId: string) {
  return ORDERS.ORDERS.filter((order) => order.studentId === studentId);
}

export function getStudentTotal(studentId: string) {
  return getOrdersByStudentId(studentId).reduce((total, order) => {
    return total + order.total;
  }, 0);
}

export function getOrdersByResponsibleId(responsibleId: string) {
  const responsible = RESPONSIBLES.RESPONSIBLES.find(
    (responsible) => responsible.id === responsibleId,
  );
  return responsible.studentsIds.flatMap((studentId) => getOrdersByStudentId(studentId));
}

export function getResponsibleTotal(responsibleId: string) {
  return getOrdersByResponsibleId(responsibleId).reduce((total, order) => {
    return total + order.total;
  }, 0);
}
