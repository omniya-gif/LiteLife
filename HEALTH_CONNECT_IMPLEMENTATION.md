# Health Connect Implementation Guide

## Overview
This implementation adds comprehensive Health Connect support to LiteLife, allowing the app to request permissions, check status, and read health data from Android's Health Connect platform.

## What Was Implemented

### 1. Custom Hook: `useHealthConnect`
**Location**: `hooks/useHealthConnect.ts`

A reusable React hook that manages Health Connect integration:

#### Features:
- **SDK Availability Check**: Detects if Health Connect is installed
- **Permission Management**: Requests and checks granted permissions
- **Initialization**: Handles Health Connect client setup
- **Error Handling**: Comprehensive error handling with user-friendly alerts
- **Helper Functions**: Ready-to-use functions for reading steps, distance, and floors data

#### Hook API:
```typescript
const healthConnect = useHealthConnect([
  { accessType: 'read', recordType: 'Steps' },
  { accessType: 'read', recordType: 'Distance' },
  // ... more permissions
]);

// Properties
healthConnect.isAvailable      // Is Health Connect installed?
healthConnect.isInitialized    // Is Health Connect initialized?
healthConnect.hasPermissions   // Does app have required permissions?
healthConnect.isChecking       // Is currently checking status?
healthConnect.error           // Error message if any

// Methods
healthConnect.requestHealthPermissions()  // Request permissions
healthConnect.installHealthConnect()      // Prompt to install HC
healthConnect.updateHealthConnect()       // Prompt to update HC
healthConnect.openSettings()             // Open HC settings
healthConnect.checkStatus()              // Recheck HC status
```

### 2. Profile Page Integration
**Location**: `app/(main)/profile/index.tsx`

#### Changes:
- Added Health Connect status indicator on the Health Connect card
- Visual status badges:
  - ✅ **Connected** (Green) - Permissions granted
  - ⚠️ **No Permission** (Orange) - App installed but no permissions
  - ❌ **Not Installed** (Red) - Health Connect not installed
  - ⏳ **Checking...** (Yellow) - Status being checked

#### User Actions:
- **If not installed**: Tap card → Prompt to install from Play Store
- **If no permissions**: Tap card → Request permissions dialog
- **If connected**: Tap card → Open Health Connect settings

### 3. Steps Tracker Page Enhancement
**Location**: `app/(main)/calculators/steps.tsx`

#### Changes:
- Integrated `useHealthConnect` hook
- Added permission status banner at the top
- Automatic data fetching when permissions are granted
- Better error handling with user-friendly prompts

#### Flow:
1. **Check Status**: On page load, check HC availability and permissions
2. **Show Banner**: If HC not available or no permissions, show orange banner
3. **User Action**: User taps "Install Now" or "Grant Permission"
4. **Auto-Fetch**: Once permissions granted, automatically fetch health data
5. **Display Data**: Show steps, distance, calories, and floors climbed

### 4. Helper Functions
**Location**: `hooks/useHealthConnect.ts`

Three helper functions for reading health data:
```typescript
// Read steps for a time range
const steps = await readStepsData(startTime, endTime);

// Read distance in meters
const distance = await readDistanceData(startTime, endTime);

// Read floors climbed
const floors = await readFloorsData(startTime, endTime);
```

## Permission Flow

### First Time User Experience:

1. **User opens Steps Tracker or Profile page**
   - Hook checks if Health Connect is installed
   - Hook checks if permissions are granted

2. **If Health Connect not installed:**
   ```
   [Orange Banner]
   ⚠️ Health Connect Not Installed
   Install Health Connect to track your steps
   [Install Now Button]
   ```
   - Tapping button opens Play Store

3. **If Health Connect installed but no permissions:**
   ```
   [Orange Banner]
   ⚠️ Permission Required
   Grant permission to read your step data
   [Grant Permission Button]
   ```
   - Tapping button shows Android permission dialog
   - User selects which data types to allow
   - If denied, shows alert with option to open settings

4. **If permissions granted:**
   - Data automatically loads
   - Banner disappears
   - Profile shows "Connected" status

## Error Handling

The implementation handles several error scenarios:

### 1. Health Connect Not Installed
```typescript
Alert.alert(
  'Health Connect Required',
  'Health Connect is required to track your fitness data. Would you like to install it?',
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Install', onPress: () => /* Open Play Store */ }
  ]
);
```

### 2. Permissions Denied
```typescript
Alert.alert(
  'Permission Required',
  'LiteLife needs permission to read your health data. Please grant the necessary permissions.',
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Open Settings', onPress: () => openHealthConnectSettings() }
  ]
);
```

### 3. Health Connect Needs Update
```typescript
Alert.alert(
  'Update Required',
  'Health Connect needs to be updated to the latest version.',
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Update', onPress: () => /* Open Play Store */ }
  ]
);
```

## Data Fetching Strategy

### Current Implementation:
- Fetches data for the **current day** (midnight to 11:59 PM)
- Updates when permissions change
- Calculates derived metrics:
  - **Calories**: Based on steps, distance, and floors
  - **Duration**: Based on distance and average walking speed

### Time Range Example:
```typescript
const now = new Date();
const startOfDay = new Date(now.setHours(0, 0, 0, 0));
const endOfDay = new Date(now.setHours(23, 59, 59, 999));

const steps = await readStepsData(
  startOfDay.toISOString(), 
  endOfDay.toISOString()
);
```

## Best Practices Implemented

1. **Gradual Permission Requests**: Only ask when user needs the feature
2. **Clear Communication**: Explain why permissions are needed
3. **Easy Recovery**: Provide paths to fix issues (install, update, grant)
4. **Visual Feedback**: Show status clearly with icons and colors
5. **Automatic Retry**: When permissions granted, automatically fetch data
6. **Error Resilience**: Never crash, always provide user options

## Testing Checklist

- [ ] Test on device without Health Connect
- [ ] Test with Health Connect installed but no permissions
- [ ] Test with permissions granted
- [ ] Test permission denial flow
- [ ] Test opening Health Connect settings
- [ ] Test data fetching after granting permissions
- [ ] Test banner display/hide logic
- [ ] Test profile page status indicator

## Future Enhancements

1. **Add more data types**: Heart rate, sleep, workouts
2. **Historical data**: Fetch data for past days/weeks
3. **Data sync**: Background sync for up-to-date data
4. **Widgets**: Home screen widget showing today's stats
5. **Goals & Achievements**: Based on Health Connect data
6. **Export/Import**: Backup health data

## References

- [Health Connect Official Docs](https://developer.android.com/guide/health-and-fitness/health-connect)
- [react-native-health-connect NPM](https://www.npmjs.com/package/react-native-health-connect)
- [Health Connect Permissions Guide](https://matinzd.github.io/react-native-health-connect/docs/permissions)
