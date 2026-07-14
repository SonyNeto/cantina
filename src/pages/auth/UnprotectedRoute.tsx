import { Navigate, Outlet } from 'react-router';
import ROUTES from '../../constants/routes';
import { Loader } from '../../components/commons/Loader';
import { useAuth } from '../../hooks/useAuth';

export const UnprotectedRoute = () => {
  const { data: isAuthenticated, isPending, isError } = useAuth();

  if (isPending) {
    return <Loader />;
  }

  if (isError) {
    return <p>Não foi possível verificar sua sessão.</p>;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
};
