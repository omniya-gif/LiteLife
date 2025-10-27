export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'welcome' | 'update' | 'alert' | 'celebration';
  read: boolean;
  created_at: string;
}

export interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}
