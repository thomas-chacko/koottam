# Koottam Social Media Frontend - Technical Documentation

## Project Overview
A modern, performant, and accessible social media frontend built with Next.js 16, React 19, TypeScript, and Tailwind CSS. Features smooth animations, optimized performance, type-safe development, and production-ready error handling.

**Live Demo:** [https://koottam.vercel.app](https://koottam.vercel.app)

## Tech Stack
- **Framework:** Next.js 16.2 (App Router)
- **UI Library:** React 19.2
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **HTTP Client:** Axios (planned)
- **State Management:** Zustand (planned)
- **Animations:** Framer Motion (planned)
- **Smooth Scroll:** Lenis (planned)
- **Icons:** Lucide React (planned)

---

## Design Rules & Guidelines

### CRITICAL DESIGN RULES
1. **NO GRADIENTS** - Never use CSS gradients (linear-gradient, radial-gradient, etc.) anywhere in the application
2. **Cursor Pointer** - Always add `cursor-pointer` class to all interactive elements (buttons, links, clickable items)
3. **Viewport Height** - All full-page layouts must use `h-screen` and `overflow-hidden` to fit within viewport on all devices
4. **Flat Colors Only** - Use solid colors from the design system, no gradient backgrounds or hover effects
5. **Primary Color** - #8B5CF6 (stored as CSS variable `--primary`)
6. **Layout Symmetry** - The central feed columns (Header Search, Explore, Profile, Home) must adhere to identical edge-to-edge constraints (e.g., `max-w-[650px]`) WITHOUT mismatched inner horizontal paddings (`sm:px-4`) to guarantee perfect vertical alignment between navigation elements and feed content.
7. **Live Updates** - All data updates (profile edits, image uploads, etc.) MUST be reflected immediately in the UI without requiring page refresh. Always refetch data after mutations and sync with global state.

### Color System
- **Primary:** #8B5CF6 (purple)
- **Background:** #0a0a0f (dark)
- **Secondary:** #1a1a2e (dark gray)
- **Border:** #2a2a3e (gray)
- **Text:** #ffffff (white), #ededed (light gray), #9ca3af (gray)

---

## Planned Project Structure

```
client/
├── app/
│   ├── (auth)/                 # Auth routes group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/            # Protected routes group
│   │   ├── feed/
│   │   ├── profile/
│   │   └── settings/
│   ├── api/                    # API routes (if needed)
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles & Tailwind
│   ├── error.tsx               # Global error boundary
│   ├── loading.tsx             # Global loading state
│   └── not-found.tsx           # 404 page
├── components/
│   ├── ui/                     # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── layout/                 # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── features/               # Feature-specific components
│   │   ├── Post/
│   │   ├── Comment/
│   │   └── Profile/
│   └── shared/                 # Shared components
│       ├── ErrorBoundary.tsx
│       ├── LoadingSpinner.tsx
│       └── Toast.tsx
├── lib/
│   ├── axios.ts                # Axios instance with interceptors
│   ├── utils.ts                # Utility functions
│   └── constants.ts            # App constants
├── store/
│   ├── authStore.ts            # Zustand auth state
│   ├── userStore.ts            # Zustand user state
│   └── uiStore.ts              # Zustand UI state (modals, toasts)
├── hooks/
│   ├── useAuth.ts              # Authentication hook
│   ├── useApi.ts               # API call hook with error handling
│   ├── useToast.ts             # Toast notification hook
│   └── useDebounce.ts          # Debounce hook
├── types/
│   ├── api.ts                  # API response types
│   ├── user.ts                 # User types
│   └── post.ts                 # Post types
├── public/                     # Static assets
│   ├── images/
│   └── icons/
├── .env.local                  # Environment variables
├── .env.example                # Environment template
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies & scripts
```

---

## Core Skills Demonstrated

### 1. Modern React Development
- **React 19** - Latest features, concurrent rendering, server components
- **Next.js 16 App Router** - File-based routing, layouts, loading states
- **TypeScript** - Type-safe development, interfaces, generics
- **Server Components** - Performance optimization, reduced bundle size
- **Client Components** - Interactive UI with 'use client' directive

### 2. State Management
- **Zustand** - Lightweight, simple, no boilerplate
- **Persistent State** - LocalStorage integration for auth
- **Global State** - User, auth, UI state management
- **Optimistic Updates** - Instant UI feedback before API response
- **State Selectors** - Performance optimization with selective re-renders

### 3. Styling & Design
- **Tailwind CSS 4** - Utility-first, responsive design
- **Custom Components** - Reusable UI component library
- **Dark Mode** - Theme switching with system preference detection
- **Responsive Design** - Mobile-first approach
- **CSS-in-JS** - Styled components when needed
- **Design System** - Consistent spacing, colors, typography

### 4. Animations & UX
- **Framer Motion** - Smooth page transitions, micro-interactions
- **Lenis** - Buttery smooth scroll experience
- **Loading States** - Skeleton screens, spinners, progress indicators
- **Optimistic UI** - Instant feedback for better UX
- **Gesture Animations** - Drag, swipe, hover effects
- **Page Transitions** - Smooth navigation between routes

### 5. API Integration
- **Axios** - HTTP client with interceptors
- **Request Interceptors** - Auto-attach JWT tokens
- **Response Interceptors** - Global error handling, token refresh
- **Error Handling** - Centralized error management
- **Loading States** - Request pending/success/error states
- **Retry Logic** - Auto-retry failed requests
- **Request Cancellation** - Cancel pending requests on unmount

### 6. Error Handling
- **Global Error Boundary** - Catch React errors gracefully
- **API Error Handler** - Centralized API error management
- **Toast Notifications** - User-friendly error messages
- **Error Logging** - Track errors for debugging
- **Fallback UI** - Show meaningful error states
- **404 Handling** - Custom not-found pages
- **Network Error Detection** - Offline mode handling

### 7. Performance Optimization
- **Code Splitting** - Dynamic imports, lazy loading
- **Image Optimization** - Next.js Image component
- **Bundle Analysis** - Monitor and reduce bundle size
- **Memoization** - useMemo, useCallback for expensive operations
- **Virtual Scrolling** - Efficient rendering of large lists
- **Debouncing** - Optimize search and input handlers
- **Prefetching** - Preload data for faster navigation

### 8. TypeScript Best Practices
- **Strict Mode** - Maximum type safety
- **Interface Definitions** - Clear API contracts
- **Generic Types** - Reusable type-safe components
- **Type Guards** - Runtime type checking
- **Utility Types** - Pick, Omit, Partial for flexibility
- **Enum Types** - Type-safe constants
- **Type Inference** - Let TypeScript infer when possible

### 9. Authentication & Security
- **JWT Tokens** - Secure authentication
- **Token Storage** - Secure storage in httpOnly cookies or localStorage
- **Token Refresh** - Auto-refresh expired tokens
- **Protected Routes** - Route guards for authenticated pages
- **CORS Handling** - Proper cross-origin configuration
- **XSS Prevention** - Sanitize user input
- **CSRF Protection** - Token-based protection

### 10. Developer Experience
- **Hot Reload** - Fast development with Next.js
- **ESLint** - Code quality and consistency
- **TypeScript** - Catch errors at compile time
- **Environment Variables** - Secure config management
- **Git Workflow** - Version control best practices
- **Component Documentation** - Clear prop types and usage

### 11. SEO Optimization
- **Server-Side Rendering (SSR)** - Pre-rendered HTML for search engines
- **Static Site Generation (SSG)** - Build-time page generation
- **Metadata API** - Dynamic meta tags, Open Graph, Twitter Cards
- **Sitemap Generation** - Auto-generated XML sitemap
- **Robots.txt** - Search engine crawling configuration
- **Structured Data** - JSON-LD schema markup for rich snippets
- **Semantic HTML** - Proper heading hierarchy, semantic tags
- **Image Alt Text** - Descriptive alt attributes for accessibility & SEO
- **URL Structure** - Clean, descriptive URLs
- **Canonical URLs** - Prevent duplicate content issues
- **Page Speed** - Core Web Vitals optimization (LCP, FID, CLS)

### 12. Security Best Practices
- **Content Security Policy (CSP)** - Prevent XSS attacks
- **HTTP Security Headers** - X-Frame-Options, X-Content-Type-Options
- **Input Sanitization** - Prevent XSS and injection attacks
- **HTTPS Only** - Secure connections in production
- **Environment Variables** - Never expose secrets in client code
- **CSRF Protection** - Token-based protection for forms
- **Rate Limiting** - Prevent abuse and brute force attacks
- **Secure Cookies** - HttpOnly, Secure, SameSite flags
- **Dependency Scanning** - Regular security audits with npm audit
- **Authentication Guards** - Protected routes and API calls

### 13. Code Optimization
- **Tree Shaking** - Remove unused code from bundles
- **Code Splitting** - Dynamic imports for route-based splitting
- **Bundle Analysis** - Monitor and optimize bundle size
- **Minification** - Compress JavaScript and CSS
- **Dead Code Elimination** - Remove unused exports
- **Lazy Loading** - Load components only when needed
- **Memoization** - React.memo, useMemo, useCallback
- **Virtual DOM Optimization** - Key props, avoid unnecessary re-renders
- **Web Workers** - Offload heavy computations
- **Service Workers** - Offline support and caching

### 14. Image Optimization
- **Next.js Image Component** - Automatic optimization and lazy loading
- **WebP Format** - Modern image format with better compression
- **Responsive Images** - Serve appropriate sizes for different devices
- **Lazy Loading** - Load images only when in viewport
- **Blur Placeholder** - Show blur-up effect while loading
- **CDN Integration** - Cloudinary for optimized delivery
- **Image Compression** - Reduce file sizes without quality loss
- **Srcset & Sizes** - Responsive image attributes
- **Priority Loading** - Preload above-the-fold images
- **Alt Text** - Descriptive text for accessibility and SEO

### 15. Reusability & Maintainability
- **Component Library** - Reusable UI components (Button, Input, Card)
- **Custom Hooks** - Shared logic across components
- **Utility Functions** - Helper functions in lib/utils.ts
- **Design Tokens** - Consistent colors, spacing, typography
- **Composition Pattern** - Build complex UIs from simple components
- **Props Interface** - Clear, typed component APIs
- **Storybook Ready** - Component documentation and testing
- **DRY Principle** - Don't Repeat Yourself
- **Single Responsibility** - Each component does one thing well
- **Feature-based Structure** - Organized by feature, not file type

---

## Key Features

### SEO Excellence
- Server-side rendering for instant indexing
- Dynamic meta tags for every page
- Open Graph and Twitter Card support
- Automatic sitemap generation
- Structured data (JSON-LD) for rich snippets
- Optimized Core Web Vitals
- Semantic HTML structure
- Clean, descriptive URLs

### Security
- Content Security Policy headers
- Input sanitization and validation
- HTTPS enforcement
- Secure authentication flow
- Protected routes and API calls
- CSRF protection
- Regular dependency audits

### Performance
- Server-side rendering for fast initial load
- Code splitting for smaller bundles
- Image optimization with Next.js Image
- Lazy loading for below-fold content
- Debounced search and inputs
- Memoized expensive computations
- Tree shaking and dead code elimination
- CDN integration for static assets

### User Experience
- Smooth page transitions with Framer Motion
- Buttery scroll with Lenis
- Instant feedback with optimistic updates
- Toast notifications for user actions
- Loading states for all async operations
- Error boundaries for graceful failures
- Responsive design for all devices
- Accessibility compliant (WCAG 2.1)

### Code Quality
- Full TypeScript coverage
- Reusable component library
- Custom hooks for shared logic
- Feature-based architecture
- DRY principles
- Single responsibility components
- Comprehensive error handling

---

## Planned Dependencies

```json
{
  "dependencies": {
    "next": "16.2.3",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "axios": "^1.7.0",
    "zustand": "^5.0.0",
    "framer-motion": "^12.0.0",
    "lenis": "^1.1.0",
    "lucide-react": "^0.460.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.3",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

---

## Implementation Highlights

### SEO Implementation
```typescript
// app/(auth)/signup/page.tsx - Page-level metadata
export const metadata: Metadata = {
  title: 'Sign Up - Koottam | Join Our Community',
  description: 'Create your Koottam account and join the premium social space designed for deep community engagement and meaningful interactions.',
  keywords: ['sign up', 'register', 'create account', 'join koottam', 'social media', 'community'],
  openGraph: {
    title: 'Sign Up - Koottam',
    description: 'Join the premium social space designed for deep community engagement.',
    type: 'website',
    url: 'https://koottam.vercel.app/signup',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign Up - Koottam',
    description: 'Join the premium social space designed for deep community engagement.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Semantic HTML structure
<aside aria-label="Hero section">
  <header>
    <h1>Connect with</h1>
  </header>
  <section>
    <figure>
      <Image
        src="/images/signup-hero.jpg"
        alt="Diverse group of community members collaborating and engaging in meaningful conversations"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
      />
      <figcaption>Join 12k+ community members</figcaption>
    </figure>
  </section>
</aside>
<main>
  <SignupForm />
</main>
```

### Security Implementation
```typescript
// next.config.ts - Security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
  }
]

// Input sanitization
import DOMPurify from 'isomorphic-dompurify'
const sanitizedContent = DOMPurify.sanitize(userInput)
```

### Image Optimization
```typescript
// components/OptimizedImage.tsx
import Image from 'next/image'

<Image
  src="/profile.jpg"
  alt="User profile picture"
  width={400}
  height={400}
  quality={85}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  loading="lazy"
  sizes="(max-width: 768px) 100vw, 400px"
/>

// Cloudinary integration
const cloudinaryLoader = ({ src, width, quality }) => {
  return `https://res.cloudinary.com/demo/image/upload/w_${width},q_${quality || 75}/${src}`
}
```

### Code Optimization
```typescript
// Dynamic imports for code splitting
const DynamicComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // Client-side only if needed
})

// Memoization
const MemoizedComponent = React.memo(ExpensiveComponent)

const memoizedValue = useMemo(() => {
  return computeExpensiveValue(a, b)
}, [a, b])

const memoizedCallback = useCallback(() => {
  doSomething(a, b)
}, [a, b])

// Virtual scrolling for large lists
import { FixedSizeList } from 'react-window'
```

### Reusable Components
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  children,
  onClick,
}) => {
  // Reusable, typed, flexible button component
}

// Usage
<Button variant="primary" size="lg" loading={isLoading}>
  Submit
</Button>
```

### Live Updates Pattern
```typescript
// hooks/useUserProfile.ts - Expose refetch function
export const useUserProfile = (username: string) => {
  const fetchProfile = async () => {
    // Fetch logic
  };
  
  return { profile, loading, error, refetch: fetchProfile };
};

// Component usage - Refetch after mutations
const { profile, refetch } = useUserProfile(username);
const { updateProfile } = useUpdateProfile();

const handleUpdate = async (data) => {
  await updateProfile(data); // Updates auth store
  await refetch(); // Refetch to sync UI
};

// Modal pattern - Trigger parent refetch on success
<EditProfileModal
  onSuccess={refetch} // Parent passes refetch callback
  onClose={() => setIsOpen(false)}
/>
```

### Global Error Handler
```typescript
// components/shared/ErrorBoundary.tsx
- Catches React component errors
- Shows fallback UI
- Logs errors for debugging
- Reset error state functionality
```

### Loading States
```typescript
// app/loading.tsx - Route-level loading
// components/shared/LoadingSpinner.tsx - Component-level
// Skeleton screens for content loading
```

### Axios Configuration
```typescript
// lib/axios.ts
- Base URL configuration
- Request interceptors (auth tokens)
- Response interceptors (error handling)
- Token refresh logic
- Request cancellation
```

### Zustand Store
```typescript
// store/authStore.ts
- Login/logout actions
- Token management
- User state
- Persistent storage
```

### Custom Hooks
```typescript
// hooks/useApi.ts - API calls with loading/error states
// hooks/useAuth.ts - Authentication logic
// hooks/useToast.ts - Toast notifications
// hooks/useDebounce.ts - Input debouncing
```

---

## Technical Highlights

- **Modern Stack** - Next.js 16, React 19, TypeScript 5
- **SEO Optimized** - SSR, dynamic metadata, structured data, Core Web Vitals
- **Security First** - CSP headers, input sanitization, HTTPS, secure auth
- **Performance** - Code splitting, image optimization, lazy loading, memoization
- **Type Safety** - Full TypeScript coverage with strict mode
- **Reusability** - Component library, custom hooks, utility functions
- **UX Excellence** - Smooth animations, loading states, error handling
- **State Management** - Zustand for simple, performant state
- **Developer Experience** - Hot reload, ESLint, TypeScript
- **Production Ready** - Error boundaries, logging, monitoring
- **Scalable Architecture** - Feature-based folder structure
- **Accessibility** - Semantic HTML, ARIA labels, keyboard navigation
- **Responsive Design** - Mobile-first, works on all devices
- **Code Quality** - DRY principles, single responsibility, clean code