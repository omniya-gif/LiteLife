import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { format } from 'date-fns';
import { useNotifications } from '../../../hooks/useNotifications';
import Animated, { FadeInDown } from 'react-native-reanimated';

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'celebration':
      return 'bg-[#4ADE80]/10';
    case 'welcome':
      return 'bg-[#25262B]';
    default:
      return '';
  }
};

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text className="text-[#4ADE80]">Mark all read</Text>
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
                className={`border-b border-[#2C2D32] px-6 py-4 ${
                  !notification.read ? getNotificationColor(notification.type) : ''
                }`}
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
                    <View className={`h-3 w-3 rounded-full ${
                      notification.type === 'celebration' ? 'bg-[#4ADE80]' : 'bg-[#4ADE80]'
                    }`} />
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