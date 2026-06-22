import { Routes, Route } from 'react-router';
import ROUTES from './constants/routes';
import { Layout } from './components/Layout';
import { Menu } from './pages/menu/Menu';
import { NewOrders } from './pages/neworders/NewOrders';
import { Registers } from './pages/registers/Registers';
import { ResponsibleDetails } from './pages/registers/ResponsibleDetails';
import { StudentDetails } from './pages/registers/StudentDetails';
import { Toast } from './components/commons/Toast';
import { Orders } from './pages/orders/Orders';

function App() {
  return (
    <>
      <Toast />
      <Routes>
        <Route element={<Layout />}>
          <Route path={ROUTES.HOME} element={<NewOrders />} />
          <Route path={ROUTES.NEWORDERS} element={<NewOrders />} />
          <Route path={ROUTES.ORDERS} element={<Orders />} />
          <Route path={ROUTES.MENU} element={<Menu />} />
          <Route path={ROUTES.REGISTERS.ROOT} element={<Registers />} />
          <Route path={ROUTES.REGISTERS.DETAIL} element={<ResponsibleDetails />} />
          <Route path={ROUTES.REGISTERS.STUDENTS.DETAIL} element={<StudentDetails />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
