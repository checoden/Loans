import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/lib/protected-route";
import HomePage from "@/pages/HomePage";
import AdminPage from "@/pages/AdminPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import PushNotificationPage from "@/pages/PushNotificationPage";
import PushTestPage from "@/pages/PushTestPage";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import React, { useEffect } from "react";
import { initializeOneSignal } from "@/lib/onesignal";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/push-test" component={PushTestPage} />
      <ProtectedRoute path="/admin" component={AdminPage} adminOnly={true} />
      <ProtectedRoute path="/admin/push" component={PushNotificationPage} adminOnly={true} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Initialize OneSignal for push notifications
    const initPushNotifications = async () => {
      try {
        await initializeOneSignal();
      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
      }
    };
    
    initPushNotifications();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
