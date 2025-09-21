# HTTP Client Service

## Overview

The unified HTTP client provides a consistent interface for making HTTP requests across all platforms (web, iOS, Android). It automatically chooses the best implementation based on the current platform:

- **iOS**: Uses `CapacitorHttp` to bypass CORS restrictions
- **Web/Android**: Uses Axios with proper interceptors and error handling

## Architecture

```
┌─────────────────┐
│   Application   │
├─────────────────┤
│  Data Provider  │
│  Auth Provider  │
├─────────────────┤
│ Unified Client  │
├─────────────────┤
│ CapacitorHttp   │    │ Axios Instance │
│   (iOS only)    │    │  (Web/Android) │
└─────────────────┘    └────────────────┘
```

## Usage

### Basic Usage

```typescript
import { httpClient } from '../services/httpClient';

// GET request
const response = await httpClient.get('/api/users');

// POST request
const response = await httpClient.post('/api/users', { name: 'John' });

// PUT request
const response = await httpClient.put('/api/users/1', { name: 'Jane' });

// DELETE request
const response = await httpClient.delete('/api/users/1');
```

### Advanced Usage

```typescript
import { UnifiedHttpClient } from '../services/httpClient';

// Custom request with full configuration
const response = await UnifiedHttpClient.request({
  url: '/api/data',
  method: 'POST',
  data: { key: 'value' },
  headers: { 'Custom-Header': 'value' }
});
```

### Platform Detection

```typescript
import { PlatformDetector } from '../services/httpClient';

// Check current platform
const isIOS = PlatformDetector.isIOS();
const isAndroid = PlatformDetector.isAndroid();
const isWeb = PlatformDetector.isWeb();
const isNative = PlatformDetector.isNative();

// Check if CapacitorHttp should be used
const useCapacitor = PlatformDetector.shouldUseCapacitorHttp();
```

## Features

### Automatic Platform Detection
- Detects the current platform at runtime
- Chooses the appropriate HTTP implementation
- Seamless switching between implementations

### Unified Response Format
- Standardized response interface across platforms
- Consistent error handling
- Normalized status codes and headers

### Automatic Header Management
- Injects required headers for Django CORS
- Adds restaurant ID from localStorage
- Handles CSRF tokens automatically

### Error Handling
- Normalizes errors across different HTTP clients
- Provides meaningful error messages
- Maintains error response data

## Configuration

### Environment Variables
- `VITE_API_URL`: Base URL for API requests (defaults to `https://api.dev.tabla.ma`)

### Headers
The client automatically adds these headers:
- `Content-Type: application/json`
- `Accept: application/json`
- `X-Requested-With: XMLHttpRequest` (for Django CORS)
- `X-Restaurant-ID: <id>` (from localStorage)
- `X-CSRFToken: <token>` (from localStorage or cookies)

## Best Practices

### Do's
- ✅ Use the unified client for all HTTP requests
- ✅ Let the client handle platform detection automatically
- ✅ Use TypeScript interfaces for request/response types
- ✅ Handle errors appropriately in your components

### Don'ts
- ❌ Don't import axios or CapacitorHttp directly
- ❌ Don't manually detect platforms for HTTP decisions
- ❌ Don't bypass the unified client
- ❌ Don't hardcode headers that are handled automatically

## Migration Guide

### From Direct Axios Usage
```typescript
// Before
import axiosInstance from './axiosInstance';
const response = await axiosInstance.get('/api/data');

// After
import { httpClient } from '../services/httpClient';
const response = await httpClient.get('/api/data');
```

### From Direct CapacitorHttp Usage
```typescript
// Before
import { CapacitorHttp } from '@capacitor/core';
const response = await CapacitorHttp.request({
  url: 'https://api.dev.tabla.ma/api/data',
  method: 'GET'
});

// After
import { httpClient } from '../services/httpClient';
const response = await httpClient.get('/api/data');
```

## Troubleshooting

### Common Issues

1. **CORS Errors on iOS**
   - The client automatically uses CapacitorHttp on iOS to bypass CORS
   - Ensure the unified client is being used instead of direct axios

2. **Missing Headers**
   - Check that restaurant_id is properly stored in localStorage
   - Verify CSRF tokens are available

3. **Type Errors**
   - Use the provided TypeScript interfaces
   - Import types from the httpClient module

### Debugging

Enable debug logging by checking the browser console for:
- `[HttpClient] Platform: ...` - Shows platform detection
- `[HttpClient] CapacitorHttp ...` - Shows CapacitorHttp requests
- `[HttpClient] Axios ...` - Shows Axios requests