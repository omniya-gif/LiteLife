    // import React, { useEffect, useState } from 'react';
    // // eslint-disable-next-line import/no-duplicates
    // import { View, Text, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
    // // eslint-disable-next-line import/no-duplicates
    // import { Dimensions } from 'react-native';
    // import { SafeAreaView } from 'react-native-safe-area-context';
    // import { useRouter } from 'expo-router';
    // import { ArrowLeft, Footprints, Heart, Clock, Navigation2, Activity } from 'lucide-react-native';
    // import Animated, { FadeInDown } from 'react-native-reanimated';
    // import { initialize, requestPermission, readRecords } from 'react-native-health-connect';
    // import { CircularProgress } from '../../../../components/CircularProgress';
    // import { format } from 'date-fns';
    // import { LineChart } from 'react-native-chart-kit';

    // const { width } = Dimensions.get('window');

    // const STEPS_GOAL = 10000;
    // const HEART_POINTS_GOAL = 150;
    // const MOVE_MINUTES_GOAL = 60;

    // interface DailyStats {
    //   steps: number;
    //   heartPoints: number;
    //   distance: number;
    //   activeMinutes: number;
    //   calories: number;
    //   pace: number;
    // }

    // interface WeeklyTarget {
    //   current: number;
    //   target: number;
    //   startDate: string;
    //   endDate: string;
    // }

    // export default function StepsPage() {
    //   const router = useRouter();
    //   const [dailyStats, setDailyStats] = useState<DailyStats>({
    //     steps: 0,
    //     heartPoints: 0,
    //     distance: 0,
    //     activeMinutes: 0,
    //     calories: 0,
    //     pace: 0
    //   });
    //   const [weeklyTarget, setWeeklyTarget] = useState<WeeklyTarget>({
    //     current: 0,
    //     target: HEART_POINTS_GOAL,
    //     startDate: '',
    //     endDate: ''
    //   });
    //   const [weeklyData, setWeeklyData] = useState<number[]>([]);
    //   const [weekLabels, setWeekLabels] = useState<string[]>([]);

    //   useEffect(() => {
    //     initializeHealthConnect();
    //   }, []);

    //   const initializeHealthConnect = async () => {
    //     try {
    //       const isInitialized = await initialize();
    //       if (!isInitialized) {
    //         Alert.alert(
    //           "Health Connect Required",
    //           "Please install Health Connect to track your fitness data",
    //           [
    //             {
    //               text: "Install",
    //               onPress: () => {
    //                 Linking.openURL(
    //                   "https://play.google.com/store/apps/details?id=com.google.android.apps.healthconnect"
    //                 );
    //               },
    //             },
    //           ]
    //         );
    //         return;
    //       }

    //       const granted = await requestPermission([
    //         { accessType: 'read', recordType: 'Steps' },
    //         { accessType: 'read', recordType: 'Distance' },
    //         { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
    //         { accessType: 'read', recordType: 'TotalCaloriesBurned' },
    //         { accessType: 'read', recordType: 'Speed' },
    //         { accessType: 'read', recordType: 'HeartRate' },
    //         { accessType: 'read', recordType: 'ExerciseRoute' } // Changed from 'Exercise'
    //       ]);

    //       if (granted) {
    //         await Promise.all([
    //           fetchDailyStats(),
    //           fetchWeeklyData(),
    //           calculateWeeklyTarget()
    //         ]);
    //       }
    //     } catch (error) {
    //       console.error('Health Connect error:', error);
    //     }
    //   };

    //   const fetchDailyStats = async () => {
    //     const now = new Date();
    //     const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    //     const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    //     const timeRangeFilter = {
    //       operator: 'between',
    //       startTime: startOfDay.toISOString(),
    //       endTime: endOfDay.toISOString(),
    //     };

    //     try {
    //       const [stepsData, distanceData, caloriesData, exerciseData] = await Promise.all([
    //         readRecords('Steps', { timeRangeFilter }),
    //         readRecords('Distance', { timeRangeFilter }),
    //         readRecords('TotalCaloriesBurned', { timeRangeFilter }),
    //         readRecords('ExerciseRoute', { timeRangeFilter }) // Changed from 'Exercise'
    //       ]);

    //       const totalSteps = stepsData.reduce((sum, record) => sum + record.count, 0);
    //       const totalDistance = distanceData.reduce((sum, record) => sum + record.distance.inMeters, 0);
    //       const totalCalories = caloriesData.reduce((sum, record) => sum + record.energy.inKilocalories, 0);
        
    //       const activeMinutes = exerciseData.reduce((sum, record) => {
    //         const duration = new Date(record.endTime).getTime() - new Date(record.startTime).getTime();
    //         return sum + (duration / 1000 / 60);
    //       }, 0);

    //       // Calculate heart points (2 points per minute of moderate activity)
    //       const heartPoints = Math.round(activeMinutes * 2);

    //       // Calculate average pace (min/km)
    //       const pace = totalDistance > 0 ? (activeMinutes / (totalDistance / 1000)) : 0;

    //       setDailyStats({
    //         steps: totalSteps,
    //         heartPoints: heartPoints,
    //         distance: totalDistance / 1000, // Convert to km
    //         activeMinutes: Math.round(activeMinutes),
    //         calories: Math.round(totalCalories),
    //         pace: pace
    //       });
    //     } catch (error) {
    //       console.error('Error fetching daily stats:', error);
    //     }
    //   };

    //   const calculateWeeklyTarget = () => {
    //     const now = new Date();
    //     const startOfWeek = new Date(now);
    //     startOfWeek.setDate(now.getDate() - now.getDay());
    //     const endOfWeek = new Date(startOfWeek);
    //     endOfWeek.setDate(startOfWeek.getDate() + 6);

    //     setWeeklyTarget({
    //       current: dailyStats.heartPoints,
    //       target: HEART_POINTS_GOAL,
    //       startDate: format(startOfWeek, 'd MMM'),
    //       endDate: format(endOfWeek, 'd MMM')
    //     });
    //   };

    //   const fetchWeeklyData = async () => {
    //     try {
    //       const now = new Date();
    //       const startOfWeek = new Date(now);
    //       startOfWeek.setDate(now.getDate() - 6);
    //       startOfWeek.setHours(0, 0, 0, 0);

    //       const timeRangeFilter = {
    //         operator: 'between',
    //         startTime: startOfWeek.toISOString(),
    //         endTime: now.toISOString(),
    //       };

    //       const stepsData = await readRecords('Steps', { timeRangeFilter });
        
    //       // Initialize with default values to prevent undefined
    //       const dailySteps = new Array(7).fill(0);
    //       const labels = new Array(7).fill('');

    //       for (let i = 0; i < 7; i++) {
    //         const date = new Date(now);
    //         date.setDate(now.getDate() - (6 - i));
    //         labels[i] = format(date, 'EEE');
    //       }

    //       stepsData.forEach(record => {
    //         const recordDate = new Date(record.startTime);
    //         const dayIndex = Math.floor((recordDate.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24));
    //         if (dayIndex >= 0 && dayIndex < 7) {
    //           dailySteps[dayIndex] += record.count || 0; // Add fallback for undefined count
    //         }
    //       });

    //       // Ensure there are no undefined or null values
    //       const validatedData = dailySteps.map(steps => Number.isFinite(steps) ? steps : 0);

    //       setWeeklyData(validatedData);
    //       setWeekLabels(labels);
    //     } catch (error) {
    //       console.error('Error fetching weekly data:', error);
    //       // Set default data in case of error
    //       setWeeklyData(new Array(7).fill(0));
    //       setWeekLabels(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    //     }
    //   };

    //   return (
    //     <SafeAreaView className="flex-1 bg-[#1A1B1E]">
    //       <ScrollView>
    //         {/* Header */}
    //         <Animated.View 
    //           entering={FadeInDown.springify()}
    //           className="flex-row items-center justify-between px-6 pt-4"
    //         >
    //           <TouchableOpacity onPress={() => router.back()}>
    //             <ArrowLeft size={24} color="white" />
    //           </TouchableOpacity>
    //           <TouchableOpacity 
    //             onPress={() => router.push('/steps/journal')}
    //             className="rounded-full bg-[#4ADE80]/10 px-6 py-2"
    //           >
    //             <Text className="text-[#4ADE80]">Journal</Text>
    //           </TouchableOpacity>
    //         </Animated.View>

    //         {/* Main Progress Circle */}
    //         <View className="items-center justify-center py-12">
    //           <View className="relative">
    //             <CircularProgress
    //               size={240}
    //               strokeWidth={24}
    //               progress={dailyStats.steps / STEPS_GOAL}
    //               colors={['#4ADE80', '#22C55E', '#16A34A']}
    //             />
    //             <View className="absolute inset-0 items-center justify-center">
    //               <Text className="text-4xl font-bold text-white">{dailyStats.steps}</Text>
    //               <Text className="text-gray-400">steps</Text>
    //             </View>
    //           </View>
    //         </View>

    //         {/* Stats Grid */}
    //         <View className="flex-row flex-wrap justify-between px-6">
    //           <View className="mb-4 w-[48%] rounded-2xl bg-[#25262B] p-4">
    //             <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-[#4ADE80]/20">
    //               <Heart size={20} color="#4ADE80" />
    //             </View>
    //             <Text className="text-2xl font-bold text-white">{dailyStats.heartPoints}</Text>
    //             <Text className="text-sm text-gray-400">Heart Points</Text>
    //           </View>

    //           <View className="mb-4 w-[48%] rounded-2xl bg-[#25262B] p-4">
    //             <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-[#4ADE80]/20">
    //               <Navigation2 size={20} color="#4ADE80" />
    //             </View>
    //             <Text className="text-2xl font-bold text-white">{dailyStats.distance.toFixed(2)}</Text>
    //             <Text className="text-sm text-gray-400">Distance (km)</Text>
    //           </View>

    //           <View className="mb-4 w-[48%] rounded-2xl bg-[#25262B] p-4">
    //             <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-[#4ADE80]/20">
    //               <Clock size={20} color="#4ADE80" />
    //             </View>
    //             <Text className="text-2xl font-bold text-white">{dailyStats.activeMinutes}</Text>
    //             <Text className="text-sm text-gray-400">Move Minutes</Text>
    //           </View>

    //           <View className="mb-4 w-[48%] rounded-2xl bg-[#25262B] p-4">
    //             <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-[#4ADE80]/20">
    //               <Activity size={20} color="#4ADE80" />
    //             </View>
    //             <Text className="text-2xl font-bold text-white">{dailyStats.calories}</Text>
    //             <Text className="text-sm text-gray-400">Calories</Text>
    //           </View>
    //         </View>

    //         {/* Weekly Target */}
    //         <View className="mx-6 mb-8 rounded-2xl bg-[#25262B] p-6">
    //           <Text className="mb-2 text-lg font-bold text-white">Weekly Target</Text>
    //           <Text className="text-sm text-gray-400">
    //             {weeklyTarget.startDate} - {weeklyTarget.endDate}
    //           </Text>
    //           <View className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#1A1B1E]">
    //             <View 
    //               className="h-full bg-[#4ADE80]"
    //               style={{ width: `${(weeklyTarget.current / weeklyTarget.target) * 100}%` }}
    //             />
    //           </View>
    //           <Text className="mt-2 text-sm text-gray-400">
    //             {weeklyTarget.current} of {weeklyTarget.target} Heart Points
    //           </Text>
    //         </View>

    //         {/* Weekly Chart */}
    //         <View className="px-6 pb-8">
    //           <Text className="mb-4 text-xl font-bold text-white">This Week</Text>
    //           <View className="rounded-2xl bg-[#25262B] p-4">
    //             <LineChart
    //               data={{
    //                 labels: weekLabels,
    //                 datasets: [{
    //                   data: weeklyData.length > 0 ? weeklyData : [0], // Ensure non-empty data
    //                 }]
    //               }}
    //               width={width - 64}
    //               height={220}
    //               chartConfig={{
    //                 backgroundColor: '#25262B',
    //                 backgroundGradientFrom: '#25262B',
    //                 backgroundGradientTo: '#25262B',
    //                 decimalPlaces: 0,
    //                 color: (opacity = 1) => `rgba(74, 222, 128, ${opacity})`,
    //                 style: {
    //                   borderRadius: 16
    //                 },
    //                 propsForDots: {
    //                   r: '6',
    //                   strokeWidth: '2',
    //                   stroke: '#4ADE80'
    //                 }
    //               }}
    //               bezier
    //               style={{
    //                 marginVertical: 8,
    //                 borderRadius: 16
    //               }}
    //               withDots={true}
    //               withInnerLines={false}
    //               withOuterLines={false}
    //               withVerticalLines={false}
    //               withHorizontalLines={true}
    //               withVerticalLabels={true}
    //               withHorizontalLabels={true}
    //             />
    //           </View>
    //         </View>
    //       </ScrollView>
    //     </SafeAreaView>
    //   );
    // }