import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../Loader';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Redirect href="/signin" />;
  }

  return <>{children}</>;
}