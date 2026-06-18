import { Routes, Route } from 'react-router';
import ROUTES from './constants/routes';
import { Layout } from './components/Layout';
import { Menu } from './pages/menu/Menu';
import { NewOrders } from './pages/neworders/NewOrders';
import { OrdersList } from './pages/orderslist/OrdersList';
import { ResponsibleDetails } from './pages/orderslist/ResponsibleDetails';
import { StudentDetails } from './pages/orderslist/StudentDetails';
import { Toast } from './components/commons/Toast';

function App() {
  return (
    <>
      <Toast />
      <Routes>
        <Route element={<Layout />}>
          <Route path={ROUTES.HOME} element={<NewOrders />} />
          <Route path={ROUTES.NEWORDERS} element={<NewOrders />} />
          <Route path={ROUTES.MENU} element={<Menu />} />
          <Route path={ROUTES.ORDERSLIST.ROOT} element={<OrdersList />} />
          <Route path={ROUTES.ORDERSLIST.DETAIL} element={<ResponsibleDetails />} />
          <Route path={ROUTES.ORDERSLIST.STUDENTS.DETAIL} element={<StudentDetails />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
