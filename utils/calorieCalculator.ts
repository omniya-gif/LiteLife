import { Gender, Goal, Expertise } from '../types/onboarding';

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 * This is the most accurate formula for calculating daily calorie needs
 */
export function calculateBMR(
  weight: number, // in kg
  height: number, // in cm
  age: number,
  gender: Gender
): number {
  if (gender === 'male') {
    // BMR for men: 10 × weight(kg) + 6.25 × height(cm) - 5 × age(y) + 5
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    // BMR for women: 10 × weight(kg) + 6.25 × height(cm) - 5 × age(y) - 161
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

/**
 * Get activity multiplier based on expertise level
 */
export function getActivityMultiplier(expertise: Expertise = 'beginner'): number {
  const multipliers = {
    beginner: 1.375, // Light exercise 1-3 days/week
    intermediate: 1.55, // Moderate exercise 3-5 days/week
    advanced: 1.725, // Heavy exercise 6-7 days/week
  };
  return multipliers[expertise];
}

/**
 * Get calorie adjustment based on goal
 */
export function getGoalAdjustment(goal: Goal, tdee: number): number {
  switch (goal) {
    case 'weight_loss':
      return -500; // 500 calorie deficit for safe weight loss (~0.5kg/week)
    case 'muscle_gain':
      return +300; // 300 calorie surplus for muscle gain
    case 'maintain':
      return 0; // No adjustment
    case 'improve_health':
      return 0; // Maintain current weight while improving fitness
    default:
      return 0;
  }
}

/**
 * Calculate recommended daily calorie intake
 *
 * @param weight - Current weight in kg
 * @param height - Height in cm
 * @param age - Age in years
 * @param gender - 'male' or 'female'
 * @param expertise - Activity level: 'beginner', 'intermediate', or 'advanced'
 * @param goal - Fitness goal: 'weight_loss', 'muscle_gain', 'maintain', or 'improve_health'
 * @returns Recommended daily calorie intake
 */
export function calculateDailyCalories(
  weight: number,
  height: number,
  age: number,
  gender: Gender,
  expertise: Expertise = 'beginner',
  goal: Goal = 'maintain'
): number {
  // Step 1: Calculate BMR
  const bmr = calculateBMR(weight, height, age, gender);

  // Step 2: Multiply by activity level to get TDEE (Total Daily Energy Expenditure)
  const activityMultiplier = getActivityMultiplier(expertise);
  const tdee = bmr * activityMultiplier;

  // Step 3: Adjust based on goal
  const goalAdjustment = getGoalAdjustment(goal, tdee);
  const dailyCalories = tdee + goalAdjustment;

  // Round to nearest 50 for cleaner numbers
  return Math.round(dailyCalories / 50) * 50;
}

/**
 * Calculate calorie burn goal (for exercise tracking)
 * This is separate from daily intake - it's how many calories to burn through exercise
 */
export function calculateCalorieBurnGoal(expertise: Expertise = 'beginner'): number {
  const burnGoals = {
    beginner: 300, // ~30 minutes light exercise
    intermediate: 500, // ~45 minutes moderate exercise
    advanced: 700, // ~60 minutes intense exercise
  };
  return burnGoals[expertise];
}

/**
 * Get estimated weekly weight change based on calorie deficit/surplus
 */
export function getEstimatedWeightChange(
  currentCalories: number,
  targetCalories: number
): {
  weeklyChange: number; // in kg
  direction: 'loss' | 'gain' | 'maintain';
  timeToGoal?: number; // weeks
} {
  const dailyDifference = currentCalories - targetCalories;
  const weeklyDifference = dailyDifference * 7;

  // 7700 calories = approximately 1 kg of body weight
  const weeklyChange = weeklyDifference / 7700;

  if (Math.abs(weeklyChange) < 0.1) {
    return { weeklyChange: 0, direction: 'maintain' };
  }

  return {
    weeklyChange: Math.abs(weeklyChange),
    direction: weeklyChange > 0 ? 'loss' : 'gain',
  };
}
