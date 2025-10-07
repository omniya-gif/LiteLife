import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="journal" />
      <Stack.Screen name="recipes" />
      <Stack.Screen name="nutrition" />
      <Stack.Screen name="workouts" /> {/* Add Workouts screen */}
      <Stack.Screen name="favorites" /> {/* Add Favorites screen */}
      <Stack.Screen name="settings" /> {/* Add Settings screen */}
      <Stack.Screen name="chat" /> {/* Add Chat screen */}
      <Stack.Screen name="notifications" /> {/* Add Notifications screen */}
      <Stack.Screen name="cart" /> {/* Add Cart screen */}
    </Stack>
  );
}
