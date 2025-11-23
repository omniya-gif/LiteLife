# Writing Nutrition Data to Health Connect - Implementation Guide

## ✅ YES, You Can Write Meal/Calorie Data to Health Connect!

Health Connect **DOES support** writing nutrition data including:
- Calories consumed
- Protein, carbs, fat (macronutrients)
- Meal names and types (breakfast, lunch, dinner, snack)
- Timestamps for each meal

---

## 📋 What You Need to Do

### 1. **Add Write Permissions to AndroidManifest.xml**

Open `android/app/src/main/AndroidManifest.xml` and add **write** permissions for Nutrition:

```xml
<manifest>
  <!-- Existing permissions -->
  <uses-permission android:name="android.permission.health.READ_STEPS"/>
  <uses-permission android:name="android.permission.health.READ_DISTANCE"/>
  <uses-permission android:name="android.permission.health.READ_ACTIVE_CALORIES_BURNED"/>
  
  <!-- 🆕 ADD THIS: Write permission for nutrition data -->
  <uses-permission android:name="android.permission.health.WRITE_NUTRITION"/>
  
  <!-- Optional: Read nutrition if you want to read back what was written -->
  <uses-permission android:name="android.permission.health.READ_NUTRITION"/>
</manifest>
```

### 2. **Request Write Permission in Your App**

Update your Health Connect permission request to include write access:

```typescript
// Example in your meal planner or add meal screen
const healthConnect = useHealthConnect([
  { accessType: 'read', recordType: 'Steps' },
  { accessType: 'read', recordType: 'Distance' },
  { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
  // 🆕 ADD THIS:
  { accessType: 'write', recordType: 'Nutrition' },
  { accessType: 'read', recordType: 'Nutrition' }, // Optional: to read back
]);
```

### 3. **Use the Write Hook to Save Meals**

I've created `hooks/useHealthConnectWrite.ts` for you. Use it like this:

```typescript
import { useHealthConnectWrite } from '../../../hooks/useHealthConnectWrite';

function MealPlannerScreen() {
  const { writeMealToHealthConnect, isWriting } = useHealthConnectWrite();

  const handleSaveMeal = async () => {
    const success = await writeMealToHealthConnect({
      name: 'Salad with wheat and white egg',
      calories: 200,
      protein: 15, // grams
      carbs: 25,   // grams
      fat: 8,      // grams
      mealType: 'breakfast',
      timestamp: new Date().toISOString(),
    });

    if (success) {
      Alert.alert('Success', 'Meal saved to Health Connect!');
    }
  };

  return (
    <Button 
      title={isWriting ? 'Saving...' : 'Save to Health Connect'} 
      onPress={handleSaveMeal}
      disabled={isWriting}
    />
  );
}
```

---

## 🔧 Implementation Steps

### Step 1: Update AndroidManifest.xml (REQUIRED)
Add the write permission as shown above.

### Step 2: Rebuild the App (REQUIRED)
```bash
cd android
./gradlew clean
cd ..
npm run android
```

Or with EAS:
```bash
eas build --profile development --platform android
```

### Step 3: Request Permissions at Runtime
When user opens meal planner for first time, request the write permission:

```typescript
await healthConnect.requestHealthPermissions();
```

### Step 4: Write Meal Data
Use the `writeMealToHealthConnect` function to save meals.

---

## 📊 What Data Can You Write?

The `Nutrition` record type supports:

| Field | Type | Description |
|-------|------|-------------|
| `energy.inKilocalories` | number | **Required** - Calories |
| `protein.inGrams` | number | Optional - Protein grams |
| `totalCarbohydrate.inGrams` | number | Optional - Carbs grams |
| `totalFat.inGrams` | number | Optional - Fat grams |
| `name` | string | Optional - Meal name |
| `mealType` | enum | Optional - breakfast/lunch/dinner/snack |
| `startTime` | ISO string | **Required** - When meal was eaten |
| `endTime` | ISO string | **Required** - Usually same as startTime |

---

## 🎯 Integration with Your Meal Planner

Looking at your screenshots, you have:
1. **Meal Planner** screen with meals (2158 of 2850 Cal)
2. **Add a meal** screen with nutrition fields

### Update Your "Add Meal" Flow:

```typescript
// In your meal planner screen
import { useHealthConnectWrite } from '../../hooks/useHealthConnectWrite';

export default function MealPlannerScreen() {
  const { writeMealToHealthConnect } = useHealthConnectWrite();

  const handleAddMeal = async (meal) => {
    // 1. Save to your Supabase database (existing code)
    const { data, error } = await supabase
      .from('meal_logs')
      .insert({ ...meal, user_id: user.id });

    if (error) {
      Alert.alert('Error', 'Failed to save meal');
      return;
    }

    // 2. 🆕 Also save to Health Connect (new code)
    const healthSuccess = await writeMealToHealthConnect({
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      mealType: meal.mealType, // 'breakfast', 'lunch', etc.
      timestamp: meal.timestamp || new Date().toISOString(),
    });

    if (healthSuccess) {
      Alert.alert('Success', 'Meal saved to both database and Health Connect!');
    } else {
      Alert.alert('Partial Success', 'Meal saved to database only');
    }
  };

  return (
    // Your existing UI
  );
}
```

---

## 🔐 Permission Request Flow

1. **First time user opens meal planner:**
   - Check if write permission is granted
   - If not, show banner: "Enable Health Connect to sync your meals"
   - Button: "Grant Permission"

2. **User clicks "Grant Permission":**
   - Call `requestHealthPermissions()` with write access
   - Health Connect permission dialog opens
   - User grants write permission for Nutrition

3. **After permission granted:**
   - All meals saved in your app will also sync to Health Connect
   - Google Fit and other apps can now read this data

---

## 📱 Testing

After rebuilding:

1. **Open your app** → Go to meal planner
2. **Request write permission** → Grant it in Health Connect
3. **Add a meal** with calories (e.g., 200 cal)
4. **Open Health Connect app** → Check "Nutrition" section
5. **Verify** your meal appears with correct calories

Then check in **Google Fit**:
- Open Google Fit app
- Go to "Nutrition" tab
- Your meal should appear there too!

---

## ⚠️ Important Notes

1. **Rebuild Required**: Permission changes in AndroidManifest.xml require app rebuild
2. **User Must Grant**: Users must explicitly grant write permission
3. **Health Connect Required**: Users need Health Connect installed (Android 8+)
4. **Data Sync**: Once written to Health Connect, other fitness apps can read it
5. **Google Play Approval**: If publishing to Play Store, you'll need approval (7-14 days)

---

## 🎉 Benefits

Once implemented:
- ✅ Meals sync to Google Fit automatically
- ✅ Users can see nutrition in one place (Health Connect)
- ✅ Your app integrates with Android health ecosystem
- ✅ Users can track calories across multiple apps
- ✅ Better user experience and data portability

---

## 🔄 Next Steps

1. ✅ I've created `hooks/useHealthConnectWrite.ts` for you
2. ⏳ Add write permission to AndroidManifest.xml
3. ⏳ Rebuild the app
4. ⏳ Update meal planner to use the write hook
5. ⏳ Test with real meals
6. ⏳ Submit for Google Play approval (if needed)

Let me know if you want me to help implement the meal planner integration! 🚀
