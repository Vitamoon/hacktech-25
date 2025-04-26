import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from '../types';
import { mockAlerts } from '../data/mockData';

interface AlertContextType {
  alerts: Alert[];
  acknowledgeAlert: (alertId: string) => void;
  unreadAlertsCount: number;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  
  const acknowledgeAlert = (alertId: string) => {
    setAlerts(
      alerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };
  
  const unreadAlertsCount = alerts.filter(alert => !alert.acknowledged).length;
  
  return (
    <AlertContext.Provider value={{ alerts, acknowledgeAlert, unreadAlertsCount }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};