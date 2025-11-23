const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function androidManifestPlugin(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    // Add queries section if it doesn't exist
    if (!androidManifest.queries) {
      androidManifest.queries = [];
    }

    // Add Health Connect package query
    androidManifest.queries.push({
      package: [{ $: { 'android:name': 'com.google.android.apps.healthconnect' } }],
      intent: [
        {
          $: {},
          action: [{ $: { 'android:name': 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE' } }],
        },
      ],
    });

    // Add uses-permission elements if they don't exist
    if (!androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = [];
    }

    // Add Health Connect permissions
    const healthPermissions = [
      'android.permission.health.READ_STEPS',
      'android.permission.health.READ_DISTANCE',
      'android.permission.health.READ_ACTIVE_CALORIES_BURNED',
      'android.permission.health.WRITE_NUTRITION',
      'android.permission.health.READ_NUTRITION',
    ];

    healthPermissions.forEach((permission) => {
      const exists = androidManifest['uses-permission'].some(
        (p) => p.$['android:name'] === permission
      );
      if (!exists) {
        androidManifest['uses-permission'].push({
          $: { 'android:name': permission },
        });
      }
    });

    // Ensure we have an application element
    if (!androidManifest.application) {
      androidManifest.application = [{}];
    }

    // Add main activity element
    const mainActivity = {
      $: {
        'android:name': '.MainActivity',
        'android:label': '@string/app_name',
        'android:configChanges': 'keyboard|keyboardHidden|orientation|screenSize|uiMode',
        'android:launchMode': 'singleTask',
        'android:windowSoftInputMode': 'adjustResize',
        'android:theme': '@style/Theme.App.SplashScreen',
        'android:exported': 'true',
      },
      'intent-filter': [
        {
          $: {},
          action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
          category: [{ $: { 'android:name': 'android.intent.category.LAUNCHER' } }],
        },
        {
          action: [{ $: { 'android:name': 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE' } }],
        },
      ],
    };

    // Add or update the MainActivity in the manifest
    if (!androidManifest.application[0].activity) {
      androidManifest.application[0].activity = [mainActivity];
    } else {
      androidManifest.application[0].activity[0] = {
        ...androidManifest.application[0].activity[0],
        ...mainActivity,
      };
    }

    return config;
  });
};
