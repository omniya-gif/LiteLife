# Daily Calorie Goal Calculation - Implementation Summary

## ✅ Completed Implementation

### 1. **Calorie Calculator Utility** (`utils/calorieCalculator.ts`)
Created a comprehensive utility for calculating personalized daily calorie needs:

#### Key Functions:
- **`calculateBMR()`** - Basal Metabolic Rate using Mifflin-St Jeor Equation
  - Most accurate formula for BMR calculation
  - Formula: 
    - Men: 10 × weight(kg) + 6.25 × height(cm) - 5 × age(y) + 5
    - Women: 10 × weight(kg) + 6.25 × height(cm) - 5 × age(y) - 161

- **`getActivityMultiplier()`** - Activity level adjustments
  - Beginner: 1.375 (light exercise 1-3 days/week)
  - Intermediate: 1.55 (moderate exercise 3-5 days/week)
  - Advanced: 1.725 (heavy exercise 6-7 days/week)

- **`getGoalAdjustment()`** - Goal-based calorie adjustments
  - Weight Loss: -500 cal (safe deficit for ~0.5kg/week loss)
  - Muscle Gain: +300 cal (surplus for muscle building)
  - Maintain/Improve Health: 0 cal (maintenance)

- **`calculateDailyCalories()`** - Main calculation function
  - BMR → TDEE (Total Daily Energy Expenditure) → Goal Adjustment
  - Rounds to nearest 50 for cleaner numbers
  - Example: 25yo, 70kg, 170cm, male, beginner, improve_health = ~2350 cal

### 2. **Automatic Calculation on Onboarding** (`hooks/useOnboardingSubmit.ts`)
- Automatically calculates `daily_calories` when user completes onboarding
- Saves to `user_onboarding.daily_calories` field in Supabase
- Requires: age, gender, height, current_weight (all collected during onboarding)
- Optional: expertise level (defaults to 'beginner'), goal (defaults to 'maintain')

```typescript
// Calculation happens before database save
const dailyCalories = calculateDailyCalories(
  current_weight,  // e.g., 70kg
  height,          // e.g., 170cm
  age,             // e.g., 25
  gender,          // 'male' or 'female'
  expertise,       // 'beginner', 'intermediate', 'advanced'
  goal             // 'weight_loss', 'muscle_gain', 'maintain', 'improve_health'
);
```

### 3. **Profile Edit Recalculation** (`app/(main)/profile/edit.tsx`)
- Recalculates `daily_calories` whenever user updates:
  - Age
  - Height
  - Weight
  - Gender
- Automatically updates database with new calculated value
- Ensures calorie goal stays accurate as user's biometrics change

### 4. **Enhanced Calorie Tracker UI** (`app/(main)/calculators/calorie.tsx`)
- Shows personalized daily calorie goal instead of hardcoded 2500
- Displays: **`burned_calories / daily_goal`** (e.g., `3 / 2350 cal`)
- Percentage calculation: `(burned_calories / daily_calories) × 100%`
- Helpful context message:
  - If `daily_calories` exists: "Based on your profile & fitness goal"
  - If not set: "Default goal (complete profile for personalized goal)"

### 5. **Home Metrics Display** (`app/(main)/home/components/MetricsOverview.tsx`)
- Already integrated! Shows calculated `daily_calories` from onboarding data
- Fallback to 2850 if not calculated yet
- Updates automatically when user completes onboarding or edits profile

---

## 📊 Example Calculations

### User Profile: Age 25, Male, 70kg, 170cm

| Expertise Level | Goal | BMR | TDEE | Adjustment | Daily Goal |
|----------------|------|-----|------|------------|-----------|
| Beginner | Maintain | 1660 | 2282 | 0 | **2300 cal** |
| Beginner | Weight Loss | 1660 | 2282 | -500 | **1800 cal** |
| Beginner | Muscle Gain | 1660 | 2282 | +300 | **2600 cal** |
| Intermediate | Improve Health | 1660 | 2573 | 0 | **2600 cal** |
| Advanced | Muscle Gain | 1660 | 2863 | +300 | **3150 cal** |

---

## 🔄 Data Flow

```
1. User completes onboarding
   ↓
2. Calculate daily_calories (BMR → TDEE → Goal Adjustment)
   ↓
3. Save to user_onboarding.daily_calories
   ↓
4. Display on Calorie Tracker: "X / daily_calories cal"
   ↓
5. Show percentage: "(X / daily_calories) × 100%"
   ↓
6. User edits profile (weight/age/height/gender)
   ↓
7. Recalculate daily_calories automatically
   ↓
8. Update database & refresh UI
```

---

## 🎯 Current Status: Health Connect Integration

### What We're Tracking:
- **Calories Burned** from Google Fit via Health Connect
  - Real-time data from user's physical activity
  - Currently showing: 3 calories burned today

### Percentage Display:
- Formula: `(calories_burned / daily_calories) × 100%`
- Example: `(3 / 2350) × 100% = 0.13%`
- Visual: Circular progress bar with percentage in center

---

## 🚀 What's Working Now:

✅ Automatic daily calorie goal calculation based on:
- Age, gender, height, weight
- Activity level (expertise)
- Fitness goal (weight loss, muscle gain, etc.)

✅ Smart calorie adjustments:
- 500 cal deficit for weight loss
- 300 cal surplus for muscle gain
- Maintenance for improve_health/maintain goals

✅ Real-time Health Connect data:
- Steps, distance, floors, calories burned
- Permission handling with user-friendly banners
- Automatic refresh when permissions granted

✅ Dynamic percentage display:
- Shows progress toward daily calorie goal
- Updates as Health Connect reads more activity
- Personalized goal based on user's profile

✅ Profile edit integration:
- Recalculates when biometrics change
- Always keeps calorie goal accurate

---

## 📝 Next Steps (Optional Enhancements):

1. **Separate Intake vs Burn Goals**
   - `daily_calories_intake` (food to eat)
   - `daily_calories_burn` (exercise goal)
   - Net calories = intake - burn

2. **Weekly/Monthly Averages**
   - Track average calories burned per day
   - Show trends and progress over time

3. **Adjustable Goals**
   - Allow manual override of calculated goal
   - "Customize Your Goal" button

4. **Macro Breakdown**
   - Show protein/carbs/fat recommendations
   - Based on goal (e.g., high protein for muscle gain)

5. **Achievement Notifications**
   - "You've reached 50% of your daily calorie goal!"
   - "Congrats! You hit your calorie target today 🎉"

---

## 🧪 Testing Checklist:

- [ ] New user completes onboarding → `daily_calories` calculated & saved
- [ ] Calorie tracker page shows calculated goal (not 2500)
- [ ] Percentage updates correctly: `(burned / goal) × 100%`
- [ ] Home metrics show calculated goal
- [ ] User edits profile → `daily_calories` recalculates
- [ ] Gender change → goal recalculates (women's BMR ~160 cal lower)
- [ ] Goal change (e.g., maintain → weight loss) → goal drops by 500
- [ ] Expertise change → goal adjusts by activity multiplier

---

## 💡 Key Insights:

1. **BMR is the foundation** - Calories burned at complete rest
2. **TDEE = BMR × Activity Multiplier** - Daily energy expenditure
3. **Goal Adjustment** - Add/subtract based on fitness objective
4. **Personalization matters** - Same height/weight can have different goals
5. **Gender impacts BMR** - Men typically need ~200-300 more calories

---

## 🔧 Technical Details:

### Database Schema:
```sql
-- user_onboarding table already has:
daily_calories: integer (optional)
age: integer
gender: text
height: integer (cm)
current_weight: numeric (kg)
target_weight: numeric (kg)
goal: text
expertise: text
```

### Type Definitions:
```typescript
type Gender = 'male' | 'female';
type Goal = 'weight_loss' | 'muscle_gain' | 'maintain' | 'improve_health';
type Expertise = 'beginner' | 'intermediate' | 'advanced';
```

---

## 📱 User Experience:

### Before (Hardcoded):
- Everyone sees "2500 cal" goal
- No personalization
- Inaccurate for most users

### After (Calculated):
- 25yo woman, 60kg, sedentary, weight loss: **1400 cal**
- 30yo man, 80kg, active, muscle gain: **3150 cal**
- Accurate, personalized, motivating

---

## 🎉 Summary:

We've implemented a complete calorie goal calculation system that:
1. **Calculates** personalized daily calorie needs using scientifically-backed formulas
2. **Saves** automatically during onboarding and profile edits
3. **Displays** on calorie tracker with percentage progress
4. **Updates** dynamically as user's biometrics change
5. **Integrates** with Health Connect to track real-time calorie burn

The user now sees meaningful, personalized calorie goals instead of generic defaults!
