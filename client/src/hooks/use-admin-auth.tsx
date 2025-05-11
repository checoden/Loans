import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AdminUser = {
  id: number;
  username: string;
  isAdmin: boolean;
};

type LoginData = {
  username: string;
  password: string;
};

type AdminAuthContextType = {
  admin: AdminUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<AdminUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

export const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const {
    data: admin,
    error,
    isLoading,
  } = useQuery<AdminUser | null, Error>({
    queryKey: ["/api/admin/user"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/admin/user");
        if (res.status === 401) {
          return null;
        }
        if (!res.ok) {
          throw new Error("Failed to fetch admin user");
        }
        return await res.json();
      } catch (error) {
        console.error("Admin auth error:", error);
        return null;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/admin/login", credentials);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Ошибка авторизации");
      }
      return await res.json();
    },
    onSuccess: (admin: AdminUser) => {
      queryClient.setQueryData(["/api/admin/user"], admin);
      toast({
        title: "Успешный вход",
        description: "Вы успешно вошли в админ-панель",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка входа",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/admin/user"], null);
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из админ-панели",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка выхода",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}