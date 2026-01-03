import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useValue } from '@legendapp/state/react';
import { useAuth } from '../../hooks/useAuth';
import { onboarding$ } from '../../stores/onboarding';
import { supabase } from '../../lib/supabase';
import Loader from '../Loader';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const completed = useValue(onboarding$.completed);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const [shouldRedirectToOnboarding, setShouldRedirectToOnboarding] = useState(false);

  useEffect(() => {
    const checkUserOnboarding = async () => {
      if (!user) return;

      try {
        const { data: onboardingData } = await supabase
          .from('user_onboarding')
          .select('completed')
          .eq('user_id', user.id)
          .single();

        // If we have onboarding data and it's not completed, redirect to onboarding
        if (onboardingData && !onboardingData.completed) {
          setShouldRedirectToOnboarding(true);
        }
      } catch (error) {
        console.log('[AuthGuard] Error checking onboarding:', error);
      } finally {
        setHasCheckedOnboarding(true);
      }
    };

    checkUserOnboarding();
  }, [user]);

  console.log('[AuthGuard] Auth State:', {
    user: user?.id,
    authLoading,
    hasCheckedOnboarding,
    shouldRedirectToOnboarding,
    completed
  });

  if (authLoading || !hasCheckedOnboarding) {
    console.log('[AuthGuard] Loading state, showing loader');
    return <Loader />;
  }

  if (!user) {
    console.log('[AuthGuard] No user, redirecting to signin');
    return <Redirect href="/signin" />;
  }

  // Only redirect to onboarding if we explicitly know they need to complete it
  if (shouldRedirectToOnboarding) {
    console.log('[AuthGuard] Onboarding incomplete, redirecting to expertise');
    return <Redirect href="/onboarding/expertise" />;
  }

  console.log('[AuthGuard] All checks passed, rendering children');
  return <>{children}</>;
}