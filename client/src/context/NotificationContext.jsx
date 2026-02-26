import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Welcome to College 360', message: 'You have successfully integrated into the campus digital grid.', type: 'info', time: 'Just now', read: false },
    { id: 2, title: 'Security Protocol', message: 'Geofencing system is now active in your area.', type: 'success', time: '5m ago', read: false }
  ]);

  const addNotification = (notif) => {
    setNotifications(prev => [{
      id: Date.now(),
      time: 'Just now',
      read: false,
      ...notif
    }, ...prev]);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAllAsRead, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
