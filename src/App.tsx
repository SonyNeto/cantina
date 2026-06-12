import { Routes, Route } from 'react-router';
import ROUTES from './constants/routes';
import { Layout } from './components/Layout';
import { Menu } from './pages/menu/Menu';
import { NewOrders } from './pages/neworders/NewOrders';
import { OrdersList } from './pages/orderslist/OrdersList';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path={ROUTES.HOME} element={<Menu />} />
        <Route path={ROUTES.MENU} element={<Menu />} />
        <Route path={ROUTES.NEWORDERS} element={<NewOrders />} />
        <Route path={ROUTES.ORDERSLIST} element={<OrdersList />} />
      </Route>
    </Routes>
  );
}

export default App;
