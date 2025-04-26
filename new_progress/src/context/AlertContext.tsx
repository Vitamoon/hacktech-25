import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from '../types';
import { mockAlerts } from '../data/mockData';

interface AlertContextProps {
  alerts: Alert[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const AlertContext = createContext<AlertContextProps>({
  alerts: [],
  markAsRead: () => {},
  markAllAsRead: () => {},
});

export const useAlertContext = () => useContext(AlertContext);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  const markAsRead = (id: string) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === id ? { ...alert, isRead: true } : alert
      )
    );
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map((alert) => ({ ...alert, isRead: true })));
  };

  // Check for new alerts periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, this would be an API call to fetch new alerts
      // For now, we'll leave it as-is since we're using mock data
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, markAsRead, markAllAsRead }}>
      {children}
    </AlertContext.Provider>
  );
};