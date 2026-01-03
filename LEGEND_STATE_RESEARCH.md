# 📚 Legend-State Research & Migration Guide

**Compiled:** December 11, 2025  
**Version:** 3.0 (Beta)  
**Project:** LiteLife Migration from Zustand

---

## 🎯 **EXECUTIVE SUMMARY**

Legend-State is a **signal-based reactive state library** that will solve your flicker/performance issues. After comprehensive research, it's **the right choice** for your React Native app.

### **Key Benefits for LiteLife:**
- ✅ **Fine-grained reactivity** - Only re-renders what actually changed
- ✅ **Built-in persistence** - AsyncStorage/MMKV support with better performance
- ✅ **No boilerplate** - Eliminates your `.getState()` workarounds
- ✅ **4kb size** - Smaller than Zustand
- ✅ **#1 Performance** - Fastest React state library
- ✅ **Perfect for React Native** - Built for mobile apps

---

## 📖 **CORE CONCEPTS**

### 1. **Observables** (Not Zustand Stores)

**Zustand Way:**
```typescript
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}))
```

**Legend-State Way:**
```typescript
const store$ = observable({
  count: 0,
  increment: () => store$.count.set(v => v + 1)
})
```

**Key Differences:**
- No `create()` function - just `observable()`
- No `set` parameter - direct `.set()` on observables
- Can be global OR local (using `useObservable`)
- Uses `$` suffix convention (optional but recommended)

---

### 2. **Getting Values**

#### **`.get()` - Get and Track**
```typescript
// Tracks for changes in observing contexts
const value = store$.count.get()
```

#### **`.peek()` - Get Without Tracking**
```typescript
// Get value without subscribing to changes
const value = store$.count.peek()
```

**When to use:**
- `get()` - When you want reactivity
- `peek()` - When you just need the current value (like your `getState()` workaround!)

---

### 3. **Setting Values**

```typescript
// Direct set
store$.count.set(5)

// Functional update
store$.count.set(v => v + 1)

// Deep nested paths (auto-creates structure!)
store$.user.profile.name.set('Annyong')

// Assign multiple properties at once
store$.assign({ count: 5, name: 'Test' })

// Delete a property
store$.count.delete()
```

**Critical:** No direct assignment! Always use `.set()`

---

### 4. **React Integration**

#### **Option 1: `useValue` Hook** (Recommended for most cases)
```typescript
import { useValue } from '@legendapp/state/react'

function Component() {
  // Re-renders only when count changes
  const count = useValue(store$.count)
  
  // With selector function
  const isEven = useValue(() => store$.count.get() % 2 === 0)
  
  return <div>{count}</div>
}
```

#### **Option 2: `observer` HOC** (For multiple observables)
```typescript
import { observer, useValue } from '@legendapp/state/react'

const Component = observer(function Component() {
  const count = useValue(store$.count)
  const name = useValue(store$.name)
  
  // More efficient than multiple useValue calls
  return <div>{count} - {name}</div>
})
```

#### **Option 3: `Memo` Component** (Fine-grained)
```typescript
function Component() {
  // Component NEVER re-renders!
  // Only the Memo re-renders itself
  return (
    <View>
      Count: <Memo>{store$.count}</Memo>
    </View>
  )
}
```

---

### 5. **Local State in Components**

```typescript
import { useObservable } from '@legendapp/state/react'

function Component() {
  const state$ = useObservable({ 
    name: '',
    age: 18 
  })
  
  const name = useValue(state$.name)
  
  return <TextInput value={name} />
}
```

---

## 🔄 **PERSISTENCE**

### **React Native Setup**

#### **Option 1: MMKV (Recommended)**
```bash
npm install react-native-mmkv
```

```typescript
import { observable } from '@legendapp/state'
import { syncObservable } from '@legendapp/state/sync'
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv'

const store$ = observable({ todos: [] })

syncObservable(store$, {
  persist: {
    name: 'todos',
    plugin: ObservablePersistMMKV
  }
})
```

#### **Option 2: AsyncStorage**
```bash
npm install @react-native-async-storage/async-storage
```

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'
import { configureSynced } from '@legendapp/state/sync'
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage'

// Global configuration
const persistOptions = configureSynced({
  persist: {
    plugin: observablePersistAsyncStorage({ AsyncStorage })
  }
})

// Use it
syncObservable(store$, persistOptions({
  persist: { name: 'store' }
}))
```

#### **Waiting for Async Persistence**
```typescript
import { syncState, when } from '@legendapp/state'

const state$ = syncState(store$)

// Wait for load
await when(state$.isPersistLoaded)

// Then proceed
```

---

## ⚡ **FINE-GRAINED REACTIVITY**

### **Reactive Components (React Native)**

```typescript
import { $View, $Text, $TextInput } from '@legendapp/state/react-native'

function Component() {
  const state$ = useObservable({ name: '', age: 18 })
  
  return (
    <View>
      {/* Two-way binding! */}
      <$TextInput $value={state$.name} />
      
      {/* Reactive styling */}
      <$View
        $style={() => ({
          backgroundColor: state$.age.get() > 18 ? 'green' : 'red'
        })}
      />
      
      {/* Reactive text */}
      <$Text>
        {() => state$.age.get() > 18 ? 'Adult' : 'Minor'}
      </$Text>
    </View>
  )
}
```

### **Control Flow Components**

#### **Show - Conditional Rendering**
```typescript
import { Show } from '@legendapp/state/react'

<Show 
  if={user$.isLoggedIn}
  else={() => <Login />}
>
  {() => <Dashboard />}
</Show>
```

#### **For - Optimized Lists**
```typescript
import { For } from '@legendapp/state/react'

<For 
  each={todos$}
  item={({ item$ }) => (
    <TodoItem todo$={item$} />
  )}
/>
```

---

## 🔗 **COMPUTED OBSERVABLES**

```typescript
const store$ = observable({
  firstName: 'John',
  lastName: 'Doe',
  
  // Computed - re-calculates automatically
  fullName: () => `${store$.firstName.get()} ${store$.lastName.get()}`
})

// Use it
const name = store$.fullName.get()

// Or in React
const name = useValue(store$.fullName)
```

---

## 🎣 **OBSERVING CHANGES**

### **observe - Run code on changes**
```typescript
import { observe } from '@legendapp/state'

const dispose = observe(() => {
  const count = store$.count.get()
  console.log('Count changed:', count)
})

// Stop observing
dispose()
```

### **when - Wait for condition**
```typescript
import { when } from '@legendapp/state'

// Wait for user to login
await when(user$.isLoggedIn)

// Or with callback
when(
  () => user$.isLoggedIn.get(),
  () => console.log('User logged in!')
)
```

### **onChange - Direct listener**
```typescript
store$.count.onChange(({ value }) => {
  console.log('New count:', value)
})
```

---

## 📊 **MIGRATION PATTERNS**

### **Pattern 1: Simple Store**

**Before (Zustand):**
```typescript
export const useThemeStore = create(
  persist(
    (set) => ({
      gender: 'male',
      setGender: (gender) => set({ gender }),
      getPrimaryColor: () => {
        const { gender } = get()
        return gender === 'female' ? '#FF69B4' : '#4ADE80'
      }
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
)
```

**After (Legend-State):**
```typescript
export const theme$ = observable({
  gender: 'male' as 'male' | 'female',
  setGender: (gender: 'male' | 'female') => theme$.gender.set(gender),
  getPrimaryColor: () => {
    const gender = theme$.gender.get()
    return gender === 'female' ? '#FF69B4' : '#4ADE80'
  }
})

syncObservable(theme$, {
  persist: {
    name: 'theme-storage',
    plugin: ObservablePersistMMKV
  }
})
```

---

### **Pattern 2: Store with Async Actions**

**Before (Zustand):**
```typescript
export const useUserStore = create((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,
  
  fetchUserData: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await supabase.from('profiles').select()
      set({ profile: data, isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  }
}))
```

**After (Legend-State):**
```typescript
export const user$ = observable({
  profile: null as Profile | null,
  isLoading: false,
  error: null as string | null,
  
  fetchUserData: async (userId: string) => {
    user$.isLoading.set(true)
    user$.error.set(null)
    
    try {
      const { data } = await supabase.from('profiles').select()
      user$.profile.set(data)
    } catch (error) {
      user$.error.set(error.message)
    } finally {
      user$.isLoading.set(false)
    }
  }
})
```

---

### **Pattern 3: Component Usage**

**Before (Zustand):**
```typescript
function Component() {
  const { profile, fetchUserData } = useUserStore()
  const theme = useThemeStore((state) => state.gender) // Selector
  
  useEffect(() => {
    fetchUserData(userId)
  }, [userId])
  
  return <div>{profile?.name}</div>
}
```

**After (Legend-State):**
```typescript
function Component() {
  const profile = useValue(user$.profile)
  const theme = useValue(theme$.gender)
  
  useMount(() => {
    user$.fetchUserData(userId)
  })
  
  return <div>{profile?.name}</div>
}
```

---

### **Pattern 4: Cross-Store Dependencies**

**Before (Zustand - the problem!):**
```typescript
// In userStore
const { setGender } = useThemeStore.getState() // ❌ Workaround
setGender(onboarding.gender)
```

**After (Legend-State - clean!):**
```typescript
// Just reference it directly!
theme$.setGender(user$.onboarding.gender.get()) // ✅ Works perfectly
```

---

## 🚀 **SUPABASE INTEGRATION**

Legend-State has a **Supabase plugin** for real-time sync!

```typescript
import { syncedSupabase } from '@legendapp/state/sync-plugins/supabase'

const messages$ = observable(
  syncedSupabase({
    supabase,
    collection: 'messages',
    // Real-time updates!
    realtime: true,
    
    // Persist locally
    persist: {
      name: 'messages',
      plugin: ObservablePersistMMKV
    },
    
    // Retry failed saves
    retry: { infinite: true }
  })
)
```

---

## ⚠️ **IMPORTANT DIFFERENCES FROM ZUSTAND**

| Aspect | Zustand | Legend-State |
|--------|---------|--------------|
| **Create** | `create((set, get) => ...)` | `observable({...})` |
| **Update** | `set({ value })` or `set(state => ...)` | `.set(value)` |
| **Read** | `useStore()` or `useStore(selector)` | `useValue(store$.value)` |
| **Selector** | `useStore((s) => s.value)` | `useValue(() => store$.value.get())` |
| **No Re-render** | `useStore.getState()` | `.peek()` or just `.get()` outside React |
| **Persistence** | `persist` middleware | `syncObservable` with plugin |
| **Actions** | Functions in store | Functions in observable (same!) |
| **Deep Updates** | Manual spreading | Automatic with `.set()` |
| **Computed** | Manual memoization | Functions that auto-recompute |

---

## 💡 **BEST PRACTICES**

### 1. **Use `$` suffix for observables**
```typescript
const user$ = observable({ name: '' })     // ✅ Good
const user = observable({ name: '' })      // ⚠️ Confusing
```

### 2. **Don't modify raw data**
```typescript
// ❌ BAD - Breaks reactivity
const data = store$.data.get()
data.name = 'New'
store$.data.set(data)

// ✅ GOOD - Use observables
store$.data.name.set('New')
```

### 3. **Use `peek()` when you don't need reactivity**
```typescript
// In a non-reactive context (like event handlers)
const count = store$.count.peek()  // ✅ Efficient
```

### 4. **Batch multiple updates**
```typescript
import { batch } from '@legendapp/state'

batch(() => {
  store$.count.set(5)
  store$.name.set('Test')
  store$.isActive.set(true)
})
// Only triggers one re-render!
```

### 5. **Use `Memo` for expensive renders**
```typescript
function Component() {
  // Component never re-renders
  return (
    <View>
      <Memo>
        {() => <ExpensiveChart data={data$.get()} />}
      </Memo>
    </View>
  )
}
```

---

## 🎨 **MIGRATION CHECKLIST**

### **Step 1: Install Legend-State**
```bash
npm install @legendapp/state@beta
npm install react-native-mmkv  # For persistence
```

### **Step 2: Create observables**
- Replace `create()` with `observable()`
- Remove `set` and `get` parameters
- Keep functions as-is

### **Step 3: Update persistence**
- Replace `persist` middleware with `syncObservable`
- Configure MMKV or AsyncStorage plugin

### **Step 4: Update components**
- Replace `useStore()` with `useValue(store$)`
- Replace selectors with `useValue(() => ...)`
- Replace `getState()` with `.peek()` or `.get()`

### **Step 5: Test thoroughly**
- Check all data flows
- Verify persistence works
- Test real-time updates

---

## 🔧 **RECOMMENDED SETUP FOR LITELIFE**

### **Global Configuration File**

```typescript
// lib/legend-config.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { configureSynced } from '@legendapp/state/sync'
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv'

// Use MMKV for best performance
export const persistOptions = configureSynced({
  persist: {
    plugin: ObservablePersistMMKV
  }
})
```

### **Store File Pattern**

```typescript
// stores/theme.ts
import { observable } from '@legendapp/state'
import { syncObservable } from '@legendapp/state/sync'
import { persistOptions } from '../lib/legend-config'

export const theme$ = observable({
  gender: 'male' as 'male' | 'female',
  setGender: (gender: 'male' | 'female') => theme$.gender.set(gender)
})

syncObservable(theme$, persistOptions({
  persist: { name: 'theme' }
}))
```

### **Component Pattern**

```typescript
// app/profile/index.tsx
import { useValue } from '@legendapp/state/react'
import { user$ } from '../../stores/user'

export default function Profile() {
  const profile = useValue(user$.profile)
  const isLoading = useValue(user$.isLoading)
  
  if (isLoading) return <LoadingSpinner />
  
  return (
    <View>
      <Text>{profile?.name}</Text>
    </View>
  )
}
```

---

## 📈 **PERFORMANCE BENEFITS YOU'LL SEE**

1. **Eliminate Flicker** - Fine-grained updates prevent unnecessary re-renders
2. **Faster Persistence** - MMKV is 30x faster than AsyncStorage
3. **Smaller Bundle** - 4kb vs Zustand's ~5kb
4. **Less Boilerplate** - No more `.getState()` workarounds
5. **Better TypeScript** - Superior type inference
6. **Smoother Animations** - Less rendering = smoother UI

---

## 🎯 **NEXT STEPS**

1. ✅ Research completed
2. ⏭️ Start with `themeStore` (easiest)
3. ⏭️ Then `onboardingStore`
4. ⏭️ Then complex stores

---

## 📚 **RESOURCES**

- **Official Docs:** https://legendapp.com/open-source/state/v3/intro/introduction/
- **React API:** https://legendapp.com/open-source/state/v3/react/react-api/
- **Persistence:** https://legendapp.com/open-source/state/v3/sync/persist-sync/
- **GitHub:** https://github.com/LegendApp/legend-state
- **Discord:** https://discord.gg/5CBaNtADNX

---

**Ready to migrate!** 🚀

This is the right tool for your project. Legend-State will solve your flicker issues and make your app significantly faster.
