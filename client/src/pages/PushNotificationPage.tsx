import { useState } from "react";
import { useAdminAuth } from "../hooks/use-admin-auth";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2, SendIcon, AlertTriangleIcon, CheckCircle, ArrowLeftCircle, Users, Smartphone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "../lib/queryClient";
import { Redirect, Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

export default function PushNotificationPage() {
  const { admin, isLoading } = useAdminAuth();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastSentResult, setLastSentResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Получаем конфигурацию OneSignal
  const { data: config, isLoading: isLoadingConfig } = useQuery({
    queryKey: ["/api/push-notification/config"],
    queryFn: getQueryFn({ on401: "throw" })
  });

  // Если пользователь не admin, перенаправляем на страницу входа
  if (!isLoading && !admin) {
    return <Redirect to="/admin/login" />;
  }

  // Проверка на наличие ключей OneSignal
  const hasRequiredConfig = config?.appId && config?.hasApiKey;

  // Отправка уведомления всем устройствам
  const handleSendToAll = async () => {
    if (!title || !message) {
      toast({
        title: "Ошибка",
        description: "Заголовок и текст уведомления обязательны",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSending(true);
      const response = await apiRequest("POST", "/api/push-notification", { 
        title, 
        message, 
        url: url || undefined 
      });
      
      const result = await response.json();
      setLastSentResult(result);
      
      if (result.success) {
        toast({
          title: "Успех",
          description: "Уведомление успешно отправлено всем устройствам",
          variant: "default"
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось отправить уведомление",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      // Выводим детальную информацию об ошибке
      let errorMsg = "Произошла ошибка при отправке уведомления";
      if (error instanceof Error) {
        errorMsg += `: ${error.message}`;
        console.error("Детали ошибки:", error.stack);
      }
      // Сохраняем информацию об ошибке в результате
      setLastSentResult({ error: errorMsg, details: String(error) });
      
      toast({
        title: "Ошибка",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  // Отправка уведомления на конкретное устройство
  const handleSendToDevice = async () => {
    if (!title || !message) {
      toast({
        title: "Ошибка",
        description: "Заголовок и текст уведомления обязательны",
        variant: "destructive"
      });
      return;
    }
    
    if (!deviceId) {
      toast({
        title: "Ошибка",
        description: "ID устройства обязателен для отправки",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSending(true);
      const response = await apiRequest("POST", "/api/push-notification/device", { 
        title, 
        message, 
        url: url || undefined,
        deviceId
      });
      
      const result = await response.json();
      setLastSentResult(result);
      
      if (result.success) {
        toast({
          title: "Успех",
          description: "Уведомление успешно отправлено на устройство",
          variant: "default"
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось отправить уведомление на устройство",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error sending notification to device:", error);
      let errorMsg = "Произошла ошибка при отправке уведомления на устройство";
      if (error instanceof Error) {
        errorMsg += `: ${error.message}`;
      }
      setLastSentResult({ error: errorMsg, details: String(error) });
      
      toast({
        title: "Ошибка",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  // Обобщенный обработчик отправки в зависимости от активной вкладки
  const handleSendNotification = async () => {
    if (activeTab === "device") {
      await handleSendToDevice();
    } else {
      await handleSendToAll();
    }
  };

  // Если загружаем данные, показываем спиннер
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Link href="/admin">
          <Button variant="outline" size="sm" className="h-9">
            <ArrowLeftCircle className="mr-2 h-4 w-4" />
            <span className="whitespace-nowrap">Вернуться в админ-панель</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Панель администратора - Пуш-уведомления</h1>
      </div>
      
      {isLoadingConfig ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !hasRequiredConfig ? (
        <Card className="mb-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <AlertTriangleIcon className="mr-2 h-5 w-5" />
              Ошибка конфигурации OneSignal
            </CardTitle>
            <CardDescription>
              Отсутствуют необходимые ключи для работы с OneSignal. Убедитесь, что в переменных окружения установлены:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>VITE_ONESIGNAL_APP_ID {config?.appId ? <CheckCircle className="inline h-4 w-4 text-green-500 ml-2" /> : <AlertTriangleIcon className="inline h-4 w-4 text-destructive ml-2" />}</li>
              <li>VITE_ONESIGNAL_REST_API_KEY {config?.hasApiKey ? <CheckCircle className="inline h-4 w-4 text-green-500 ml-2" /> : <AlertTriangleIcon className="inline h-4 w-4 text-destructive ml-2" />}</li>
            </ul>
          </CardContent>
        </Card>
      ) : null}
      
      <Card>
        <CardHeader>
          <CardTitle>Отправка уведомления</CardTitle>
          <CardDescription>
            Заполните форму ниже для отправки уведомления всем пользователям
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Заголовок уведомления</Label>
            <Input
              id="title"
              placeholder="Например: Новое предложение"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSending || !hasRequiredConfig}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Текст уведомления</Label>
            <Textarea
              id="message"
              placeholder="Например: У нас появились новые выгодные предложения по займам"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSending || !hasRequiredConfig}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL для перехода (необязательно)</Label>
            <Input
              id="url"
              placeholder="Например: https://example.com/offers"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isSending || !hasRequiredConfig}
            />
            <p className="text-sm text-muted-foreground">
              Если указан, уведомление будет содержать кнопку для перехода по этому URL
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSendNotification} 
            disabled={isSending || !hasRequiredConfig || !title || !message}
            className="w-full md:w-auto"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <SendIcon className="mr-2 h-4 w-4" />
                Отправить уведомление
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {lastSentResult && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Результат отправки</CardTitle>
            <CardDescription>
              Ответ от OneSignal API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-secondary p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(lastSentResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}