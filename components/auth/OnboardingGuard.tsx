import React from 'react';
import { Redirect } from 'expo-router';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../Loader';

export default function OnboardingGuard({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { data: onboarding, isLoading: onboardingLoading } = useOnboarding();

  if (authLoading || onboardingLoading) {
    return <Loader />;
  }

  if (!user) {
    return <Redirect href="/signin" />;
  }

  if (!onboarding?.completed) {
    return <Redirect href="/onboarding/expertise" />;
  }

  return <>{children}</>;
}