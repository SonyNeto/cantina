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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ProtectedRoute } from './pages/auth/ProtectedRoute';
import { Invites } from './pages/invites/Invites';
import { ProtectedAdminRoute } from './pages/auth/ProtectedAdminRoute';
import { getSavedTheme } from './utils/functions';

const queryClient = new QueryClient();

const isDark = getSavedTheme();
document.documentElement.classList.toggle('dark', isDark);
localStorage.setItem('theme', isDark ? 'dark' : 'light');

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toast />
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP} element={<SignupPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path={ROUTES.INVITE} element={<Invites />} />
            <Route path={ROUTES.HOME} element={<NewOrders />} />
            <Route path={ROUTES.NEWORDERS} element={<NewOrders />} />
            <Route path={ROUTES.ORDERS} element={<Orders />} />
            <Route element={<ProtectedAdminRoute />}>
              <Route path={ROUTES.MENU} element={<Menu />} />
              <Route path={ROUTES.REGISTERS.ROOT} element={<Registers />} />
              <Route path={ROUTES.REGISTERS.DETAIL} element={<ResponsibleDetails />} />
              <Route path={ROUTES.REGISTERS.STUDENTS.DETAIL} element={<StudentDetails />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
