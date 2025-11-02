const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function androidManifestPlugin(config) {
  return withAndroidManifest(config, async (config) => {
    let androidManifest = config.modResults.manifest;

    // Add queries section if it doesn't exist
    if (!androidManifest.queries) {
      androidManifest.queries = [];
    }

    // Add Health Connect package query
    androidManifest.queries.push({
      package: [
        { $: { 'android:name': 'com.google.android.apps.healthconnect' } }
      ],
      intent: [
        {
          $: {},
          action: [{ $: { 'android:name': 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE' } }]
        }
      ]
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
        'android:exported': 'true'
      },
      'intent-filter': [
        {
          $: {},
          action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
          category: [{ $: { 'android:name': 'android.intent.category.LAUNCHER' } }]
        },
        {
          action: [{ $: { 'android:name': 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE' } }]
        }
      ]
    };

    // Add or update the MainActivity in the manifest
    if (!androidManifest.application[0].activity) {
      androidManifest.application[0].activity = [mainActivity];
    } else {
      androidManifest.application[0].activity[0] = {
        ...androidManifest.application[0].activity[0],
        ...mainActivity
      };
    }

    return config;
  });
};