import { useState, useEffect } from 'react';
import { getExerciseById, getExercisesByTarget, getExercisesByEquipment } from '../services/exerciseApi';
import { Exercise } from '../types/exercise';

export const useExerciseDetail = (exerciseId: string | null) => {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [similarByTarget, setSimilarByTarget] = useState<Exercise[]>([]);
  const [similarByEquipment, setSimilarByEquipment] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (exerciseId) {
      loadExerciseDetails();
    }
  }, [exerciseId]);

  const loadExerciseDetails = async () => {
    if (!exerciseId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load main exercise
      const exerciseData = await getExerciseById(exerciseId);
      
      if (!exerciseData) {
        setError('Exercise not found');
        return;
      }

      setExercise(exerciseData);

      // Load similar exercises in parallel
      const [targetExercises, equipmentExercises] = await Promise.all([
        getExercisesByTarget(exerciseData.target),
        getExercisesByEquipment(exerciseData.equipment),
      ]);

      // Filter out the current exercise and limit to 6 similar ones
      setSimilarByTarget(
        targetExercises
          .filter((ex) => ex.id !== exerciseId)
          .slice(0, 6)
      );
      
      setSimilarByEquipment(
        equipmentExercises
          .filter((ex) => ex.id !== exerciseId)
          .slice(0, 6)
      );
    } catch (err) {
      setError('Failed to load exercise details');
      console.error('Error loading exercise details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    exercise,
    similarByTarget,
    similarByEquipment,
    isLoading,
    error,
    refresh: loadExerciseDetails,
  };
};
