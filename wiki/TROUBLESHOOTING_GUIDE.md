# Troubleshooting Guide

## Overview

This guide provides solutions to common issues encountered in the Tabla Back Office application, with special focus on cross-platform compatibility and iOS-specific problems.

## Network and HTTP Issues

### ERR_NETWORK on iOS

#### Symptoms
```
⚡️ [error] - {"message":"A server with the specified hostname could not be found.","code":"NSURLErrorDomain","errorMessage":"A server with the specified hostname could not be found."}
```

#### Diagnosis
1. **Check URL Construction**:
   ```typescript
   // Look for malformed URLs in console
   console.log('Request URL:', requestUrl);
   // Should be: https://api.dev.tabla.ma/api/v1/notifications/
   // Not: https://api.dev.tabla.maapi/v1/notifications/
   ```

2. **Verify HTTP Client Usage**:
   ```typescript
   // ❌ Wrong - will fail on iOS
   import axiosInstance from '../providers/axiosInstance';
   
   // ✅ Correct - works on all platforms  
   import { httpClient } from '../services/httpClient';
   ```

3. **Platform Detection Debug**:
   ```typescript
   import { Capacitor } from '@capacitor/core';
   console.log('Platform:', Capacitor.getPlatform());
   console.log('Is native:', Capacitor.isNativePlatform());
   ```

#### Solutions
1. **Immediate Fix**: Replace `axiosInstance` with `httpClient`
2. **URL Fix**: Ensure all API calls use absolute URLs or proper relative paths
3. **Platform Fix**: Verify platform detection is working correctly

#### Prevention
- Always use `httpClient` for new API calls
- Use proper URL construction with leading slashes
- Test on iOS simulator/device before deploying

---

### CORS Errors

#### Symptoms
```
Access to fetch at 'https://api.dev.tabla.ma' from origin 'capacitor://localhost' has been blocked by CORS policy
```

#### Root Cause
- Using axios directly instead of unified HTTP client
- Missing required headers for Django CORS

#### Solution
```typescript
// Replace direct axios usage
const response = await httpClient.get('/api/v1/endpoint', {
  headers: {
    'X-Requested-With': 'XMLHttpRequest' // Automatically added by httpClient
  }
});
```

---

### Request Timeout Issues

#### Symptoms
- Requests hanging indefinitely
- App becoming unresponsive during API calls

#### Diagnosis
```typescript
// Add timeout debugging
const controller = new AbortController();
setTimeout(() => controller.abort(), 30000); // 30 second timeout

try {
  const response = await httpClient.get('/api/v1/endpoint', {
    signal: controller.signal
  });
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request timed out');
  }
}
```

#### Solutions
1. **Increase timeout** for large exports
2. **Implement retry logic** for failed requests
3. **Add loading states** to improve UX
4. **Use async task manager** for long-running operations

---

## Push Notification Issues

### iOS Push Notifications Not Working

#### Diagnostic Checklist
- [ ] GoogleService-Info.plist properly added to Xcode project
- [ ] Firebase properly initialized in AppDelegate.swift
- [ ] Push notification permissions granted
- [ ] FCM token being generated and registered
- [ ] APNs key uploaded to Firebase Console
- [ ] Bundle ID matches Firebase project

#### Common Issues and Fixes

##### 1. Firebase Configuration Error
```
'FirebaseApp.configure()' could not find a valid GoogleService-Info.plist
```

**Solution**:
```bash
# Verify file exists and is properly named
ls -la ios/App/App/GoogleService-Info.plist

# Ensure no numbered duplicates exist
find ios/App/App -name "GoogleService-Info*.plist"
```

**If duplicates exist**:
1. Remove numbered files from Xcode project
2. Keep only `GoogleService-Info.plist`
3. Clean build folder in Xcode

##### 2. FCM Token Not Generated
**Debug Steps**:
```swift
// Add to AppDelegate.swift for debugging
Messaging.messaging().token { token, error in
  if let error = error {
    print("Error fetching FCM registration token: \(error)")
  } else if let token = token {
    print("FCM registration token: \(token)")
  }
}
```

**Common Causes**:
- Simulator doesn't support push notifications (use physical device)
- Network connectivity issues
- Firebase project misconfiguration

##### 3. Device Type Registration Error
**Symptom**: iOS devices showing as 'ANDROID' in backend

**Solution**:
```typescript
// Verify CapacitorNotificationManager.ts has correct platform detection
const platform = Capacitor.getPlatform();
const deviceType = platform === 'ios' ? 'IOS' : 'ANDROID';
```

##### 4. Notifications Not Received
**Debug Process**:
1. **Check Firebase Console**: Send test message to specific token
2. **Verify APNs Setup**: Ensure authentication key is uploaded
3. **Check App State**: Notifications behavior differs between foreground/background
4. **Review Payload**: Ensure notification format is correct

---

## Build and Deployment Issues

### iOS Build Failures

#### GoogleService-Info.plist Build Errors
```
Build input file cannot be found: '/path/to/GoogleService-Info 3.plist'
```

**Solution**:
1. **Clean Xcode project**: Product → Clean Build Folder
2. **Remove duplicate references** in project.pbxproj
3. **Re-add file** if necessary
4. **Verify target membership**: Ensure file is added to App target

#### Pod Install Failures
```
[!] CocoaPods could not find compatible versions for pod "Firebase/Core"
```

**Solution**:
```bash
# Update CocoaPods repository
pod repo update

# Clean and reinstall
cd ios/App
rm -rf Pods Podfile.lock
pod install

# If still failing, update pod version in Podfile
pod 'Firebase/Core', '~> 10.0'
```

#### Capacitor Sync Issues
```
✖ copy ios - failed to copy files
```

**Solution**:
```bash
# Clean and rebuild
npm run build
npx cap clean ios
npx cap add ios
npx cap sync ios
```

---

### File Upload Issues

#### FormData Upload Failures on iOS

#### Symptoms
- File uploads work on web but fail on iOS
- Multipart/form-data requests returning errors

#### Diagnosis
```typescript
// Check if FormData is being detected correctly
const isFormData = data instanceof FormData;
console.log('Is FormData:', isFormData);
console.log('Using CapacitorHttp:', PlatformDetector.shouldUseCapacitorHttp());
```

#### Solution
Ensure httpClient is used and properly handles FormData:
```typescript
// ✅ Correct - automatically handles FormData
const formData = new FormData();
formData.append('file', file);
await httpClient.post('/api/v1/upload', formData);
// Content-Type is automatically set with proper boundary
```

---

## Performance Issues

### Export Generation Timeouts

#### Symptoms
- Large export files timing out
- Memory issues during export processing

#### Solutions
1. **Use Async Task Manager**:
   ```typescript
   // For large exports, use async generation
   const { startTask } = useAsyncTaskManager();
   const response = await httpClient.post('/api/v1/bo/reports/reviews/', {
     ...requestBody,
     async_generation: true
   });
   startTask(response.data.task_id);
   ```

2. **Implement Pagination**:
   ```typescript
   // Break large exports into chunks
   const pageSize = 1000;
   for (let page = 1; page <= totalPages; page++) {
     await httpClient.get('/api/v1/export', { 
       params: { page, page_size: pageSize }
     });
   }
   ```

### Memory Leaks

#### Symptoms
- App becoming slower over time
- Increased memory usage
- Crashes on iOS after prolonged use

#### Debug Tools
```typescript
// Monitor memory usage
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    if (performance.memory) {
      console.log('Memory usage:', {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
        total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB'
      });
    }
  }, 10000);
}
```

#### Solutions
1. **Cleanup Event Listeners**:
   ```typescript
   useEffect(() => {
     const unsubscribe = onMessage(handleMessage);
     return () => unsubscribe(); // Important!
   }, []);
   ```

2. **Cancel Pending Requests**:
   ```typescript
   useEffect(() => {
     const controller = new AbortController();
     
     httpClient.get('/api/endpoint', { 
       signal: controller.signal 
     });
     
     return () => controller.abort();
   }, []);
   ```

---

## Data Synchronization Issues

### State Inconsistency

#### Symptoms
- UI showing outdated data
- Optimistic updates not reverting on error
- Race conditions in data updates

#### Solutions
1. **Implement Proper Error Handling**:
   ```typescript
   const [optimisticState, setOptimisticState] = useState(initialState);
   
   try {
     // Optimistic update
     setOptimisticState(newState);
     await httpClient.post('/api/update', data);
   } catch (error) {
     // Revert on error
     setOptimisticState(previousState);
     throw error;
   }
   ```

2. **Use Refine's Mutation Hooks**:
   ```typescript
   const { mutate } = useUpdate();
   
   mutate({
     resource: 'notifications',
     id: notificationId,
     values: { is_read: true }
   }, {
     onError: () => {
       // Automatically reverts optimistic update
     }
   });
   ```

---

## Authentication Issues

### Token Refresh Failures

#### Symptoms
- User logged out unexpectedly
- API calls returning 401 errors
- Token refresh loop

#### Diagnosis
```typescript
// Check token status
const token = localStorage.getItem('access');
const refreshToken = localStorage.getItem('refresh');
const isLoggedIn = localStorage.getItem('isLogedIn');

console.log('Auth state:', { token: !!token, refresh: !!refreshToken, loggedIn: isLoggedIn });
```

#### Solutions
1. **Verify Token Refresh Logic**:
   ```typescript
   // In authProvider.ts
   refresh: async () => {
     const refreshToken = localStorage.getItem('refresh');
     if (!refreshToken) {
       throw new Error('No refresh token available');
     }
     
     const response = await httpClient.post('/api/v1/auth/token/refresh/', {
       refresh: refreshToken
     });
     
     localStorage.setItem('refresh', response.data.refresh);
     return { success: true };
   }
   ```

2. **Handle Authentication Errors**:
   ```typescript
   // Ensure all HTTP clients handle auth errors consistently
   if (status === 401 || status === 403 || status === 411) {
     localStorage.clear();
     window.location.href = '/sign-in';
   }
   ```

---

## Debugging Tools and Techniques

### Development Debugging

#### HTTP Request Logging
```typescript
// Add to httpClient for debugging
console.log(`[HttpClient] ${config.method} ${fullUrl}`, {
  platform: Capacitor.getPlatform(),
  useCapacitorHttp,
  headers,
  data: config.data
});
```

#### Platform-Specific Debugging
```typescript
// iOS specific debugging
if (Capacitor.getPlatform() === 'ios') {
  console.log('iOS specific debug info');
  // Add iOS-specific logging
}
```

### Production Debugging

#### Error Tracking
```typescript
// Implement error tracking service
const logError = (error: Error, context: string) => {
  console.error(`[${context}]`, error);
  
  // Send to error tracking service
  if (window.analytics) {
    window.analytics.track('error', {
      message: error.message,
      stack: error.stack,
      context,
      platform: Capacitor.getPlatform()
    });
  }
};
```

#### Performance Monitoring
```typescript
// Track API performance
const measureApiCall = async (endpoint: string, request: () => Promise<any>) => {
  const start = performance.now();
  try {
    const result = await request();
    const duration = performance.now() - start;
    console.log(`[API] ${endpoint} completed in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[API] ${endpoint} failed after ${duration}ms:`, error);
    throw error;
  }
};
```

---

## Emergency Procedures

### Critical Bug Response

#### Immediate Actions
1. **Identify Scope**: Determine if issue affects all platforms or specific to iOS
2. **Implement Feature Flag**: Temporarily disable affected feature if possible
3. **Rollback Strategy**: Revert to previous working version if necessary

#### Rollback Process
```bash
# Quick rollback for HTTP client issues
git revert <commit-hash>  # Revert HTTP client changes
npm run build
npx cap sync ios
```

#### Communication Template
```markdown
**Issue**: [Brief description]
**Platforms Affected**: iOS / Android / Web / All
**Severity**: Critical / High / Medium / Low
**Workaround**: [If available]
**ETA for Fix**: [Time estimate]
**Status**: Investigating / Fix in Progress / Testing / Resolved
```

### Escalation Paths

#### Technical Issues
1. **Level 1**: Front-end developer
2. **Level 2**: Senior developer / Team lead
3. **Level 3**: Architecture team / DevOps

#### Infrastructure Issues
1. **API Issues**: Backend team
2. **Firebase Issues**: DevOps / Firebase admin
3. **App Store Issues**: Release management team

---

## Prevention Strategies

### Code Quality
- **Always use httpClient** for new API calls
- **Test on all platforms** before merging
- **Implement proper error handling** for all network requests
- **Use TypeScript strictly** to catch issues early

### Monitoring
- **Set up error tracking** for production issues
- **Monitor API response times** across platforms
- **Track user engagement** with features
- **Alert on critical error rates**

### Testing
- **Automated testing** for core flows
- **Manual testing** on physical iOS devices
- **Performance testing** for large data operations
- **Regression testing** after major changes

This troubleshooting guide should be updated as new issues are discovered and resolved.