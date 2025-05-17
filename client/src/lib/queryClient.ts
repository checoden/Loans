import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Получаем базовый URL для API запросов 
function getBaseApiUrl(): string {
  // Проверяем запуск из мобильного приложения или capacitor
  if (typeof window !== 'undefined') {
    // Если это мобильное устройство или Capacitor, всегда используем полный URL
    const userAgent = navigator.userAgent || '';
    if (userAgent.includes('MicroloansApp') || 
        /android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent)) {
      return 'https://onlineloans.replit.app';
    }
  }
  
  // В production режиме всегда используем полный URL Replit
  if (import.meta.env.PROD) {
    // Определяем URL Replit сайта
    const replitUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://onlineloans.replit.app'; // Hardcoded URL для мобильного приложения
    return replitUrl;
  }
  
  // В режиме разработки используем относительные пути
  return '';
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Формируем полный URL с учетом базового адреса
  const baseUrl = getBaseApiUrl();
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Получаем URL запроса из queryKey
    const url = queryKey[0] as string;
    
    // Формируем полный URL с учетом базового адреса
    const baseUrl = getBaseApiUrl();
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
