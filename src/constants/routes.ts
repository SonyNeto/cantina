const ROUTES = {
  HOME: '/',
  NEWORDERS: 'neworders',
  MENU: 'menu',
  ORDERSLIST: {
    ROOT: '/orderslist',
    DETAIL: 'orderslist/:responsibleId',
    DETAIL_PATH: (responsibleId: string) => `/orderslist/${responsibleId}`,
    STUDENTS: {
      DETAIL: 'orderslist/:responsibleId/:studentId',
      DETAIL_PATH: (responsibleId: string, studentId: string) =>
        `/orderslist/${responsibleId}/${studentId}`,
    },
  },
};

export default ROUTES;
