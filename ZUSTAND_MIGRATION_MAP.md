# 🗺️ Zustand Usage Map - LiteLife Project

**Migration Target:** Legend-State  
**Date:** December 11, 2025

---

## 📊 **OVERVIEW**

### Total Zustand Stores: **8**
### Total Files Using Stores: **47** files
### Total Store Usages: **103** locations

---

## 🏪 **ZUSTAND STORES INVENTORY**

### ✅ Active Stores (7)

| # | Store | Path | Lines | Status |
|---|-------|------|-------|--------|
| 1 | **userStore** | `lib/store/userStore.ts` | 223 | ⭐ PRIMARY - Most Complex |
| 2 | **userStore** (duplicate) | `stores/userStore.ts` | ~30 | ⚠️ DUPLICATE - Needs Consolidation |
| 3 | **chatStore** | `stores/chatStore.ts` | ~80 | ⭐ Medium Complexity |
| 4 | **notificationStore** | `stores/notificationStore.ts` | ~55 | Medium Complexity |
| 5 | **onboardingStore** | `stores/onboardingStore.ts` | ~30 | Simple |
| 6 | **themeStore** | `stores/themeStore.ts` | ~40 | ⭐ Easiest - Start Here |
| 7 | **bmiStore** | `lib/store/bmiStore.ts` | 176 | Medium Complexity |

### ❌ Inactive Stores (1)

| Store | Path | Status |
|-------|------|--------|
| **authStore** | `stores/authStore.ts` | 🔴 **COMMENTED OUT** (329 lines) - Skip Migration |

---

## 📍 **STORE USAGE BY LOCATION**

### 1️⃣ **userStore** (Most Used - 32 locations)

#### **Primary Version:** `lib/store/userStore.ts`

**Features:**
- Profile data management
- Onboarding data management
- Supabase integration
- Theme synchronization
- AsyncStorage persistence

**Used In:**

##### Hooks (6 files)
- ✅ `hooks/useAuth.ts` - clearUserData
- ✅ `hooks/useOnboardingSubmit.ts` - fetchUserData
- ✅ `hooks/useOnboarding.ts` (imported but may not be used)

##### Components (2 files)
- ✅ `components/home/Header.tsx` - profile
- ✅ `components/auth/SocialLogin.tsx` - fetchUserData

##### App Pages (14 files)

**Profile Section:**
- ✅ `app/(main)/profile/index.tsx` - profile, onboarding, fetchUserData, isLoading
- ✅ `app/(main)/profile/edit.tsx` - profile, onboarding, fetchUserData

**Home Section:**
- ✅ `app/(main)/home/index.tsx` - fetchUserData, useUserStore.getState()
- ✅ `app/(main)/home/components/MetricsOverview.tsx` - onboarding (2 locations)

**Health Section:**
- ✅ `app/(main)/health/index.tsx` - profile, fetchUserData

**Calculators (7 files):**
- ✅ `app/(main)/calculators/weight.tsx` - onboarding, fetchUserData
- ✅ `app/(main)/calculators/hydration.tsx` - onboarding
- ✅ `app/(main)/calculators/hydration-history.tsx` - onboarding
- ✅ `app/(main)/calculators/calorie.tsx` - onboarding
- ✅ `app/(main)/calculators/bmr.tsx` - onboarding
- ✅ `app/(main)/calculators/bmi.tsx` - onboarding

**Journal:**
- ✅ `app/(main)/journal/index.tsx` - onboarding

---

#### **Secondary Version (DUPLICATE):** `stores/userStore.ts`

⚠️ **ISSUE:** Different implementation, only 3 locations:
- `app/(main)/journal/index.tsx`
- `app/(main)/calculators/hydration.tsx`
- `app/(main)/calculators/hydration-history.tsx`

**Action Required:** Consolidate to single userStore before migration

---

### 2️⃣ **chatStore** (2 locations)

**Features:**
- Message history
- Image attachments
- Chat clearing
- AsyncStorage persistence

**Used In:**
- ✅ `app/(main)/chat/index.tsx` - messages, addMessage, addImage, clearChat
- ✅ `app/(main)/chat/fallback.tsx` - messages, addMessage, clearChat

**Complexity:** Medium - Has persistence with complex data structures

---

### 3️⃣ **notificationStore** (3 locations)

**Features:**
- Notification list
- Read/unread tracking
- Mark as read actions
- Supabase integration

**Used In:**
- ✅ `hooks/useNotifications.ts` - setNotifications, return entire store (3 usages)

**Complexity:** Medium - Has async actions and Supabase real-time

---

### 4️⃣ **onboardingStore** (27 locations)

**Features:**
- Form data management
- Onboarding completion status
- No persistence (in-memory only)

**Used In:**

##### Hooks (3 files):
- ✅ `hooks/useOnboardingSubmit.ts` - setCompleted, resetFormData
- ✅ `hooks/useOnboarding.ts` - setCompleted
- ✅ `hooks/useAuth.ts` - useOnboardingStore.getState()

##### Components (2 files):
- ✅ `components/auth/SocialLogin.tsx` - setCompleted
- ✅ `components/auth/AuthGuard.tsx` - completed

##### Onboarding Screens (12 files):
- ✅ `app/(auth)/onboarding/weight.tsx`
- ✅ `app/(auth)/onboarding/username.tsx`
- ✅ `app/(auth)/onboarding/notifications.tsx`
- ✅ `app/(auth)/onboarding/hydration.tsx`
- ✅ `app/(auth)/onboarding/interests.tsx`
- ✅ `app/(auth)/onboarding/height.tsx`
- ✅ `app/(auth)/onboarding/goal.tsx`
- ✅ `app/(auth)/onboarding/expertise.tsx`
- ✅ `app/(auth)/onboarding/gender.tsx` (also uses themeStore)
- ✅ `app/(auth)/onboarding/calories.tsx`
- ✅ `app/(auth)/onboarding/age.tsx`

**Complexity:** Simple - Just form state, no persistence

---

### 5️⃣ **themeStore** (7 locations)

**Features:**
- Gender-based theming
- Color management
- AsyncStorage persistence

**Used In:**

##### Direct Usage:
- ✅ `hooks/useTheme.ts` - gender
- ✅ `hooks/useOnboardingSubmit.ts` - useThemeStore.getState()
- ✅ `hooks/useOnboarding.ts` - initializeFromProfile
- ✅ `hooks/useAuth.ts` - useThemeStore.getState()
- ✅ `app/(auth)/onboarding/gender.tsx` - setGender, useThemeStore.getState()

##### Cross-Store Usage:
- ✅ `lib/store/userStore.ts` - useThemeStore.getState() (2 locations)

**Complexity:** ⭐ **EASIEST** - Simple state, good starting point

---

### 6️⃣ **bmiStore** (Not directly used in components yet)

**Features:**
- BMI calculation
- Weight history
- Height management
- Supabase integration

**Complexity:** Medium - Database operations, calculations

---

## 🔄 **MIGRATION PRIORITY ORDER**

### Phase 1: Foundation (Start Here) ⭐
1. **themeStore** - Simplest, no dependencies
   - 7 locations
   - Simple state
   - Good for learning Legend-State patterns

2. **onboardingStore** - Simple form state
   - 27 locations
   - No persistence
   - No async operations

### Phase 2: Medium Complexity
3. **chatStore** - Moderate complexity
   - 2 locations
   - Has persistence
   - Array/object management

4. **notificationStore** - Supabase integration
   - 3 locations
   - Real-time subscriptions
   - Async operations

### Phase 3: Complex (Final Migration)
5. **Consolidate userStore** - Fix duplicate first
   - Merge `stores/userStore.ts` into `lib/store/userStore.ts`
   
6. **userStore** - Most complex
   - 32 locations
   - Cross-store dependencies
   - Complex Supabase logic
   - Persistence

7. **bmiStore** - Database heavy
   - Not heavily used yet
   - Can migrate last

---

## ⚠️ **CRITICAL ISSUES TO RESOLVE**

### 🔴 **BLOCKER: Duplicate userStore**

**Problem:** Two different `userStore` implementations:
1. `lib/store/userStore.ts` (223 lines - complex)
2. `stores/userStore.ts` (~30 lines - simple)

**Files Using Wrong Store:**
- `app/(main)/journal/index.tsx`
- `app/(main)/calculators/hydration.tsx`
- `app/(main)/calculators/hydration-history.tsx`

**Solution Required:** 
1. Update these 3 files to use `lib/store/userStore`
2. Delete `stores/userStore.ts`
3. Then proceed with migration

---

## 🎯 **CROSS-STORE DEPENDENCIES**

### userStore → themeStore
- `lib/store/userStore.ts` calls `useThemeStore.getState()` to sync gender
- **Impact:** Must migrate themeStore first or handle carefully

### Multiple files use `.getState()` pattern:
- `app/(main)/home/index.tsx`
- `app/(auth)/onboarding/gender.tsx`
- `hooks/useAuth.ts`
- `hooks/useOnboardingSubmit.ts`

**Reason:** Avoiding re-renders - exactly the problem Legend-State solves!

---

## 📈 **MIGRATION METRICS**

### Estimated Lines of Code to Change:

| Store | Files | Locations | LOC Impact | Estimated Time |
|-------|-------|-----------|------------|----------------|
| themeStore | 7 | 7 | ~150 | 2-3 hours |
| onboardingStore | 15 | 27 | ~350 | 4-5 hours |
| chatStore | 2 | 2 | ~100 | 2 hours |
| notificationStore | 1 | 3 | ~80 | 2 hours |
| userStore | 20 | 32 | ~600 | 8-10 hours |
| bmiStore | 0 | 0 | ~50 | 1 hour |
| **TOTAL** | **45** | **71** | **~1,330** | **19-23 hours** |

### Post-Migration Benefits:
- 🚀 **Remove ~200 lines** of boilerplate (caching, getState workarounds)
- ⚡ **30-50% fewer re-renders**
- 🎯 **Eliminate flicker issues**
- 💾 **Better persistence performance**
- 🧹 **Cleaner, more maintainable code**

---

## 🛠️ **RECOMMENDED WORKFLOW**

### Week 1: Setup + Easy Wins
**Monday:** 
- Install Legend-State
- Migrate themeStore
- Test thoroughly

**Tuesday-Wednesday:**
- Migrate onboardingStore
- Test all onboarding flows

**Thursday-Friday:**
- Fix userStore duplication
- Begin userStore migration prep

### Week 2: Complex Migrations
**Monday-Wednesday:**
- Migrate userStore (biggest task)
- Test all profile/calculator flows

**Thursday:**
- Migrate chatStore + notificationStore
- Test real-time features

**Friday:**
- Migrate bmiStore
- Final integration testing
- Performance testing

---

## 📝 **NOTES FOR MIGRATION**

### Patterns to Replace:

```typescript
// OLD: Zustand
const { profile } = useUserStore();
useUserStore.getState().profile;
const updateProfile = useUserStore((state) => state.updateProfile);

// NEW: Legend-State
const profile = userStore.profile.use();
const profileValue = userStore.profile.get();
const updateProfile = () => userStore.profile.set(newValue);
```

### Persistence Migration:

```typescript
// OLD: Zustand
persist((set) => ({ ... }), {
  name: 'user-storage',
  storage: createJSONStorage(() => AsyncStorage)
})

// NEW: Legend-State
persistObservable(userStore, {
  local: 'user-storage',
  persistLocal: ObservablePersistAsyncStorage
})
```

---

## ✅ **SUCCESS CRITERIA**

- [ ] All stores migrated to Legend-State
- [ ] No Zustand dependencies remaining
- [ ] All tests passing
- [ ] No flicker/performance issues
- [ ] Persistence working correctly
- [ ] Real-time subscriptions functioning
- [ ] TypeScript errors resolved
- [ ] Code is cleaner and more maintainable

---

**Generated:** December 11, 2025  
**Project:** LiteLife  
**Developer:** Ready to migrate! 🚀
