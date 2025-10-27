import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useNotifications } from '../../hooks/useNotifications';
import * as Notifications from 'expo-notifications';

export function NotificationBell() {
  const router = useRouter();
  const { unreadCount } = useNotifications();

  // Test notification function
  const sendTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "This is a test notification!",
        sound: 'notification.wav',
        data: { type: 'test' },
      },
      trigger: { seconds: 1 },
    });
  };

  return (
    <TouchableOpacity 
      onPress={() => router.push('/notifications')}
      onLongPress={sendTestNotification} // Add long press to test notifications
      className="h-12 w-12 items-center justify-center rounded-full bg-[#25262B]"
    >
      <Bell size={24} color="#4ADE80" />
      {unreadCount > 0 && (
        <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-[#4ADE80]">
          <Text className="text-xs font-bold text-[#1A1B1E]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}