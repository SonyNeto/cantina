const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  INVITE: '/invite/:token',
  NEWORDERS: 'neworders',
  ORDERS: 'orders',
  ORDER_EDIT: '/orders/:orderId/edit',
  ORDER_EDIT_PATH: (orderId: string) => `/orders/${orderId}/edit`,
  MENU: 'menu',
  REGISTERS: {
    ROOT: '/registers',
    DETAIL: 'registers/:responsibleId',
    DETAIL_PATH: (responsibleId: string) => `/registers/${responsibleId}`,
  },
  WORKSPACE: '/workspace/',
  AUDIT_LOGS: '/audit-logs/',
};

export default ROUTES;
