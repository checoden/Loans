import { useAuth } from "@/hooks/use-auth";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: () => React.JSX.Element;
  adminOnly?: boolean;
}

export function ProtectedRoute({
  path,
  component: Component,
  adminOnly = false,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const { admin, isLoading: isAdminLoading } = useAdminAuth();

  // Использовать админский статус из AdminAuthProvider, если режим админа
  if (adminOnly) {
    if (isAdminLoading) {
      return (
        <Route path={path}>
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Route>
      );
    }

    // Если требуется доступ администратора, но пользователь не авторизован как администратор
    if (!admin) {
      return (
        <Route path={path}>
          <Redirect to="/admin/login" />
        </Route>
      );
    }
  } else {
    // Обычная проверка для неадминских маршрутов
    if (isLoading) {
      return (
        <Route path={path}>
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Route>
      );
    }

    // Если пользователь не авторизован
    if (!user) {
      return (
        <Route path={path}>
          <Redirect to="/admin/login" />
        </Route>
      );
    }
  }

  return <Route path={path} component={Component} />;
}
