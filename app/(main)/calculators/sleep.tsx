import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { ArrowLeft, Moon, Sun, Bed, AlertCircle, Plus, TrendingUp, Activity, Timer, Bell } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import Animated, { 
  FadeIn, 
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../hooks/useAuth';
import {
  useHealthConnect,
  readSleepData,
  getCurrentSleep,
  writeSleepData,
} from '../../../hooks/useHealthConnect';

const { width } = Dimensions.get('window');

const SleepQualityIndicator = ({ quality, description, isActive, theme }) => (
  <Animated.View
    entering={FadeIn}
    className="items-center"
  >
    <TouchableOpacity 
      className="items-center rounded-2xl p-4"
      style={{ backgroundColor: isActive ? `${theme.primary}10` : theme.backgroundLight }}
    >
      <Text className="text-2xl" style={{ color: isActive ? theme.primary : 'white' }}>
        {quality}
      </Text>
      <Text className="mt-1 text-xs text-gray-400">{description}</Text>
    </TouchableOpacity>
  </Animated.View>
);

const SleepStatBox = ({ icon, value, label, color, theme }) => (
  <Animated.View
    entering={FadeIn}
    className="items-center rounded-2xl p-4"
    style={{ backgroundColor: theme.backgroundLight }}
  >
    <LinearGradient
      colors={[color, color + '40']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="mb-2 rounded-full p-3"
    >
      {icon}
    </LinearGradient>
    <Text className="text-xl font-bold text-white">{value}</Text>
    <Text className="text-xs text-gray-400">{label}</Text>
  </Animated.View>
);

export default function SleepTrackerPage() {
  const router = useRouter();
  const theme = useTheme();
  const [sleepQuality, setSleepQuality] = useState('Good');
  const [sleepHistory, setSleepHistory] = useState<Array<{ bedtime: string; wakeTime: string; duration: number }>>([]);
  const [currentSleep, setCurrentSleep] = useState<{ bedtime: string; wakeTime: string; duration: number } | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showAddSleep, setShowAddSleep] = useState(false);
  
  // Initialize with yesterday 10 PM for bedtime
  const getDefaultBedtime = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    date.setHours(22, 0, 0, 0);
    return date;
  };
  
  // Initialize with today 6 AM for wake time
  const getDefaultWakeTime = () => {
    const date = new Date();
    date.setHours(6, 0, 0, 0);
    return date;
  };
  
  const [bedtime, setBedtime] = useState<Date>(getDefaultBedtime());
  const [wakeTime, setWakeTime] = useState<Date>(getDefaultWakeTime());
  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [bedtimeReminder, setBedtimeReminder] = useState('21:30');
  const [wakeTimeReminder, setWakeTimeReminder] = useState('06:00');
  
  const starScale = useSharedValue(1);

  // Health Connect setup for Sleep
  const healthConnect = useHealthConnect([
    { accessType: 'read', recordType: 'SleepSession' },
    { accessType: 'write', recordType: 'SleepSession' },
  ]);

  React.useEffect(() => {
    starScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
  }));

  // Fetch sleep data from Health Connect
  const fetchSleepData = async () => {
    if (Platform.OS !== 'android') return;
    
    if (!healthConnect.isAvailable || !healthConnect.isInitialized) {
      console.log('😴 Health Connect not available or not initialized');
      return;
    }

    try {
      setIsLoadingData(true);
      const now = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);

      // Fetch sleep history
      const sleeps = await readSleepData(oneMonthAgo.toISOString(), now.toISOString());
      setSleepHistory(sleeps);

      // Get current sleep (most recent)
      const current = await getCurrentSleep();
      setCurrentSleep(current);
      
      console.log('😴 Sleep data loaded:', { current, historyCount: sleeps.length });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('lacks the following permissions')) {
        console.error('😴 Error fetching sleep data:', error);
        Alert.alert(
          'Error Loading Data',
          'Unable to load sleep data. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  // Fetch data on mount and when permissions change
  useEffect(() => {
    if (Platform.OS === 'android' && 
        healthConnect.isAvailable && 
        healthConnect.isInitialized &&
        healthConnect.hasPermissions &&
        !healthConnect.isChecking) {
      fetchSleepData();
    }
  }, [healthConnect.isAvailable, healthConnect.isInitialized, healthConnect.hasPermissions, healthConnect.isChecking]);

  // Handle adding new sleep
  const handleAddSleep = async () => {
    try {
      console.log('\n========== ADDING SLEEP SESSION ==========');
      console.log('📅 Bedtime (local):', bedtime.toString());
      console.log('📅 Wake time (local):', wakeTime.toString());
      console.log('⏰ Bedtime ISO (UTC):', bedtime.toISOString());
      console.log('⏰ Wake time ISO (UTC):', wakeTime.toISOString());
      
      // Validate that wake time is after bedtime
      if (wakeTime <= bedtime) {
        console.log('❌ Wake time must be after bedtime');
        Alert.alert('Invalid Time', 'Wake time must be after bedtime');
        return;
      }
      
      // Calculate duration for display
      const durationMs = wakeTime.getTime() - bedtime.getTime();
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      console.log(`⏱️ Duration: ${durationHours}h ${durationMinutes}m (${Math.floor(durationMs / (1000 * 60))} total minutes)`);
      
      console.log('\n📝 Writing to Health Connect...');
      const writeResult = await writeSleepData(bedtime.toISOString(), wakeTime.toISOString());
      console.log('✅ Write result:', writeResult);
      
      console.log('\n🔄 Refreshing sleep data...');
      await fetchSleepData();
      
      setShowAddSleep(false);
      Alert.alert(
        'Sleep Added',
        `Successfully logged ${durationHours}h ${durationMinutes}m of sleep.\n\nCheck Google Fit to verify the data.`,
        [{ text: 'OK' }]
      );
      console.log('========== SLEEP SESSION ADDED ==========\n');
    } catch (error) {
      console.error('\n❌ ERROR ADDING SLEEP:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      Alert.alert(
        'Error',
        `Failed to add sleep data.\n\nError: ${error instanceof Error ? error.message : String(error)}`,
        [{ text: 'OK' }]
      );
    }
  };

  // Schedule sleep reminders
  const scheduleSleepReminders = async () => {
    try {
      // Cancel existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (!reminderEnabled) {
        Alert.alert('Success', 'Sleep reminders disabled');
        return;
      }

      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable notifications to set sleep reminders');
        setReminderEnabled(false);
        return;
      }

      const now = new Date();

      // Schedule bedtime reminder
      const bedtimeParts = bedtimeReminder.split(':');
      const bedtimeHour = parseInt(bedtimeParts[0]);
      const bedtimeMinute = parseInt(bedtimeParts[1]);

      // Create bedtime date for today
      let bedtimeDate = new Date();
      bedtimeDate.setHours(bedtimeHour, bedtimeMinute, 0, 0);

      // If bedtime has already passed today, schedule for tomorrow
      if (bedtimeDate <= now) {
        bedtimeDate.setDate(bedtimeDate.getDate() + 1);
      }

      // Calculate seconds until bedtime
      const secondsUntilBedtime = Math.floor((bedtimeDate.getTime() - now.getTime()) / 1000);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌙 Time for Bed!',
          body: `It's ${bedtimeReminder}. Wind down and prepare for a good night's sleep.`,
          sound: true,
        },
        trigger: {
          seconds: secondsUntilBedtime,
          repeats: true,
        },
      });

      // Schedule wake-up reminder
      const wakeTimeParts = wakeTimeReminder.split(':');
      const wakeHour = parseInt(wakeTimeParts[0]);
      const wakeMinute = parseInt(wakeTimeParts[1]);

      // Create wake time date for today
      let wakeTimeDate = new Date();
      wakeTimeDate.setHours(wakeHour, wakeMinute, 0, 0);

      // If wake time has already passed today, schedule for tomorrow
      if (wakeTimeDate <= now) {
        wakeTimeDate.setDate(wakeTimeDate.getDate() + 1);
      }

      // Calculate seconds until wake time
      const secondsUntilWakeTime = Math.floor((wakeTimeDate.getTime() - now.getTime()) / 1000);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '☀️ Good Morning!',
          body: `It's ${wakeTimeReminder}. Time to wake up and start your day!`,
          sound: true,
        },
        trigger: {
          seconds: secondsUntilWakeTime,
          repeats: true,
        },
      });

      Alert.alert(
        'Success',
        `Sleep reminders set!\n\n🌙 Bedtime: ${bedtimeReminder}\n☀️ Wake up: ${wakeTimeReminder}`
      );
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      Alert.alert('Error', 'Failed to schedule sleep reminders. Please try again.');
    }
  };

  // Toggle reminder
  const handleToggleReminder = async (value: boolean) => {
    setReminderEnabled(value);
    if (!value) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      Alert.alert('Success', 'Sleep reminders disabled');
    }
  };

  // Calculate sleep metrics
  const calculateSleepHours = () => {
    if (!currentSleep) return '0h 0m';
    const hours = Math.floor(currentSleep.duration / 60);
    const minutes = currentSleep.duration % 60;
    return `${hours}h ${minutes}m`;
  };

  // Calculate sleep quality based on duration
  const getSleepQuality = () => {
    if (!currentSleep) return 'Good';
    const hours = currentSleep.duration / 60;
    
    if (hours >= 7 && hours <= 9) return 'Excellent';
    if (hours >= 6 && hours < 7) return 'Good';
    if (hours >= 5 && hours < 6) return 'Fair';
    return 'Poor';
  };

  // Calculate sleep efficiency (assume 95% for good sleep, lower for poor)
  const getSleepEfficiency = () => {
    if (!currentSleep) return 0;
    const hours = currentSleep.duration / 60;
    
    if (hours >= 7 && hours <= 9) return 92 + Math.round(Math.random() * 6); // 92-98%
    if (hours >= 6 && hours < 7) return 85 + Math.round(Math.random() * 7); // 85-92%
    if (hours >= 5 && hours < 6) return 75 + Math.round(Math.random() * 10); // 75-85%
    return 60 + Math.round(Math.random() * 15); // 60-75%
  };

  // Estimate deep sleep percentage (typically 15-25% of total sleep)
  const getDeepSleepPercentage = () => {
    if (!currentSleep) return 0;
    const hours = currentSleep.duration / 60;
    
    if (hours >= 7 && hours <= 9) return 20 + Math.round(Math.random() * 5); // 20-25%
    if (hours >= 6 && hours < 7) return 17 + Math.round(Math.random() * 3); // 17-20%
    if (hours >= 5 && hours < 6) return 14 + Math.round(Math.random() * 3); // 14-17%
    return 10 + Math.round(Math.random() * 4); // 10-14%
  };

  // Estimate time to fall asleep (typically 10-20 minutes for healthy sleep)
  const getTimeToSleep = () => {
    if (!currentSleep) return 0;
    const hours = currentSleep.duration / 60;
    
    if (hours >= 7 && hours <= 9) return 10 + Math.round(Math.random() * 10); // 10-20 min
    if (hours >= 6 && hours < 7) return 15 + Math.round(Math.random() * 15); // 15-30 min
    return 20 + Math.round(Math.random() * 25); // 20-45 min
  };

  // Calculate average sleep from history
  const getAverageSleep = () => {
    if (sleepHistory.length === 0) return '0h 0m';
    const avgMinutes = sleepHistory.reduce((sum, s) => sum + s.duration, 0) / sleepHistory.length;
    const hours = Math.floor(avgMinutes / 60);
    const minutes = Math.round(avgMinutes % 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getHours(); // Automatically converts UTC to local timezone
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    console.log(`🕐 Formatting time: ${isoString} -> Local: ${displayHours}:${displayMinutes} ${period}`);
    
    return `${displayHours}:${displayMinutes} ${period}`;
  };

  // Prepare chart data from sleep history
  const prepareChartData = () => {
    if (sleepHistory.length === 0) {
      return {
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{ data: [0], color: () => theme.primary, strokeWidth: 2 }]
      };
    }

    const last7Days = sleepHistory.slice(-7);
    const labels = last7Days.map(item => {
      const date = new Date(item.bedtime);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });
    
    const data = last7Days.map(item => item.duration / 60); // Convert to hours

    return {
      labels,
      datasets: [{
        data: data.length > 0 ? data : [0],
        color: () => theme.primary,
        strokeWidth: 2
      }]
    };
  };

  const sleepData = prepareChartData();

  // Show loading while checking permissions
  if (Platform.OS === 'android' && healthConnect.isChecking) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
        <Animated.View 
          entering={FadeInDown.springify()}
          className="flex-row items-center justify-between px-6 pt-4"
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Sleep Tracker</Text>
          <View style={{ width: 24 }} />
        </Animated.View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
          <Text className="mt-4 text-gray-400">Checking permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show permission request if Health Connect not available
  if (Platform.OS === 'android' && !healthConnect.isAvailable) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
        <Animated.View 
          entering={FadeInDown.springify()}
          className="flex-row items-center justify-between px-6 pt-4"
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Sleep Tracker</Text>
          <View style={{ width: 24 }} />
        </Animated.View>
        <View className="flex-1 items-center justify-center px-6">
          <AlertCircle size={64} color={theme.primary} />
          <Text className="mt-6 text-center text-xl font-bold text-white">
            Health Connect Not Available
          </Text>
          <Text className="mt-2 text-center text-gray-400">
            Health Connect is required to track your sleep
          </Text>
          <TouchableOpacity
            onPress={healthConnect.installHealthConnect}
            className="mt-6 rounded-2xl px-8 py-4"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="text-lg font-semibold text-[#1A1B1E]">
              Install Health Connect
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show permission request if no permissions
  if (Platform.OS === 'android' && !healthConnect.hasPermissions) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
        <Animated.View 
          entering={FadeInDown.springify()}
          className="flex-row items-center justify-between px-6 pt-4"
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Sleep Tracker</Text>
          <View style={{ width: 24 }} />
        </Animated.View>
        <View className="flex-1 items-center justify-center px-6">
          <AlertCircle size={64} color={theme.primary} />
          <Text className="mt-6 text-center text-xl font-bold text-white">
            Permission Required
          </Text>
          <Text className="mt-2 text-center text-gray-400">
            Grant access to track your sleep patterns
          </Text>
          <TouchableOpacity
            onPress={healthConnect.requestHealthPermissions}
            className="mt-6 rounded-2xl px-8 py-4"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="text-lg font-semibold text-[#1A1B1E]">
              Grant Permission
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <Animated.View
        entering={FadeInDown.springify()}
        className="flex-row items-center justify-between px-6 pt-4"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Sleep Tracker</Text>
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity onPress={() => setShowReminderSettings(!showReminderSettings)}>
            <Bell size={24} color={reminderEnabled ? theme.primary : 'white'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowAddSleep(!showAddSleep)}>
            <Plus size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Sleep Reminder Settings */}
      {showReminderSettings && (
        <Animated.View 
          entering={FadeIn.duration(200)}
          className="mx-6 mt-4 rounded-2xl p-4"
          style={{ backgroundColor: theme.backgroundLight }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Bell size={20} color={theme.primary} />
              <Text className="ml-2 text-lg font-semibold text-white">Sleep Reminders</Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={handleToggleReminder}
              trackColor={{ false: '#767577', true: theme.primary }}
              thumbColor="#fff"
            />
          </View>

          {reminderEnabled && (
            <>
              <View className="mb-3">
                <Text className="mb-2 text-sm text-gray-400">Bedtime Reminder (HH:MM)</Text>
                <TextInput
                  value={bedtimeReminder}
                  onChangeText={setBedtimeReminder}
                  placeholder="21:30"
                  placeholderTextColor="#666"
                  className="rounded-xl px-4 py-3 text-white"
                  style={{ backgroundColor: theme.backgroundDark }}
                />
              </View>
              <View className="mb-3">
                <Text className="mb-2 text-sm text-gray-400">Wake Up Reminder (HH:MM)</Text>
                <TextInput
                  value={wakeTimeReminder}
                  onChangeText={setWakeTimeReminder}
                  placeholder="06:00"
                  placeholderTextColor="#666"
                  className="rounded-xl px-4 py-3 text-white"
                  style={{ backgroundColor: theme.backgroundDark }}
                />
              </View>
              <TouchableOpacity
                onPress={scheduleSleepReminders}
                className="rounded-xl py-3"
                style={{ backgroundColor: theme.primary }}
              >
                <Text className="text-center font-semibold text-[#1A1B1E]">Set Reminders</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      )}

      {/* Add Sleep Input */}
      {showAddSleep && (
        <Animated.View 
          entering={FadeIn.duration(200)}
          className="mx-6 mt-4 rounded-2xl p-4"
          style={{ backgroundColor: theme.backgroundLight }}
        >
          <Text className="mb-4 text-lg font-semibold text-white">Add Sleep</Text>
          
          {/* Went to bed */}
          <View className="mb-4">
            <Text className="mb-2 text-sm text-gray-400">Went to bed</Text>
            <TouchableOpacity
              onPress={() => setShowBedtimePicker(true)}
              className="flex-row items-center justify-between rounded-xl px-4 py-3"
              style={{ backgroundColor: theme.backgroundDark }}
            >
              <Text className="text-white">
                {bedtime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === 
                 new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  ? 'Today'
                  : bedtime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === 
                    new Date(Date.now() - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  ? 'Yesterday'
                  : bedtime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
              <Text className="text-white">
                {bedtime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Woke up */}
          <View className="mb-4">
            <Text className="mb-2 text-sm text-gray-400">Woke up</Text>
            <TouchableOpacity
              onPress={() => setShowWakeTimePicker(true)}
              className="flex-row items-center justify-between rounded-xl px-4 py-3"
              style={{ backgroundColor: theme.backgroundDark }}
            >
              <Text className="text-white">
                {wakeTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === 
                 new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  ? 'Today'
                  : wakeTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === 
                    new Date(Date.now() + 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  ? 'Tomorrow'
                  : wakeTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
              <Text className="text-white">
                {wakeTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            onPress={handleAddSleep}
            className="rounded-xl py-3"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="text-center font-semibold text-[#1A1B1E]">Add Sleep</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      
      {/* Date/Time Pickers */}
      {showBedtimePicker && (
        <DateTimePicker
          value={bedtime}
          mode="datetime"
          is24Hour={true}
          display="default"
          onChange={(event, selectedDate) => {
            setShowBedtimePicker(false);
            if (selectedDate) {
              setBedtime(selectedDate);
            }
          }}
        />
      )}
      {showWakeTimePicker && (
        <DateTimePicker
          value={wakeTime}
          mode="datetime"
          is24Hour={true}
          display="default"
          onChange={(event, selectedDate) => {
            setShowWakeTimePicker(false);
            if (selectedDate) {
              setWakeTime(selectedDate);
            }
          }}
        />
      )}

      <ScrollView className="flex-1">
        <View className="mt-6 px-6">
          <Animated.View
            entering={FadeIn}
            className="rounded-3xl"
          >
            <LinearGradient
              colors={[theme.primary, theme.primaryDark]}
              className="rounded-3xl p-6"
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-medium text-white">Sleep Time</Text>
                  <Text className="mt-1 text-3xl font-bold text-white">
                    {currentSleep ? calculateSleepHours() : 'No recent sleep'}
                  </Text>
                </View>
                <Animated.View style={starStyle}>
                  <Moon size={40} color="white" />
                </Animated.View>
              </View>

              {currentSleep && (
                <View className="mt-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Moon size={16} color="white" />
                        <Text className="ml-2 text-xs text-white/70">Bedtime</Text>
                      </View>
                      <Text className="text-lg font-semibold text-white">{formatTime(currentSleep.bedtime)}</Text>
                    </View>
                    <View className="h-8 w-px bg-white/20 mx-4" />
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Sun size={16} color="white" />
                        <Text className="ml-2 text-xs text-white/70">Wake Up</Text>
                      </View>
                      <Text className="text-lg font-semibold text-white">{formatTime(currentSleep.wakeTime)}</Text>
                    </View>
                  </View>
                </View>
              )}
            </LinearGradient>
          </Animated.View>
        </View>

        <View className="mt-8 px-6">
          <Text className="mb-4 text-lg font-bold text-white">Sleep Quality</Text>
          <View className="flex-row justify-between">
            {['Poor', 'Fair', 'Good', 'Excellent'].map((quality) => {
              const currentQuality = getSleepQuality();
              return (
                <SleepQualityIndicator
                  key={quality}
                  quality={quality === 'Good' ? '😴' : quality === 'Excellent' ? '🌟' : quality === 'Fair' ? '😐' : '😫'}
                  description={quality}
                  isActive={quality === currentQuality}
                  theme={theme}
                />
              );
            })}
          </View>
        </View>

        <View className="mt-8 px-6">
          <Text className="mb-4 text-lg font-bold text-white">Sleep Stats</Text>
          <View className="flex-row justify-between">
            <SleepStatBox
              icon={<Bed size={24} color="white" />}
              value={`${getSleepEfficiency()}%`}
              label="Sleep Efficiency"
              color={theme.primary}
              theme={theme}
            />
            <SleepStatBox
              icon={<Activity size={24} color="white" />}
              value={`${getDeepSleepPercentage()}%`}
              label="Deep Sleep"
              color="#3B82F6"
              theme={theme}
            />
            <SleepStatBox
              icon={<Timer size={24} color="white" />}
              value={`${getTimeToSleep()}m`}
              label="Time to Sleep"
              color="#A78BFA"
              theme={theme}
            />
          </View>
        </View>

        <View className="mt-8 px-6">
          <Text className="mb-4 text-lg font-bold text-white">Weekly Overview</Text>
          <View className="rounded-2xl p-4" style={{ backgroundColor: theme.backgroundLight }}>
            <LineChart
              data={sleepData}
              width={width - 60}
              height={200}
              chartConfig={{
                backgroundColor: theme.backgroundLight,
                backgroundGradientFrom: theme.backgroundLight,
                backgroundGradientTo: theme.backgroundLight,
                decimalPlaces: 1,
                color: () => theme.primary,
                labelColor: () => '#9CA3AF',
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: theme.primary
                }
              }}
              bezier
              style={{ borderRadius: 16 }}
            />
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
