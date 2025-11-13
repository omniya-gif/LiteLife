import type { User } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

import { useUserStore } from '../lib/store/userStore';
import { supabase } from '../lib/supabase';
import { useOnboardingStore } from '../stores/onboardingStore';
import { useThemeStore } from '../stores/themeStore';
import { AuthError, SignUpData, SignInData } from '../types/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { clearUserData } = useUserStore();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }); 
    
    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUser = session?.user ?? null;
      const currentUserId = user?.id;

      // If user changed (including logout), clear cached user data
      if (currentUserId !== newUser?.id) {
        console.log(
          'User changed, clearing cached data. Old user:',
          currentUserId,
          'New user:',
          newUser?.id
        );
        clearUserData();
      }

      setUser(newUser);
    });

    return () => subscription.unsubscribe();
  }, [clearUserData]);

  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const signUp = async ({ email, password }: SignUpData): Promise<AuthError | null> => {
    // Validate inputs
    const emailError = validateEmail(email);
    if (emailError) return { message: emailError, field: 'email' };

    const passwordError = validatePassword(password);
    if (passwordError) return { message: passwordError, field: 'password' };

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Wait for the session to be properly established
      if (data.session) {
        setUser(data.session.user);
        // Add a small delay to ensure state is updated
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      return null;
    } catch (error: any) {
      return {
        message: error.message || 'An error occurred during sign up',
        field: error.field,
      };
    }
  };

  const signIn = async ({ email, password }: SignInData): Promise<AuthError | null> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return null;
    } catch (error: any) {
      return {
        message: error.message || 'Invalid email or password',
        field: error.field,
      };
    }
  };
  const signOut = async (): Promise<void> => {
    console.log('🚪 Signing out, clearing all user data');
    
    // Clear user data
    clearUserData();
    
    // Reset onboarding form
    const { resetFormData } = useOnboardingStore.getState();
    resetFormData();
    console.log('🧹 Onboarding form cleared');
    
    // Reset theme to default (green/male)
    const { setGender } = useThemeStore.getState();
    setGender('male');
    console.log('🎨 Theme reset to default (green)');
    
    await supabase.auth.signOut();
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };
}
