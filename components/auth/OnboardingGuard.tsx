import React from 'react';
import { Redirect } from 'expo-router';
import { useOnboarding } from '../../hooks/useOnboarding';
import Loader from '../Loader';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export default function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { data: onboarding, isLoading } = useOnboarding();

  if (isLoading) {
    return <Loader />;
  }

  if (!onboarding?.completed) {
    return <Redirect href="/onboarding/expertise" />;
  }

  return <>{children}</>;
}