# iOS Platform Setup and Configuration

## Overview

This document covers the complete setup and configuration required for iOS platform support in the Tabla Manager app, including push notifications, network handling, and platform-specific configurations.

## iOS-Specific Issues and Solutions

### 1. Network Connectivity (ERR_NETWORK)

#### Problem
iOS WebView enforces strict CORS policies that prevent standard HTTP requests from working, resulting in `ERR_NETWORK` errors.

#### Root Cause
```
ERROR: A server with the specified hostname could not be found
URL Construction Bug: https://api.dev.tabla.maapi/v1/notifications/
                                             ↑ Missing slash
```

#### Solutions Applied

##### HTTP Client Migration
- **Created unified HTTP client** that automatically uses CapacitorHttp for iOS
- **Fixed URL construction** to ensure proper leading slashes
- **Added platform detection** to route requests appropriately

##### Network Configuration in Info.plist
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>api.dev.tabla.ma</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <false/>
            <key>NSExceptionMinimumTLSVersion</key>
            <string>TLSv1.0</string>
        </dict>
    </dict>
</dict>
```

### 2. Push Notifications Setup

#### Firebase Integration

##### AppDelegate.swift Configuration
```swift
import FirebaseCore
import FirebaseMessaging

func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // Configure Firebase
    if let path = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist"),
       FileManager.default.fileExists(atPath: path) {
        FirebaseApp.configure()
        Messaging.messaging().delegate = self
    }
    
    // Register for push notifications
    UNUserNotificationCenter.current().delegate = self
    let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
    UNUserNotificationCenter.current().requestAuthorization(options: authOptions) { _, _ in }
    application.registerForRemoteNotifications()
    
    return true
}
```

##### Podfile Dependencies
```ruby
target 'App' do
  capacitor_pods
  pod 'Firebase/Core'
  pod 'Firebase/Messaging'
end
```

##### GoogleService-Info.plist Integration
1. **File Location**: `/ios/App/App/GoogleService-Info.plist`
2. **Xcode Project Integration**: Added to project.pbxproj with proper build phases
3. **Bundle Target**: Correctly added to App target for resource bundling

#### Device Type Detection Fix
**Problem**: iOS devices were being registered as 'ANDROID' in the backend

**Solution**:
```typescript
// In CapacitorNotificationManager.ts
const platform = Capacitor.getPlatform();
const deviceType = platform === 'ios' ? 'IOS' : 'ANDROID';

await httpClient.post('api/v1/device-tokens/', {
  token,
  device_type: deviceType // Now correctly sends 'IOS'
});
```

#### Info.plist Configuration
```xml
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>
```

### 3. Capacitor Configuration

#### capacitor.config.ts
```typescript
const config: CapacitorConfig = {
  appId: 'com.tabla.tablabomobile',
  appName: 'Tabla Manager',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};
```

## Platform-Specific Code Patterns

### HTTP Requests
```typescript
// ✅ Correct - Works on all platforms
import { httpClient } from '../services/httpClient';
const response = await httpClient.get('/api/v1/notifications/');

// ❌ Wrong - Fails on iOS
import axiosInstance from '../providers/axiosInstance';
const response = await axiosInstance.get('/api/v1/notifications/');
```

### Platform Detection
```typescript
import { Capacitor } from '@capacitor/core';

// Check if running on iOS
const isIOS = Capacitor.getPlatform() === 'ios';

// Check if running on native platform
const isNative = Capacitor.isNativePlatform();

// Use appropriate notification manager
const notificationManager = isNative 
  ? new CapacitorNotificationManager() 
  : new WebNotificationManager();
```

### File Uploads
```typescript
// FormData is automatically detected by httpClient
const formData = new FormData();
formData.append('logo', file);
formData.append('title', title);

// ✅ Automatically handles Content-Type for multipart uploads
await httpClient.patch('/api/v1/reviews/widget', formData);
```

## Build and Deployment

### Development Build Process
```bash
# 1. Build web assets
npm run build

# 2. Sync with Capacitor
npx cap sync ios

# 3. Install iOS dependencies
cd ios/App && pod install

# 4. Open in Xcode
npx cap open ios
```

### Xcode Project Configuration

#### Required Capabilities
1. **Push Notifications**: Enable in App > Signing & Capabilities
2. **Background Modes**: Remote notifications checked
3. **App Groups**: If needed for advanced notification features

#### Provisioning Profile
- Must include Push Notifications capability
- Bundle ID: `com.tabla.tablabomobile`
- Must match Firebase project configuration

#### Build Settings
- iOS Deployment Target: 13.0+
- Swift Language Version: 5.x
- Enable Bitcode: No (required for Capacitor)

### Production Deployment

#### Firebase Console Setup
1. **APNs Authentication Key**: Upload .p8 file with Key ID and Team ID
2. **Bundle ID Verification**: Ensure matches Xcode project
3. **Test Notifications**: Use Firebase Console messaging tool

#### App Store Connect
1. **Push Notification Entitlement**: Must be enabled
2. **Privacy Manifest**: Include network usage descriptions
3. **App Transport Security**: Configured for API domains

## Testing Procedures

### iOS Simulator Testing
```bash
# Run in iOS simulator
npx cap run ios

# Specific simulator
npx cap run ios --target="iPhone 15 Pro"
```

### Physical Device Testing
1. **Development Provisioning**: Required for push notifications
2. **Network Connectivity**: Test on cellular and WiFi
3. **Notification Permissions**: Test permission flows
4. **Background App Refresh**: Verify background notification handling

### Debug Commands
```bash
# View device logs
xcrun devicectl list devices
xcrun devicectl logs collect --device-id <DEVICE_ID>

# Firebase debugging
# Add to AppDelegate.swift for verbose Firebase logging
FirebaseApp.configure()
FirebaseConfiguration.shared.setLoggerLevel(.debug)
```

## Common iOS Issues and Solutions

### Issue 1: Build Input File Cannot Be Found
```
Build input file cannot be found: 'GoogleService-Info 3.plist'
```

**Solution**: Remove duplicate files from Xcode project, ensure only `GoogleService-Info.plist` (without numbers) exists

### Issue 2: Firebase Configuration Error
```
'FirebaseApp.configure()' could not find a valid GoogleService-Info.plist
```

**Solution**: 
1. Verify file is in Xcode project
2. Check it's added to App target
3. Confirm file is in Resources build phase

### Issue 3: Push Notifications Not Received
**Checklist**:
- [ ] User granted notification permissions
- [ ] APNs key uploaded to Firebase Console
- [ ] Bundle ID matches Firebase project
- [ ] FCM token successfully registered
- [ ] Device is online and app is backgrounded

### Issue 4: Network Requests Failing
**Debug Steps**:
1. Check if using httpClient vs axiosInstance
2. Verify URL construction (leading slash)
3. Confirm platform detection is working
4. Check network connectivity

### Issue 5: CORS Errors
```
Access to fetch at 'https://api.dev.tabla.ma' from origin 'capacitor://localhost' has been blocked by CORS policy
```

**Solution**: Ensure httpClient is being used, which automatically routes to CapacitorHttp on iOS

## Performance Considerations

### Memory Management
- Firebase messaging listeners are properly cleaned up
- HTTP requests are cancelled when components unmount
- Image uploads are properly managed for large files

### Battery Optimization
- Background app refresh is managed appropriately
- Push notifications use efficient payload sizes
- Network requests are batched when possible

### User Experience
- Loading states for network operations
- Graceful degradation when offline
- Clear error messages for network issues

## Security Considerations

### Network Security
- TLS 1.2+ enforced for all API calls
- Certificate pinning can be added if needed
- No sensitive data in URL parameters

### Push Notification Security
- FCM tokens are securely stored and transmitted
- Notification payloads don't contain sensitive data
- Device tokens are invalidated on logout

### Data Protection
- Sensitive data encrypted in device storage
- Biometric authentication supported for app access
- Network traffic encrypted end-to-end

## Maintenance and Updates

### Regular Maintenance Tasks
1. **Update Firebase SDK**: Keep Firebase dependencies current
2. **iOS Version Testing**: Test on new iOS releases
3. **Certificate Renewal**: Monitor APNs certificate expiration
4. **Dependency Updates**: Keep Capacitor and plugins updated

### Monitoring and Analytics
- Track push notification delivery rates
- Monitor API error rates by platform
- Analyze app performance metrics
- User engagement with notifications

### Emergency Procedures
1. **Push Notification Issues**: Verify Firebase Console status
2. **Network Connectivity**: Check API server status
3. **App Store Rejection**: Review submission guidelines
4. **Critical Bug**: Implement feature flags for quick rollback

## Future Enhancements

### Planned Improvements
1. **Background Sync**: Sync data when app comes to foreground
2. **Offline Mode**: Queue operations when network unavailable
3. **Advanced Notifications**: Rich media notifications
4. **Performance Monitoring**: Real-time performance tracking

### iOS-Specific Features
1. **Shortcuts**: Siri shortcuts for common actions
2. **Widgets**: Today view widgets for quick access
3. **Handoff**: Continue tasks across devices
4. **Spotlight Search**: Index app content for search