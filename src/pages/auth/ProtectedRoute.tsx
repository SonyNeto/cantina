import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet, useLocation } from "react-router";
import { apiFetch } from "../../utils/api";
import { Loader } from "../../components/commons/Loader";
import ROUTES from "../../constants/routes";

export const ProtectedRoute = () => {
  const location = useLocation();

  const { isLoading, isError } = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const res = await apiFetch('/check-auth');

      if (!res.ok) {
        throw new Error('Não autenticado');
      }

      return null;
    }, 
    retry: false,
  });

  if (isLoading) return <Loader />;

  if (isError) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />
}
