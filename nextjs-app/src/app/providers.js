'use client';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import MainLayout from '@/components/MainLayout';
import ChatBot from '@/components/ChatBot';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <MainLayout>
            {children}
          </MainLayout>
          <ChatBot />
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
