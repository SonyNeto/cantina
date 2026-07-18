import { Navigate, Outlet, useLocation } from 'react-router';
import ROUTES from '../../constants/routes';
import { Loader } from '../../components/commons/Loader';
import { useAuth } from '../../hooks/useAuth';

export const UnprotectedRoute = () => {
  const location = useLocation();
  const { data: isAuthenticated, isPending, isError } = useAuth();

  if (isPending) {
    return <Loader />;
  }

  if (isError) {
    return <p>Não foi possível verificar sua sessão.</p>;
  }

  if (isAuthenticated) {
    const from = location.state?.from;

    const destination = from
    ? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`
    : ROUTES.HOME;

    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
};
