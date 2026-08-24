import { Routes, Route } from 'react-router';
import { lazy, Suspense } from 'react';
import ROUTES from './constants/routes';
import { Layout } from './components/Layout';
import { Menu } from './pages/menu/Menu';
import { NewOrders } from './pages/neworders/NewOrders';
import { Registers } from './pages/registers/Registers';
import { ResponsibleDetails } from './pages/registers/ResponsibleDetails';
import { Toast } from './components/commons/Toast';
import { Orders } from './pages/orders/Orders';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './pages/auth/ProtectedRoute';
import { UnprotectedRoute } from './pages/auth/UnprotectedRoute';
import { Invites } from './pages/invites/Invites';
import { ProtectedAdminRoute } from './pages/auth/ProtectedAdminRoute';
import { getSavedTheme } from './utils/functions';
import { Loader } from './components/commons/Loader';
import { Workspace } from './pages/workspace/Workspace';
import { AuditLogs } from './pages/auditLogs/AuditLogs';

const LoginPage = lazy(() =>
  import('./pages/auth/LoginPage').then((module) => ({
    default: module.LoginPage,
  })),
);

const SignupPage = lazy(() =>
  import('./pages/auth/SignupPage').then((module) => ({
    default: module.SignupPage,
  })),
);

const queryClient = new QueryClient();

const isDark = getSavedTheme();
document.documentElement.classList.toggle('dark', isDark);
localStorage.setItem('theme', isDark ? 'dark' : 'light');

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toast />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route element={<UnprotectedRoute />}>
            <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          </Route>

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
                <Route path={ROUTES.WORKSPACE} element={<Workspace />} />
                <Route path={ROUTES.AUDIT_LOGS} element={<AuditLogs />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </QueryClientProvider>
  );
}

export default App;
