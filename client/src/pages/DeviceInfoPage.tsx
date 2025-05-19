import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Loader2, Copy, RotateCw, ArrowLeftCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "../hooks/use-toast";

export default function DeviceInfoPage() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Получение ID устройства из OneSignal
  const getDeviceId = async () => {
    setIsLoading(true);
    try {
      if (typeof window !== 'undefined' && window.OneSignal) {
        // Различные методы получения ID для разных версий OneSignal
        let id = null;

        // Сначала пробуем новый API (OneSignal v5+)
        try {
          await window.OneSignal.init({ appId: import.meta.env.VITE_ONESIGNAL_APP_ID });
          const deviceState = await window.OneSignal.getDeviceState();
          id = deviceState?.userId || null;
        } catch (e) {
          console.error("Ошибка при использовании нового API:", e);
        }

        // Если не получилось, пробуем старый API
        if (!id) {
          try {
            window.OneSignal.push(function() {
              window.OneSignal.getUserId(function(userId: string) {
                setDeviceId(userId);
                setIsLoading(false);
              });
            });
            // Не делаем здесь return, чтобы избежать асинхронной проблемы с коллбэком
          } catch (e) {
            console.error("Ошибка при использовании старого API:", e);
          }
        } else {
          setDeviceId(id);
        }
      } else {
        console.error("OneSignal не инициализирован");
        // Добавляем код для автоматической инициализации, если OneSignal не найден
        if (typeof window !== 'undefined') {
          if (!window.OneSignal) {
            window.OneSignal = [];
            
            // Динамически добавляем скрипт OneSignal
            const script = document.createElement('script');
            script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
            script.async = true;
            script.onload = () => {
              window.OneSignal.push(function() {
                window.OneSignal.init({
                  appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
                  allowLocalhostAsSecureOrigin: true,
                });
                window.OneSignal.getUserId(function(userId: string) {
                  setDeviceId(userId);
                  setIsLoading(false);
                });
              });
            };
            document.head.appendChild(script);
          }
        }
      }
    } catch (error) {
      console.error("Ошибка при получении ID устройства:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDeviceId();
  }, []);

  // Копирование ID в буфер обмена
  const copyDeviceId = () => {
    if (deviceId) {
      navigator.clipboard.writeText(deviceId).then(() => {
        toast({
          title: "Скопировано!",
          description: "ID устройства скопирован в буфер обмена",
          variant: "default"
        });
      }).catch(err => {
        console.error("Ошибка при копировании:", err);
        toast({
          title: "Ошибка",
          description: "Не удалось скопировать ID устройства",
          variant: "destructive"
        });
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="h-9">
            <ArrowLeftCircle className="mr-2 h-4 w-4" />
            <span className="whitespace-nowrap">Вернуться на главную</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Информация об устройстве</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>ID устройства для OneSignal</CardTitle>
          <CardDescription>
            Этот идентификатор используется для отправки push-уведомлений на ваше устройство.
            Если вы используете мобильное приложение, этот ID будет связан с вашим устройством.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : deviceId ? (
            <div className="p-4 bg-secondary rounded-md break-all font-mono">
              {deviceId}
            </div>
          ) : (
            <div className="text-center py-4 text-destructive">
              <p>Не удалось получить ID устройства.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Возможно, OneSignal не инициализирован или у вас отключены уведомления.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            onClick={getDeviceId}
            disabled={isLoading}
          >
            <RotateCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
          
          <Button 
            onClick={copyDeviceId}
            disabled={!deviceId || isLoading}
          >
            <Copy className="mr-2 h-4 w-4" />
            Копировать ID
          </Button>

          <Link href="/admin/push-notifications">
            <Button variant="secondary">
              Перейти к отправке уведомлений
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Отладочная информация</CardTitle>
          <CardDescription>
            Дополнительная информация о состоянии OneSignal и устройстве
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Окружение:</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {typeof window !== 'undefined' 
                  ? window.navigator.userAgent 
                  : 'Нет информации'}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">OneSignal App ID:</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {import.meta.env.VITE_ONESIGNAL_APP_ID || 'Не указан'}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">OneSignal загружен:</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {typeof window !== 'undefined' && window.OneSignal ? 'Да' : 'Нет'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}