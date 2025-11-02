// import { create } from 'zustand';
// import { supabase } from '../lib/supabase';
// import { router } from 'expo-router';
// import { Alert } from 'react-native';
// import { Session, User } from '@supabase/supabase-js';
// import * as WebBrowser from 'expo-web-browser';
// import * as Linking from 'expo-linking';
// import * as QueryParams from 'expo-auth-session/build/QueryParams';

// interface AuthState {
//   // State
//   user: User | null;
//   session: Session | null;
//   loading: boolean;
//   onboardingCompleted: boolean | null;
  
//   // Auth Actions
//   signIn: (email: string, password: string) => Promise<void>;
//   signUp: (email: string, password: string, username: string) => Promise<void>;
//   signOut: () => Promise<void>;
  
//   // Social Auth
//   socialLoginInProgress: boolean;
//   lastSocialProvider: string | null;
//   handleSocialLogin: (provider: 'google') => Promise<void>;
//   processSocialLoginCallback: (url: string) => Promise<void>;
  
//   // Session Management
//   initialize: () => Promise<void>;
//   setSession: (session: Session | null) => void;
//   setUser: (user: User | null) => void;
//   setOnboardingCompleted: (completed: boolean) => void;
  
//   // Loading State
//   setLoading: (loading: boolean) => void;
// }

// const DEFAULT_PROFILE_DATA = {
//   username: '',
//   age: 25,
//   height: 170,
//   current_weight: 70,
//   target_weight: 70,
//   gender: 'male' as const,
//   daily_calories: 2000,
// };

// const DEFAULT_ONBOARDING_DATA = {
//   user_id: '', // Will be set during creation
//   completed: false,
//   reason: 'Personal health improvement',
//   notifications_enabled: false,
//   interests: ['nutrition'],
//   expertise: 'beginner' as const,
//   goal: 'improve_health' as const,
// };

// export const useAuthStore = create<AuthState>((set, get) => ({
//   // Initial State
//   user: null,
//   session: null,
//   loading: true,
//   onboardingCompleted: null,
//   socialLoginInProgress: false,
//   lastSocialProvider: null,

//   // Initialize auth state
//   initialize: async () => {
//     try {
//       const { data: { session } } = await supabase.auth.getSession();
      
//       if (session?.user) {
//         // Check onboarding status
//         const { data: onboarding } = await supabase
//           .from('user_onboarding')
//           .select('completed')
//           .eq('user_id', session.user.id)
//           .single();

//         set({ 
//           session,
//           user: session.user,
//           onboardingCompleted: onboarding?.completed ?? false
//         });
//       }
//     } catch (error) {
//       console.error('Error initializing auth:', error);
//     } finally {
//       set({ loading: false });
//     }
//   },

//   // Regular Authentication
//   signIn: async (email: string, password: string) => {
//     try {
//       set({ loading: true });
      
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email: email.trim(),
//         password
//       });

//       if (error) throw error;

//       if (data.session) {
//         set({ 
//           session: data.session,
//           user: data.session.user
//         });

//         // Get existing onboarding record
//         const { data: onboarding } = await supabase
//           .from('user_onboarding')
//           .select('completed')
//           .eq('user_id', data.session.user.id)
//           .single();

//         const completed = onboarding?.completed ?? false;
//         set({ onboardingCompleted: completed });

//         // Redirect based on onboarding status
//         router.replace(completed ? '/(main)/home' : '/onboarding/expertise');
//       }
//     } catch (error: any) {
//       Alert.alert('Error', error.message);
//     } finally {
//       set({ loading: false });
//     }
//   },

//   signUp: async (email: string, password: string, username: string) => {
//     try {
//       set({ loading: true });
      
//       const { data, error } = await supabase.auth.signUp({
//         email: email.trim(),
//         password,
//         options: {
//           data: { username }
//         }
//       });

//       if (error) throw error;

//       if (data.session) {
//         // Create user profile first
//         const { error: profileError } = await supabase
//           .from('profiles')
//           .insert({
//             id: data.session.user.id,
//             ...DEFAULT_PROFILE_DATA,
//             username
//           });

//         if (profileError) throw profileError;

//         // Then create onboarding status
//         const { error: onboardingError } = await supabase
//           .from('onboarding_status') // Assuming this is your onboarding table name
//           .insert({
//             user_id: data.session.user.id,
//             ...DEFAULT_ONBOARDING_DATA,
//           });

//         if (onboardingError) throw onboardingError;

//         set({ 
//           session: data.session,
//           user: data.session.user,
//           onboardingCompleted: false
//         });
        
//         router.replace('/onboarding/expertise');
//       }
//     } catch (error: any) {
//       console.error('Signup error:', error);
//       Alert.alert('Error', error.message);
//     } finally {
//       set({ loading: false });
//     }
//   },

//   signOut: async () => {
//     try {
//       set({ loading: true });
//       await supabase.auth.signOut();
//       set({ 
//         user: null, 
//         session: null,
//         onboardingCompleted: null
//       });
//       router.replace('/signin');
//     } catch (error: any) {
//       Alert.alert('Error', error.message);
//     } finally {
//       set({ loading: false });
//     }
//   },

//   // Social Authentication
//   handleSocialLogin: async (provider: 'google') => {
//     try {
//       set({ 
//         socialLoginInProgress: true,
//         lastSocialProvider: provider
//       });

//       const redirectUrl = Linking.createURL('auth/callback');

//       const { data, error } = await supabase.auth.signInWithOAuth({
//         provider,
//         options: {
//           redirectTo: redirectUrl,
//           skipBrowserRedirect: true,
//           queryParams: {
//             access_type: 'offline',
//             prompt: 'consent'
//           }
//         }
//       });

//       if (error) throw error;

//       const result = await WebBrowser.openAuthSessionAsync(
//         data?.url ?? '',
//         redirectUrl,
//         {
//           showInRecents: true,
//           createTask: false,
//           enableDefaultShareMenuItem: false
//         }
//       );

//       if (result.type !== 'success') {
//         set({ socialLoginInProgress: false });
//       }
//     } catch (error: any) {
//       console.error('Social login error:', error);
//       Alert.alert('Error', 'Failed to sign in. Please try again.');
//       set({ socialLoginInProgress: false });
//     }
//   },

//   processSocialLoginCallback: async (url: string) => {
//     try {
//       const { params, errorCode } = QueryParams.getQueryParams(url);
//       if (errorCode) throw new Error(errorCode);

//       const { access_token, refresh_token } = params;
//       if (!access_token) return;

//       const { data, error } = await supabase.auth.setSession({
//         access_token,
//         refresh_token,
//       });

//       if (error) throw error;

//       if (data.session) {
//         // Check if profile exists
//         const { data: existingProfile } = await supabase
//           .from('profiles')
//           .select('*')
//           .eq('id', data.session.user.id)
//           .single();

//         // If no profile exists, create one
//         if (!existingProfile) {
//           await supabase
//             .from('profiles')
//             .insert({
//               id: data.session.user.id,
//               ...DEFAULT_PROFILE_DATA,
//               username: data.session.user.email?.split('@')[0] // Default username
//             });
//         }

//         // Check onboarding status
//         const { data: onboardingStatus } = await supabase
//           .from('onboarding_status')
//           .select('completed')
//           .eq('user_id', data.session.user.id)
//           .single();

//         if (!onboardingStatus) {
//           // Create onboarding status if it doesn't exist
//           await supabase
//             .from('onboarding_status')
//             .insert({
//               user_id: data.session.user.id,
//               ...DEFAULT_ONBOARDING_DATA,
//             });
//         }

//         set({ 
//           session: data.session,
//           user: data.session.user,
//           onboardingCompleted: onboardingStatus?.completed ?? false,
//           socialLoginInProgress: false
//         });

//         router.replace(onboardingStatus?.completed ? '/(main)/home' : '/onboarding/expertise');
//       }
//     } catch (error) {
//       console.error('Error processing social login:', error);
//       Alert.alert('Error', 'Failed to complete sign in. Please try again.');
//       set({ socialLoginInProgress: false });
//     }
//   },

//   // State Setters
//   setSession: (session) => set({ session }),
//   setUser: (user) => set({ user }),
//   setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),
//   setLoading: (loading) => set({ loading })
// }));

// // Set up auth state listener
// supabase.auth.onAuthStateChange((event, session) => {
//   const store = useAuthStore.getState();
  
//   if (session?.user) {
//     store.setSession(session);
//     store.setUser(session.user);
//   } else {
//     store.setSession(null);
//     store.setUser(null);
//   }
// });