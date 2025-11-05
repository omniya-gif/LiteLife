# Quick Reference: Dynamic Theme System

## 🎨 What's Working Now

### ✅ Gender Detection on Login
- When user logs in, app automatically reads gender from database
- Theme is set based on `user_onboarding.gender` field
- Works for both new and existing users

### ✅ Immediate Theme Switching
- Selecting "Female" in onboarding instantly changes colors to pink
- Selecting "Male" keeps green colors
- No need to wait for onboarding completion

### ✅ Theme Persistence
- Theme choice saved in AsyncStorage
- Persists across app restarts
- Synchronized with database

## 🎯 What You'll See

### When Testing as Female User:
- **Onboarding**: Gender page, Expertise page → Pink
- **Header**: "LiteLife" accent, date, profile icon → Pink
- **Metrics**: Values and icons → Pink  
- **Tab Bar**: Active tab text and underline → Pink
- **Bottom Nav**: Active icon and label → Pink

### When Testing as Male User:
- All above elements → Green (#4ADE80)

## 🔴 What's Still Green (Needs Update)

### Critical User-Facing:
1. **Remaining Onboarding Pages** (age, height, weight, goal, calories, interests, notifications)
2. **Profile Page** - Everything in profile
3. **Calculators** - BMI, BMR, Calorie
4. **Journal** - Food journal icons and buttons
5. **Workouts** - All workout-related pages
6. **Auth Pages** - Sign in back arrow

### How to Identify:
Look for any green (#4ADE80) elements:
- Progress bars
- Buttons
- Icons
- Highlighted text
- Selected items
- Active states

## 📱 Testing Instructions

### Test 1: New Female User
1. Sign up/create account
2. Go through onboarding
3. **On gender page**: Click "Female"
4. **Expected**: Gender card turns pink, progress bar pink, continue button pink
5. Continue to expertise page
6. **Expected**: All accents are pink
7. Continue through all onboarding
8. **Expected**: Header shows pink "LiteLife", pink metrics
9. **Issue**: Other onboarding pages still green (not updated yet)

### Test 2: Existing Female User
1. Log in with account that has `gender='female'` in database
2. **Expected**: App loads with pink theme immediately
3. Check header, metrics, tabs
4. **Expected**: All updated components show pink

### Test 3: Switch Gender
1. During onboarding, select "Male"
2. Click next
3. Go back
4. Select "Female"  
5. **Expected**: Colors change instantly to pink

## 🔧 What You Can Do

### Option 1: Let Me Continue (Recommended)
I can continue updating the remaining components one by one. This is systematic and ensures quality.

### Option 2: Batch Update
I can create a script to update multiple files at once, but this requires careful testing.

### Option 3: Prioritize Specific Pages
Tell me which pages are most important to you, and I'll update those first:
- Profile page?
- Specific onboarding pages?
- Calculators?

## 💬 Quick Answers

**Q: Why is the navigation still green?**
A: The bottom navigation uses the AnimatedTabBar component which I've updated. If you're seeing green, it might be cached. Try clearing app storage or rebuilding.

**Q: Why do some onboarding pages turn pink but others don't?**
A: I've only updated 2 onboarding pages so far (gender and expertise). The other 6 pages still need to be updated.

**Q: Will the theme work for users already in the database?**
A: Yes! The `useOnboarding` hook reads gender from the database on login and sets the theme automatically.

**Q: Do I need to rebuild the app?**
A: For these changes to take effect, yes. Run:
```
npm start
```
or
```
npx expo start --clear
```

**Q: Can I change the pink color?**
A: Yes! Edit `hooks/useTheme.ts` and change `#FF69B4` to any color you want.

**Q: How do I check a user's gender in the database?**
A: Run this query in Supabase:
```sql
SELECT user_id, gender FROM user_onboarding WHERE user_id = 'YOUR_USER_ID';
```

## 🚀 What Happens Next

I recommend continuing with these high-impact updates:

1. **✅ DONE**: Gender page, Expertise page, Header, Metrics, Tab bars
2. **NEXT**: Remaining onboarding pages (age, height, weight, goal, calories, interests, notifications)
3. **THEN**: Profile page (high visibility)
4. **THEN**: Calculators (BMI, BMR, Calorie)
5. **FINALLY**: All remaining components

Each update follows the same simple pattern:
```typescript
// 1. Import
import { useTheme } from '../hooks/useTheme';

// 2. Use hook
const theme = useTheme();

// 3. Apply colors
<View style={{ backgroundColor: theme.primary }}>
```

## ⚡ Pro Tips

1. **Test frequently**: After each component update, test in app
2. **Check both genders**: Always test as both male and female
3. **Clear cache**: If colors don't update, clear cache and rebuild
4. **Check console**: Look for theme initialization logs:
   ```
   🎨 Theme: Setting gender to female
   🎨 Theme: Initializing from profile, gender: female
   ```

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Gender selection immediately changes colors
- ✅ Theme persists after closing/reopening app
- ✅ Login automatically loads correct theme from DB
- ✅ All updated pages show consistent colors
- ✅ No green (#4ADE80) visible on updated pages when female is selected
