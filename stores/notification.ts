import { observable } from '@legendapp/state';

import { supabase } from '../lib/supabase';
import { NotificationStore } from '../types/notification';

export const notification$ = observable<NotificationStore>({
  notifications: [],
  unreadCount: 0,
  
  setNotifications: (notifications) => {
    const unreadCount = notifications.filter(n => !n.read).length;
    notification$.notifications.set(notifications);
    notification$.unreadCount.set(unreadCount);
  },
  
  markAsRead: async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
        
      if (error) throw error;
      
      const currentNotifications = notification$.notifications.peek();
      const updatedNotifications = currentNotifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      
      notification$.notifications.set(updatedNotifications);
      notification$.unreadCount.set(updatedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },
  
  markAllAsRead: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      const currentNotifications = notification$.notifications.peek();
      const updatedNotifications = currentNotifications.map(n => ({ ...n, read: true }));
      notification$.notifications.set(updatedNotifications);
      notification$.unreadCount.set(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }
});
