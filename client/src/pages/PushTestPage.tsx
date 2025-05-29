import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Bell, AlertCircle } from "lucide-react";

export default function PushTestPage() {
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const checkPushSupport = () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    addTestResult(supported ? 'Push API поддерживается' : 'Push API не поддерживается');
    return supported;
  };

  const checkPermission = async () => {
    if (!checkPushSupport()) return;
    
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      addTestResult(`Статус разрешений: ${permission}`);
      
      if (permission === 'granted') {
        addTestResult('Разрешения получены успешно');
      } else {
        addTestResult('Разрешения отклонены пользователем');
      }
    } catch (error) {
      addTestResult(`Ошибка при запросе разрешений: ${error}`);
    }
  };

  const testOneSignal = () => {
    if (typeof window !== 'undefined' && window.OneSignal) {
      addTestResult('OneSignal загружен успешно');
      
      window.OneSignal.Slidedown.promptPush().then(() => {
        addTestResult('OneSignal prompt отображен');
      }).catch((error: any) => {
        addTestResult(`Ошибка OneSignal prompt: ${error}`);
      });
    } else {
      addTestResult('OneSignal не загружен или недоступен');
    }
  };

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getPermissionBadge = () => {
    switch (permissionStatus) {
      case 'granted':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-4 h-4 mr-1" />Разрешено</Badge>;
      case 'denied':
        return <Badge variant="destructive"><XCircle className="w-4 h-4 mr-1" />Отклонено</Badge>;
      case 'default':
        return <Badge variant="secondary"><AlertCircle className="w-4 h-4 mr-1" />Не запрашивалось</Badge>;
      default:
        return <Badge variant="outline">Неизвестно</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Тестирование Push-уведомлений</h1>
        <p className="text-muted-foreground">
          Проверка работы push-уведомлений в веб-браузере и мобильном приложении
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Статус поддержки
            </CardTitle>
            <CardDescription>
              Проверка возможностей браузера
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Push API:</span>
              {isSupported ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-4 h-4 mr-1" />Поддерживается
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-4 h-4 mr-1" />Не поддерживается
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Разрешения:</span>
              {getPermissionBadge()}
            </div>
            <Button onClick={checkPushSupport} className="w-full">
              Проверить поддержку
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Тестирование</CardTitle>
            <CardDescription>
              Запрос разрешений и проверка OneSignal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkPermission} className="w-full" disabled={!isSupported}>
              Запросить разрешения
            </Button>
            <Button onClick={testOneSignal} className="w-full" variant="outline">
              Тест OneSignal
            </Button>
            <Button onClick={clearResults} className="w-full" variant="secondary">
              Очистить результаты
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Результаты тестирования</CardTitle>
          <CardDescription>
            Логи проверки push-уведомлений
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg min-h-[200px] max-h-[400px] overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-muted-foreground italic">
                Нажмите кнопки выше для начала тестирования
              </p>
            ) : (
              <div className="space-y-1 font-mono text-sm">
                {testResults.map((result, index) => (
                  <div key={index} className="border-b border-gray-200 pb-1">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Инструкции</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Для веб-браузера:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Проверьте, что ваш браузер поддерживает Push API</li>
              <li>Разрешите уведомления для этого сайта</li>
              <li>Проверьте работу OneSignal</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Для мобильного приложения:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>При первом запуске появится запрос разрешений</li>
              <li>Разрешения должны запрашиваться через Capacitor API</li>
              <li>На Android 13+ требуется POST_NOTIFICATIONS разрешение</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}