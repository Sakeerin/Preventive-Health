# Google Play Store Health Connect Compliance

This document outlines the compliance requirements for using Health Connect API on Android as required by Google Play policies.

## Required Permissions

Add the following permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Health Connect Permissions -->
    <uses-permission android:name="android.permission.health.READ_STEPS" />
    <uses-permission android:name="android.permission.health.READ_HEART_RATE" />
    <uses-permission android:name="android.permission.health.READ_SLEEP" />
    <uses-permission android:name="android.permission.health.READ_ACTIVE_CALORIES_BURNED" />
    <uses-permission android:name="android.permission.health.READ_RESTING_HEART_RATE" />
    <uses-permission android:name="android.permission.health.READ_WEIGHT" />
    <uses-permission android:name="android.permission.health.READ_BODY_FAT" />
    <uses-permission android:name="android.permission.health.READ_HYDRATION" />

    <application>
        <!-- Health Connect Intent Filter -->
        <activity android:name=".MainActivity">
            <intent-filter>
                <action android:name="androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE" />
            </intent-filter>
        </activity>

        <!-- Health Connect Permissions Declaration -->
        <activity
            android:name="androidx.health.connect.client.permission.HealthPermissionsRequestActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE" />
            </intent-filter>
        </activity>
    </application>

    <!-- Declare Health Connect capability -->
    <queries>
        <package android:name="com.google.android.apps.healthdata" />
    </queries>
</manifest>
```

## Privacy Policy Requirements

Your app's privacy policy MUST include:

1. **What data is collected**: List all health data types accessed (steps, heart rate, sleep, etc.)
2. **How data is used**: Describe how health data is used in the app
3. **Data sharing**: Disclose if/how data is shared with third parties
4. **Data retention**: Specify how long health data is stored
5. **User rights**: Explain how users can delete their data

### Sample Privacy Policy Section

```markdown
## Health Data Collection

Our app accesses health data from Android Health Connect to provide personalized wellness insights.

### Data We Collect
- Steps and distance walked
- Heart rate measurements
- Sleep duration and quality
- Active calories burned
- Weight and body composition

### How We Use Your Data
- Display your health metrics on the dashboard
- Calculate wellness trends (7-day, 30-day)
- Generate personalized health insights
- Track progress toward your goals

### Data Security
- Health data is encrypted in transit and at rest
- Data is stored securely on our servers
- We never sell your health data to third parties

### Your Rights
- You can revoke Health Connect permissions at any time
- You can request deletion of your data via app settings
- You can export your data in standard formats
```

## Play Console Declaration

When submitting to Play Store, you must:

1. **Complete the Data Safety form** declaring health data collection
2. **Provide a permissions declaration form** explaining why each permission is needed
3. **Link your privacy policy** in the app listing

## User Experience Requirements

1. **Explain permissions before requesting**: Show a screen explaining why health data is needed
2. **Handle permission denial gracefully**: App must work (with reduced functionality) if permissions are denied
3. **Provide settings to revoke access**: Users must be able to disconnect Health Connect

## Testing Checklist

- [ ] Health Connect SDK properly initialized
- [ ] All required permissions declared in manifest
- [ ] Privacy policy updated with health data section
- [ ] Permission rationale screen implemented
- [ ] App handles permission denial gracefully
- [ ] Settings screen allows revoking access
- [ ] Data deletion request flow works
- [ ] Play Console data safety form completed

## Resources

- [Health Connect Developer Guide](https://developer.android.com/health-and-fitness/guides/health-connect)
- [Play Console Health Connect Requirements](https://support.google.com/googleplay/android-developer/answer/13327111)
- [Android Health Connect Permissions](https://developer.android.com/health-and-fitness/guides/health-connect/develop/requesting-permissions)
