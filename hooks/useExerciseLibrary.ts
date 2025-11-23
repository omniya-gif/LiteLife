import { useState, useEffect, useCallback } from 'react';
import { getExercises, getBodyPartList } from '../services/exerciseApi';
import { Exercise, ExerciseFilters } from '../types/exercise';

export const useExerciseLibrary = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with true to show loading on mount
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExerciseFilters>({});

  const loadBodyParts = useCallback(async () => {
    try {
      console.log('📋 Loading body parts list...');
      const parts = await getBodyPartList();
      setBodyParts(parts);
      console.log(`✅ Loaded ${parts.length} body parts`);
    } catch (err) {
      console.error('❌ Error loading body parts:', err);
    }
  }, []);

  const loadExercises = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🏋️ Loading exercises with filters:', filters);
      const data = await getExercises(filters);
      setExercises(data);
      console.log(`✅ Loaded ${data.length} exercises`);
    } catch (err) {
      setError('Failed to load exercises. Please try again.');
      console.error('❌ Error loading exercises:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Load body parts on mount
  useEffect(() => {
    loadBodyParts();
  }, [loadBodyParts]);

  // Load exercises when component mounts or filters change
  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const updateFilters = (newFilters: Partial<ExerciseFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  const searchExercises = (query: string) => {
    updateFilters({ search: query });
  };

  return {
    exercises,
    bodyParts,
    isLoading,
    error,
    filters,
    updateFilters,
    resetFilters,
    searchExercises,
    refresh: loadExercises,
  };
};
