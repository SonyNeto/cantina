import { Navigate, Outlet, useLocation } from 'react-router';
import { Loader } from '../../components/commons/Loader';
import ROUTES from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';

export const ProtectedRoute = () => {
  const location = useLocation();
  
  const { data: isAuthenticated, isPending, isError } = useAuth();

  if (isPending) return <Loader />;

  if (isError || !isAuthenticated) {

    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
};
