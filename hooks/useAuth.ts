import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AuthError, SignUpData, SignInData } from '../types/auth';
import * as Notifications from 'expo-notifications';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const validateUsername = (username: string): string | null => {
    if (username.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return null;
  };

  const signUp = async ({ email, password, username }: SignUpData): Promise<AuthError | null> => {
    // Validate inputs
    const emailError = validateEmail(email);
    if (emailError) return { message: emailError, field: 'email' };

    const passwordError = validatePassword(password);
    if (passwordError) return { message: passwordError, field: 'password' };

    const usernameError = validateUsername(username);
    if (usernameError) return { message: usernameError, field: 'username' };

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });

      if (error) throw error;
      return null;
    } catch (error: any) {
      return { 
        message: error.message || 'An error occurred during sign up',
        field: error.field
      };
    }
  };

  const signIn = async ({ email, password }: SignInData): Promise<AuthError | null> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return null;
    } catch (error: any) {
      return { 
        message: error.message || 'Invalid email or password',
        field: error.field
      };
    }
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut
  };
}