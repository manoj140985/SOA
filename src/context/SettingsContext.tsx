import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings } from '../types/settings';

interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  notifications: SystemNotification[];
  unreadNotificationCount: number;
  addNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  demoMode: true,
  gatewayBaseUrl: 'http://localhost:8080',
  defaultCohort: 'CSE-2026-A',
  workflowRefreshIntervalSec: 10,
  themePreference: 'light',
  autoSimulateKafkaLag: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('examguard_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'notif-1',
      title: 'Exposure Warning: CO2',
      message: 'Questions Q201 and Q202 have reached maximum exposure limit (2/2) in cohort CSE-2026-A.',
      type: 'warning',
      timestamp: '2026-10-26T14:45:00Z',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Paper Generated: PAPER-1001',
      message: 'Generated with PARTIAL status (62.5% outcome satisfaction). Event emitted to Kafka topic soa.s09.t14.events.',
      type: 'info',
      timestamp: '2026-10-26T15:00:02Z',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'WorkflowTracker Consumer Status',
      message: 'Acknowledged QuestionPaperGenerated event for PAPER-1001 with offset 142.',
      type: 'success',
      timestamp: '2026-10-26T15:00:05Z',
      read: true,
    },
  ]);

  useEffect(() => {
    localStorage.setItem('examguard_settings', JSON.stringify(settings));
    localStorage.setItem('examguard_demo_mode', String(settings.demoMode));
    localStorage.setItem('examguard_gateway_url', settings.gatewayBaseUrl);
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const addNotification = (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => {
    const item: SystemNotification = {
      ...notif,
      id: 'notif-' + Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [item, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        notifications,
        unreadNotificationCount,
        addNotification,
        markAllNotificationsRead,
        clearNotifications,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
