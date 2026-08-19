const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  INVITE: '/invite/:token',
  NEWORDERS: 'neworders',
  ORDERS: 'orders',
  MENU: 'menu',
  REGISTERS: {
    ROOT: '/registers',
    DETAIL: 'registers/:responsibleId',
    DETAIL_PATH: (responsibleId: string) => `/registers/${responsibleId}`,
    STUDENTS: {
      DETAIL: 'registers/:responsibleId/:studentId',
      DETAIL_PATH: (responsibleId: string, studentId: string) =>
        `/registers/${responsibleId}/${studentId}`,
    },
  },
  WORKSPACE: '/workspace/',
  AUDIT_LOGS: '/audit-logs/',
};

export default ROUTES;
