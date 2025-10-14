// import { router } from 'expo-router';
// import { ArrowLeft } from 'lucide-react-native';
// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, Image, SafeAreaView, ActivityIndicator } from 'react-native';
// import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
// import { AuthInput } from '../../components/AuthInput';
// import { Svg, Circle } from 'react-native-svg';

// export default function SignUp() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSignUp = async () => {
//     setIsLoading(true);
//     setTimeout(() => {
//       setIsLoading(false);
//     }, 2000);
//   };

//   const CirclePattern = () => (
//     <Svg className="absolute top-0 w-full" height={320} viewBox="0 0 428 320" fill="none">
//       <Circle cx="400" cy="-40" r="200" fill="#84C94B" fillOpacity="0.05" />
//       <Circle cx="50" cy="-80" r="180" fill="#4263EB" fillOpacity="0.05" />
//       <Circle cx="350" cy="-20" r="160" fill="#FF6B6B" fillOpacity="0.05" />
//     </Svg>
//   );

//   return (
//     <SafeAreaView className="flex-1 bg-[#1A1B1E]">
//       <CirclePattern />
//       <Animated.View 
//         entering={FadeInDown.springify()}
//         className="flex-row items-center justify-between px-6 pt-12 pb-6"
//       >
//         <TouchableOpacity onPress={() => router.back()}>
//           <ArrowLeft size={24} color="white" />
//         </TouchableOpacity>
//         <Text className="text-2xl font-bold text-white">Create Account</Text>
//         <View style={{ width: 24 }} />
//       </Animated.View>

//       <Animated.View 
//         entering={FadeIn.delay(300).springify()}
//         className="px-6"
//       >
//         <Text className="text-3xl font-bold text-white mb-2">Create your account</Text>
//         <Text className="text-gray-400 text-lg mb-8">Fill in the details to get started</Text>
//       </Animated.View>

//       <Animated.View 
//         entering={FadeInUp.delay(400).springify()}
//         className="flex-1 rounded-t-[32px] bg-[#25262B] px-6 pt-8"
//       >
//         <View className="space-y-5">
//           <AuthInput
//             label="First Name"
//             value={firstName}
//             onChangeText={setFirstName}
//             placeholder="John"
//             autoCapitalize="words"
//             darkMode
//           />

//           <AuthInput
//             label="Last Name"
//             value={lastName}
//             onChangeText={setLastName}
//             placeholder="Doe"
//             autoCapitalize="words"
//             darkMode
//           />

//           <AuthInput
//             label="Email Address"
//             value={email}
//             onChangeText={setEmail}
//             placeholder="yourname@example.com"
//             keyboardType="email-address"
//             autoCapitalize="none"
//             darkMode
//           />

//           <AuthInput
//             label="Password"
//             value={password}
//             onChangeText={setPassword}
//             secureTextEntry={!showPassword}
//             placeholder="Create a strong password"
//             icon={showPassword ? "eye-off-outline" : "eye-outline"}
//             onIconPress={() => setShowPassword(!showPassword)}
//             darkMode
//           />

//           <TouchableOpacity
//             onPress={handleSignUp}
//             className="h-14 items-center justify-center rounded-full bg-[#84C94B]"
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <View className="flex-row items-center space-x-2">
//                 <ActivityIndicator color="white" />
//                 <Text className="text-white font-semibold text-lg">Creating account...</Text>
//               </View>
//             ) : (
//               <Text className="text-white font-semibold text-lg">Create Account</Text>
//             )}
//           </TouchableOpacity>

//           <View className="flex-row justify-center">
//             <Text className="text-gray-400 text-base">Already have an account? </Text>
//             <TouchableOpacity onPress={() => router.push('/signin')}>
//               <Text className="text-[#84C94B] font-semibold text-base">Sign in</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Animated.View>
//     </SafeAreaView>
//   );
// }