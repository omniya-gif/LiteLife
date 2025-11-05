import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { format } from 'date-fns';
import { useNotifications } from '../../../hooks/useNotifications';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../../hooks/useTheme';

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const theme = useTheme();

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'celebration':
        return `${theme.primary}10`;
      case 'welcome':
        return theme.backgroundLight;
      default:
        return 'transparent';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={{ color: theme.primary }}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1">
        {notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-gray-400">No notifications yet</Text>
          </View>
        ) : (
          notifications.map((notification, index) => (
            <Animated.View
              key={notification.id}
              entering={FadeInDown.delay(index * 100)}
            >
              <TouchableOpacity
                onPress={() => markAsRead(notification.id)}
                className="border-b border-[#2C2D32] px-6 py-4"
                style={{ backgroundColor: !notification.read ? getNotificationColor(notification.type) : 'transparent' }}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-medium text-white">
                      {notification.title}
                    </Text>
                    <Text className="mt-1 text-gray-400">
                      {notification.message}
                    </Text>
                    <Text className="mt-2 text-sm text-gray-500">
                      {format(new Date(notification.created_at), 'MMM d, yyyy')}
                    </Text>
                  </View>
                  {!notification.read && (
                    <View className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.primary }} />
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}