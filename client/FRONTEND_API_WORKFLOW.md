# Frontend API Integration Workflow

## 📋 Overview

This document explains how the frontend communicates with the backend APIs, from clicking a button to seeing the result on screen.

---

## 🗂️ File Structure

```
client/
├── lib/
│   └── axios.ts                    # HTTP client setup
├── services/
│   ├── auth.service.ts             # Auth API calls
│   ├── user.service.ts             # User API calls
│   └── media.service.ts            # Cloudinary upload
├── store/
│   └── useAuthStore.ts             # Global user state
├── hooks/
│   ├── useUpdateProfile.ts         # Profile update logic
│   ├── useCloudinaryUpload.ts      # Image upload logic
│   └── useUser.ts                  # Barrel export
└── components/
    └── features/Profile/
        └── UserProfile.tsx         # Profile page UI
```

---

## 🔄 Complete Workflow: Avatar Upload

### Step 1: User Clicks Camera Icon

**File:** `UserProfile.tsx`

```typescript
// User clicks the camera icon
<button onClick={() => avatarInputRef.current?.click()}>
  <Camera />
</button>

// Hidden file input
<input 
  ref={avatarInputRef}
  type="file"
  onChange={handleAvatarUpload}  // ← Triggers when file selected
/>
```

**What happens:**
- User clicks camera icon
- Opens file picker
- User selects image
- `handleAvatarUpload` function is called

---

### Step 2: Handle File Selection

**File:** `UserProfile.tsx`

```typescript
const handleAvatarUpload = async (e) => {
  const file = e.target.files?.[0];  // Get selected file
  
  // Call upload hook
  const imageUrl = await uploadImage(file, 'avatar');
  
  // If upload successful, update profile
  if (imageUrl) {
    await updateProfile({ avatar_url: imageUrl });
  }
};
```

**What happens:**
- Gets the selected file
- Calls `uploadImage` hook
- Waits for Cloudinary URL
- Calls `updateProfile` hook to save URL

---

### Step 3: Upload to Cloudinary

**File:** `useCloudinaryUpload.ts` (Hook)

```typescript
const uploadImage = async (file, type) => {
  // 1. Validate file
  if (!file.type.startsWith('image/')) {
    toast.error('Please select an image');
    return null;
  }
  
  // 2. Get signature from backend
  const { signature, timestamp, folder } = 
    await mediaService.getUploadSignature(type);
  
  // 3. Upload to Cloudinary
  const imageUrl = await mediaService.uploadToCloudinary(
    file, signature, timestamp, folder
  );
  
  return imageUrl;
};
```

**What happens:**
- Validates file type and size
- Calls backend to get upload signature
- Uploads file directly to Cloudinary
- Returns Cloudinary URL

---

### Step 4: Get Upload Signature

**File:** `media.service.ts`

```typescript
getUploadSignature: async (type) => {
  // Calls: POST /api/v1/media/upload
  const response = await api.post('/media/upload', { type: 'avatar' });
  return response.data.data;
}
```

**What happens:**
- Sends request to backend
- Backend generates signature
- Returns: `{ signature, timestamp, folder }`

**Backend endpoint:** `POST /api/v1/media/upload`

---

### Step 5: Upload to Cloudinary

**File:** `media.service.ts`

```typescript
uploadToCloudinary: async (file, signature, timestamp, folder) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('signature', signature);
  formData.append('timestamp', timestamp);
  formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
  formData.append('folder', folder);
  
  // Upload directly to Cloudinary (not our backend!)
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );
  
  const data = await response.json();
  return data.secure_url;  // Returns Cloudinary URL
}
```

**What happens:**
- Creates FormData with file + signature
- Uploads directly to Cloudinary servers
- Cloudinary validates signature
- Returns permanent image URL

**External API:** `https://api.cloudinary.com/...`

---

### Step 6: Save URL to Database

**File:** `useUpdateProfile.ts` (Hook)

```typescript
const updateProfile = async (data) => {
  // Call user service
  const updatedUser = await userService.updateProfile(data);
  
  // Update global state
  setAuth(updatedUser, token);
  
  toast.success('Profile updated');
  return updatedUser;
};
```

**What happens:**
- Calls backend API to save URL
- Gets updated user data
- Updates global auth store
- Shows success message

---

### Step 7: API Call to Backend

**File:** `user.service.ts`

```typescript
updateProfile: async (data) => {
  // Calls: PUT /api/v1/user
  const response = await api.put('/user', {
    avatar_url: 'https://res.cloudinary.com/...'
  });
  
  return response.data.data.user;
}
```

**What happens:**
- Sends PUT request to backend
- Backend validates Cloudinary URL
- Backend saves to database
- Returns updated user object

**Backend endpoint:** `PUT /api/v1/user`

---

### Step 8: Update Global State

**File:** `useAuthStore.ts` (Zustand Store)

```typescript
const useAuthStore = create(
  persist((set) => ({
    user: null,
    token: null,
    
    setAuth: (user, token) => {
      set({ user, token, isAuthenticated: true });
    }
  }))
);
```

**What happens:**
- Store updates with new user data
- Persists to localStorage
- All components using this store re-render
- Header shows new avatar
- Profile page shows new avatar

---

### Step 9: UI Updates

**File:** `UserProfile.tsx` & `Header.tsx`

```typescript
// Both components read from the same store
const { user } = useAuthStore();

// When store updates, components re-render
{user?.avatar_url ? (
  <img src={user.avatar_url} />
) : (
  <div>{user.username[0]}</div>
)}
```

**What happens:**
- Components automatically re-render
- New avatar appears everywhere
- No page refresh needed

---

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  UserProfile.tsx                                             │
│  - User clicks camera icon                                   │
│  - handleAvatarUpload(file)                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  useCloudinaryUpload Hook                                    │
│  - Validates file                                            │
│  - uploadImage(file, 'avatar')                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  media.service.ts                                            │
│  - getUploadSignature('avatar')                              │
│  - POST /api/v1/media/upload                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  axios.ts (HTTP Client)                                      │
│  - Adds JWT token to request                                 │
│  - Sends to backend                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND API                                                 │
│  - Validates JWT token                                       │
│  - Generates signature                                       │
│  - Returns: { signature, timestamp, folder }                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  media.service.ts                                            │
│  - uploadToCloudinary(file, signature, ...)                  │
│  - POST https://api.cloudinary.com/upload                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  CLOUDINARY                                                  │
│  - Validates signature                                       │
│  - Stores image                                              │
│  - Returns: { secure_url: "https://..." }                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  useUpdateProfile Hook                                       │
│  - updateProfile({ avatar_url })                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  user.service.ts                                             │
│  - PUT /api/v1/user                                          │
│  - Body: { avatar_url: "https://..." }                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  axios.ts (HTTP Client)                                      │
│  - Adds JWT token                                            │
│  - Sends to backend                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND API                                                 │
│  - Validates JWT token                                       │
│  - Validates Cloudinary URL                                  │
│  - Saves to database                                         │
│  - Returns: { user: {...} }                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  useAuthStore (Zustand)                                      │
│  - setAuth(updatedUser, token)                               │
│  - Saves to localStorage                                     │
│  - Triggers re-render                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  ALL COMPONENTS RE-RENDER                                    │
│  - UserProfile.tsx shows new avatar                          │
│  - Header.tsx shows new avatar                               │
│  - No page refresh needed!                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Files & Their Roles

### 1. `axios.ts` - HTTP Client
**Role:** Handles ALL API requests to backend

**Features:**
- Adds JWT token to every request
- Shows error toasts automatically
- Handles 401 (logout user)
- Handles network errors

**Used by:** All service files

---

### 2. `*.service.ts` - API Services
**Role:** Define API endpoints and data transformation

**Files:**
- `auth.service.ts` - Login, signup
- `user.service.ts` - Get profile, update profile, delete account
- `media.service.ts` - Get signature, upload to Cloudinary

**Used by:** Hooks

---

### 3. `use*.ts` - Custom Hooks
**Role:** Business logic + state management

**Files:**
- `useUpdateProfile` - Update profile with loading/error states
- `useCloudinaryUpload` - Complete upload flow
- `useUserProfile` - Fetch user profile
- `useDeleteAccount` - Delete account

**Used by:** Components

---

### 4. `useAuthStore.ts` - Global State
**Role:** Store user data globally

**Features:**
- Stores: user, token, isAuthenticated
- Persists to localStorage
- Accessible from any component
- Auto-syncs across tabs

**Used by:** All components that need user data

---

### 5. `UserProfile.tsx` - UI Component
**Role:** Display UI and handle user interactions

**Features:**
- Shows user data from store
- Handles button clicks
- Calls hooks for logic
- Shows loading states

**Uses:** Hooks + Store

---

## 🎯 Data Flow Summary

### Request Flow (Frontend → Backend)
```
Component → Hook → Service → axios → Backend API
```

### Response Flow (Backend → Frontend)
```
Backend API → axios → Service → Hook → Store → Component
```

### Upload Flow (Special Case)
```
Component → Hook → Service → Backend (signature)
                           ↓
                      Cloudinary (upload)
                           ↓
                      Backend (save URL)
                           ↓
                      Store → Component
```

---

## 🛠️ How Each File Communicates

### Example: Update Profile

1. **UserProfile.tsx** calls hook:
   ```typescript
   const { updateProfile } = useUpdateProfile();
   await updateProfile({ bio: 'New bio' });
   ```

2. **useUpdateProfile.ts** calls service:
   ```typescript
   const updatedUser = await userService.updateProfile(data);
   ```

3. **user.service.ts** calls axios:
   ```typescript
   const response = await api.put('/user', data);
   ```

4. **axios.ts** adds token and sends:
   ```typescript
   config.headers.Authorization = `Bearer ${token}`;
   return axios(config);
   ```

5. **Backend** processes and responds

6. **axios.ts** receives response

7. **user.service.ts** returns data

8. **useUpdateProfile.ts** updates store:
   ```typescript
   setAuth(updatedUser, token);
   ```

9. **useAuthStore.ts** triggers re-render

10. **UserProfile.tsx** shows new data

---

## 🔒 Security Flow

### JWT Token Flow
```
1. User logs in
2. Backend returns token
3. Store saves token
4. axios adds token to every request
5. Backend validates token
6. If invalid → axios logs out user
```

### Cloudinary Upload Security
```
1. Frontend requests signature (needs JWT)
2. Backend generates signature (uses SECRET)
3. Frontend uploads with signature
4. Cloudinary validates signature
5. Frontend saves URL (needs JWT)
6. Backend validates URL is from Cloudinary
```

---

## 📝 Summary

### The Pattern
1. **Component** - UI and user interaction
2. **Hook** - Business logic and state
3. **Service** - API calls
4. **Axios** - HTTP client
5. **Store** - Global state

### Why This Structure?
- ✅ **Separation of concerns** - Each file has one job
- ✅ **Reusability** - Hooks can be used in multiple components
- ✅ **Testability** - Easy to test each layer
- ✅ **Maintainability** - Easy to find and fix bugs
- ✅ **Type safety** - TypeScript catches errors

### Key Concepts
- **Hooks** manage state and side effects
- **Services** define API endpoints
- **Axios** handles HTTP communication
- **Store** shares data globally
- **Components** display UI

---

## 🚀 Quick Reference

### To add a new API:

1. **Add to service** (`*.service.ts`)
   ```typescript
   export const userService = {
     newEndpoint: async () => {
       const response = await api.get('/new-endpoint');
       return response.data;
     }
   };
   ```

2. **Create hook** (`use*.ts`)
   ```typescript
   export const useNewFeature = () => {
     const [loading, setLoading] = useState(false);
     
     const doSomething = async () => {
       setLoading(true);
       const data = await userService.newEndpoint();
       setLoading(false);
       return data;
     };
     
     return { doSomething, loading };
   };
   ```

3. **Use in component**
   ```typescript
   const { doSomething, loading } = useNewFeature();
   
   <button onClick={doSomething} disabled={loading}>
     {loading ? 'Loading...' : 'Click Me'}
   </button>
   ```

That's it! 🎉
