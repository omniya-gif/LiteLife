# 🎨 Theme Migration Guide

## Problem
Components use hardcoded colors (`bg-[#4ADE80]`) that don't respond to gender theme changes.

## ✅ **Recommended Approach: Dynamic Style Objects**

This is the **best and easiest** solution for React Native:

### 1. **Update Components to Use `useTheme()` Hook**

#### ❌ Before (Hardcoded):
```tsx
<View className="bg-[#4ADE80] rounded-2xl p-4">
  <Text className="text-white">Button</Text>
</View>
```

#### ✅ After (Theme-aware):
```tsx
import { useTheme } from '@/hooks/useTheme';

const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <View 
      className="rounded-2xl p-4"
      style={{ backgroundColor: theme.primary }}
    >
      <Text className="text-white">Button</Text>
    </View>
  );
};
```

### 2. **Common Pattern: Mixed Tailwind + Dynamic Styles**

```tsx
const theme = useTheme();

// Keep layout/spacing in className, colors in style
<View 
  className="rounded-2xl p-4 shadow-lg"
  style={{ backgroundColor: theme.backgroundLight }}
>
  <Text 
    className="text-lg font-bold"
    style={{ color: theme.primary }}
  >
    My Text
  </Text>
</View>
```

### 3. **For Gradients and Complex Styles**

```tsx
import { LinearGradient } from 'expo-linear-gradient';

<LinearGradient
  colors={[theme.gradientStart, theme.gradientEnd]}
  className="rounded-2xl p-4"
>
  <Text className="text-white">Gradient Button</Text>
</LinearGradient>
```

---

## 📋 **Step-by-Step Migration Plan**

### Phase 1: Critical UI Elements (Do First)
- [ ] Main navigation tabs
- [ ] Primary buttons
- [ ] Header components
- [ ] Home screen cards

### Phase 2: Secondary Elements
- [ ] Recipe cards
- [ ] Workout cards  
- [ ] Chat interface
- [ ] Calculator screens

### Phase 3: Utility Elements
- [ ] Badges
- [ ] Progress bars
- [ ] Icons
- [ ] Loading states

---

## 🔍 **Finding Hardcoded Colors**

Run this search to find all hardcoded colors:
```bash
# Find all bg-[#...] patterns
grep -r "bg-\[#" app/

# Find all text-[#...] patterns  
grep -r "text-\[#" app/

# Find all border-[#...] patterns
grep -r "border-\[#" app/
```

---

## 🎯 **Quick Migration Examples**

### Example 1: Button
```tsx
// Before
<TouchableOpacity className="bg-[#4ADE80] px-6 py-3 rounded-xl">
  <Text className="text-white font-semibold">Click Me</Text>
</TouchableOpacity>

// After
<TouchableOpacity 
  className="px-6 py-3 rounded-xl"
  style={{ backgroundColor: theme.primary }}
>
  <Text className="text-white font-semibold">Click Me</Text>
</TouchableOpacity>
```

### Example 2: Card
```tsx
// Before
<View className="bg-[#25262B] rounded-2xl p-4">
  <Text className="text-white">Content</Text>
</View>

// After
<View 
  className="rounded-2xl p-4"
  style={{ backgroundColor: theme.backgroundLight }}
>
  <Text className="text-white">Content</Text>
</View>
```

### Example 3: Conditional Colors
```tsx
// Before
<View className={isActive ? "bg-[#4ADE80]" : "bg-[#2C2D32]"}>

// After
<View 
  style={{ 
    backgroundColor: isActive ? theme.primary : theme.backgroundDark 
  }}
>
```

---

## 🚀 **Automated Search & Replace (Advanced)**

### For VS Code:
1. Press `Ctrl+Shift+H` (Find & Replace in Files)
2. Enable regex (Alt+R)
3. Use these patterns:

**Pattern 1: bg-[#4ADE80]**
- Find: `className="([^"]*?)bg-\[#4ADE80\]([^"]*)"`
- Replace: `className="$1$2" style={{ backgroundColor: theme.primary }}`

**Pattern 2: bg-[#25262B]**
- Find: `className="([^"]*?)bg-\[#25262B\]([^"]*)"`
- Replace: `className="$1$2" style={{ backgroundColor: theme.backgroundLight }}`

⚠️ **Warning**: Review each replacement! Some components may need the `useTheme()` hook imported first.

---

## 🎨 **Available Theme Colors**

```typescript
theme.primary          // #4ADE80 (male) / #FF69B4 (female)
theme.primaryLight     // #86EFAC / #FFB6D9
theme.primaryDark      // #22C55E / #DB5B9A

theme.background       // #1A1B1E (same for both)
theme.backgroundLight  // #25262B (same for both)
theme.backgroundDark   // #2C2D32 (same for both)

theme.textPrimary      // #FFFFFF
theme.textSecondary    // #9CA3AF
theme.textTertiary     // #6B7280

theme.success          // #22C55E
theme.warning          // #FBBF24
theme.error            // #EF4444
theme.info             // #3B82F6

theme.gradientStart    // For gradients
theme.gradientEnd      // For gradients
```

---

## 📝 **Checklist for Each Component**

1. [ ] Import `useTheme` hook
2. [ ] Call `const theme = useTheme()` at component top
3. [ ] Replace `bg-[#...]` with `style={{ backgroundColor: theme.xxx }}`
4. [ ] Replace `text-[#...]` with `style={{ color: theme.xxx }}`
5. [ ] Replace `border-[#...]` with `style={{ borderColor: theme.xxx }}`
6. [ ] Test theme switching (male ↔ female)

---

## 💡 **Pro Tips**

1. **Keep className for layout**: `className="flex-1 p-4 rounded-xl"`
2. **Use style for colors**: `style={{ backgroundColor: theme.primary }}`
3. **Test both themes**: Always verify male AND female themes work
4. **Don't mix approaches**: Choose one method and stick with it
5. **Update one screen at a time**: Don't try to fix everything at once

---

## 🔧 **Troubleshooting**

### Theme doesn't change?
- Make sure component imports `useTheme`
- Verify you're using `style={{}}` not `className`
- Check if component re-renders on theme change

### Colors look wrong?
- Verify correct theme property: `theme.primary` not `theme.main`
- Check for typos: `backgroundColor` not `background-color`

### Performance issues?
- The `useTheme` hook uses `useMemo` - no performance impact
- Each component subscribes only to theme changes

---

## 📊 **Progress Tracking**

Create a checklist of all screens:

### Main Screens
- [ ] Home (`app/(main)/home/index.tsx`)
- [ ] Chat (`app/(main)/chat/index.tsx`)
- [ ] Recipes (`app/(main)/recipes/index.tsx`)
- [ ] Workouts (`app/(main)/workouts/exercises.tsx`)
- [ ] Calculators (`app/(main)/calculators.tsx`)
- [ ] Profile (`app/(main)/profile/index.tsx`)

### Components
- [ ] Navigation (`components/navigation/`)
- [ ] Badges (`components/badges/`)
- [ ] Buttons (`components/Button.tsx`)
- [ ] Cards (various)

---

## 🎯 **Expected Outcome**

After migration:
1. ✅ Switching gender in onboarding **instantly** updates ALL colors
2. ✅ No hardcoded color values anywhere
3. ✅ Consistent theme across entire app
4. ✅ Easy to add new themes (dark mode, custom colors, etc.)
