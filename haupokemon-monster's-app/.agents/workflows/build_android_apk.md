---
description: How to build and generate the Android APK
---
# Generating the Android APK

Since this is a Capacitor (React/Vite) application, your frontend changes need to be bundled and copied into the Android project before Android Studio can build the final APK.

Follow these steps every time you want to create a new APK after making changes to the React code:

1. **Build the Web Assets:**
   Run the following command in your terminal to compile your React code:
   `npm run build`

2. **Sync with Capacitor:**
   Copy the newly built web assets into your Android project:
   `npx cap sync android`

3. **Android Studio Steps:**
   - Click the **Sync Project with Gradle Files** (the Elephant icon) to ensure all native dependencies are caught up.
   - Go to **Build > Clean Project** to clear the old cache.
   - Go to **Build > Generate Signed App Bundle / APK...** to build your new release!
