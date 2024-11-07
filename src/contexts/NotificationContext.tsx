import React, { createContext, useState, useCallback, useEffect } from 'react';
import { Notification, NotificationType } from '../types/notifications';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: NotificationType, message: string, isPermanent?: boolean) => void;
  removeNotification: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const addNotification = useCallback((
    type: NotificationType,
    message: string,
    isPermanent: boolean = false
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    const notification: Notification = {
      id,
      type,
      message,
      isPermanent,
      createdAt: Date.now()
    };

    setNotifications(prev => [...prev, notification]);

    if (!isPermanent) {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }
  }, [removeNotification]);

  // Nettoyage des notifications temporaires expirées
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setNotifications(prev => 
        prev.filter(notif => 
          notif.isPermanent || now - notif.createdAt < 5000
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}; 