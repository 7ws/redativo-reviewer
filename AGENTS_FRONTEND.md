# Frontend Development Guidelines

Next.js application with TypeScript, React Server Components, and App Router.

See [AGENTS-Redativo.md](../AGENTS-Redativo.md) for general project guidelines.

**Configuration:**
- No `.env` files (see [AGENTS-Redativo.md § Local Development](../AGENTS-Redativo.md#local-development))
- Environment variables via `NEXT_PUBLIC_*` for client-side access
- API base URL: `NEXT_PUBLIC_API_URL`

## Structure

### Project Layout

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── home/              # Home page (role-based)
│   ├── login/             # Login page
│   ├── logout/            # Logout page
│   ├── signup/            # Registration page
│   ├── profile/[id]/      # User profile
│   ├── themes/            # Theme listing and details
│   │   └── [theme_id]/
│   │       ├── page.tsx                    # Theme detail
│   │       ├── new-essay/                  # Essay submission
│   │       └── essays/[essay_id]/
│   │           ├── page.tsx                # Essay detail
│   │           └── reviews/[id]/page.tsx   # Review detail
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── essays/            # Essay-specific components
│   ├── reviews/           # Review-specific components
│   ├── themes/            # Theme-specific components
│   ├── home/              # Home page components
│   ├── header.tsx         # Global header
│   └── theme-provider.tsx # Theme context
├── lib/                   # Utilities and services
│   ├── api.ts            # API client functions
│   ├── auth.ts           # Authentication utilities
│   ├── imageCoords.ts    # Image coordinate helpers
│   └── utils.ts          # General utilities
├── hooks/                 # React hooks
│   ├── use-auth.ts       # Authentication state management
│   ├── use-mobile.ts     # Mobile detection
│   └── use-toast.ts      # Toast notifications
├── types/                 # TypeScript type definitions
│   ├── comment.ts
│   ├── competency.ts
│   ├── essay.ts
│   ├── highlight.ts
│   ├── review.ts
│   ├── theme.ts
│   ├── theme_for_reviewer.ts
│   ├── thread.ts
│   └── user_profile.ts
└── public/                # Static assets
```

### Routing

Next.js App Router with file-based routing:

- **Route segments**: Folders define URL segments (`app/themes/` → `/themes`)
- **Pages**: `page.tsx` files define route endpoints
- **Dynamic routes**: `[param]/` folders for dynamic segments
- **Layouts**: `layout.tsx` files for shared UI

Example:
```
app/themes/[theme_id]/essays/[essay_id]/page.tsx
→ /themes/123e4567-e89b-12d3-a456-426614174000/essays/456...
```

## Separation of Concerns

**Pages** (`app/**/page.tsx`): Route endpoints and data orchestration
- Server Components by default (fetch data on server)
- Client Components when interactivity needed (`"use client"`)
- Orchestrate data fetching and service calls
- Handle routing and navigation
- Pass data to presentation components
- NO: Direct DOM manipulation, business logic

**Components** (`components/`): Presentation and user interaction
- Reusable UI elements organized by feature
- Handle user events (clicks, form inputs)
- Call service functions via props or direct imports
- Manage local UI state (form state, toggles, modals)
- NO: Direct API calls (use services), business logic

**Services** (`lib/`): API communication and business logic
- API client functions (`api.ts`)
- Authentication logic (`auth.ts`)
- Data transformation and validation
- Error handling and retry logic
- Token refresh and credential management
- Services are the single source of truth for API interactions

**Hooks** (`hooks/`): Shared stateful logic
- Reusable React hooks for common patterns
- Example: `use-mobile.ts` for responsive behavior, `use-toast.ts` for notifications
- Encapsulate complex state management
- NO: Direct API calls (call services instead)

**Types** (`types/`): TypeScript definitions
- Domain model interfaces matching backend API
- Shared across pages, components, and services
- Single source of truth for data shapes

**Example Flow** (Submit Essay):
1. Component renders form, handles input changes (local state)
2. User clicks submit
3. Component calls service: `sendEssay(themeId, router, formData)`
4. Service (`lib/api.ts`) makes authenticated POST request
5. Service handles token refresh if 401
6. Service returns response to component
7. Component updates UI (show success, navigate to essay detail)

## API Integration

**Authentication**: JWT tokens stored in `localStorage`
- `access`: Short-lived access token
- `refresh`: Long-lived refresh token

**Token Management**:
- All authenticated requests use `Authorization: Bearer <access>` header
- Automatic token refresh on 401 responses
- Redirect to `/login` if refresh fails

**Authentication Hook** (`hooks/use-auth.ts`):
- `useAuth()`: Returns user, loading, and isAuthenticated states
- `useAuth({ requireAuth: true })`: Automatically redirects to login if unauthenticated
- Centralizes authentication logic across pages
- Eliminates code duplication for auth checks

**API Client Functions** (`lib/api.ts`):
- `apiGetWithAuth(url, router)`: Authenticated GET
- `apiGetWithoutAuth(url, router)`: Public GET
- `apiPostWithAuth(url, router, body)`: Authenticated POST
- `apiPatchWithAuth(url, router, body)`: Authenticated PATCH
- `apiDeleteWithAuth(url, router)`: Authenticated DELETE
- All functions handle token refresh automatically

**Error Handling**:
- Check `response.ok` before parsing JSON
- Handle network errors with try/catch
- Display user-friendly error messages via toast notifications
- Log errors to console for debugging

**Example**:
```typescript
async function fetchUser() {
  try {
    const res = await apiGetWithAuth('/api/v1/users/my-user/', router);
    if (!res?.ok) {
      console.error('Failed to fetch user');
      return;
    }
    const data = await res.json();
    setUser(data);
  } catch (err) {
    console.error('Error fetching user:', err);
  }
}
```

## State Management

**Local Component State**: `useState` for component-specific state
- Form inputs, UI toggles, loading states
- Not shared between components

**Session Storage**: Persist user preferences across page reloads
- Example: Active tab selection, theme filters
- Use `sessionStorage.getItem/setItem`

**Local Storage**: Persist authentication and long-term preferences
- JWT tokens (`access`, `refresh`)
- User preferences that survive browser restart

**URL State**: Route parameters and search params for shareable state
- Dynamic route segments: `[theme_id]`, `[essay_id]`
- Query parameters: Not currently used (future pagination, filtering)

**No Global State Management**: No Redux, Zustand, or Context for app state
- Data fetched per-page/component as needed
- Authentication state centralized via `useAuth` hook

**Authentication State**: Centralized via `useAuth` hook
- Custom hook (`hooks/use-auth.ts`) manages authentication state
- Automatically fetches user data when authenticated
- Supports `requireAuth` option for protected routes
- Single source of truth for authentication across pages

## User Interface

**All user-facing text in Portuguese (Brazil)**

**Inclusive Language**:
- Avoid gender-specific nouns when possible
- Use gender-neutral alternatives unless gender is known
- Prefer second person ("você") over third person labels

**Action-Oriented CTAs**:
- Frame from user perspective, not system perspective
- Conversational tone
- Examples:
  - Good: "Enviar redação" (direct, user action)
  - Bad: "Salvar" (generic, system-focused)
  - Good: "Ver minha redação" (user-centric)
  - Bad: "Acessar" (system-centric)

**Component Library**: shadcn/ui with Radix UI primitives
- Location: `components/ui/`
- Theming: Tailwind CSS + CSS variables
- Dark mode support via `next-themes`

**Responsive Design**:
- Mobile-first approach
- Use `use-mobile.ts` hook for conditional rendering
- Tailwind responsive utilities (`sm:`, `md:`, `lg:`)

## Styling

**Tailwind CSS**: Utility-first styling
- Primary approach for all components
- Custom utilities in `globals.css` if needed

**CSS Variables**: Theme tokens defined in `globals.css`
- Colors, spacing, typography
- Support light/dark mode

**Class Management**: `cn()` utility from `lib/utils.ts`
- Merge Tailwind classes with conditional logic
- Example: `cn("base-class", condition && "conditional-class")`

**shadcn/ui**: Pre-built accessible components
- Managed via `components.json`
- Customizable via Tailwind

## Testing

### Widget Tests

See [AGENTS-Redativo.md § Widget Tests](../AGENTS-Redativo.md#widget-tests-flutter) for naming conventions (adapt for React Testing Library).

**Location**: TBD (not yet implemented)

**Coverage requirements**:
- User interactions (form submissions, button clicks)
- Navigation flows (login → home, theme → essay detail)
- Error states (validation errors, API failures)
- Role-based rendering (writer vs reviewer views)
- Authentication flows (login, logout, token refresh)

**Testing Library**: React Testing Library (recommended)
- Test user behavior, not implementation details
- Query by accessible labels, roles, text
- Avoid testing internal state

## Security

- Never store sensitive data in localStorage beyond JWT tokens
- Validate user input in forms before sending to API
- Rely on backend for authorization (frontend checks are UX only)
- Use HTTPS in production (enforce via Next.js config)
- Sanitize user-generated content when rendering (React handles by default)
- No inline scripts or `dangerouslySetInnerHTML` without sanitization

## Performance

**Server Components**: Default for pages and non-interactive components
- Fetch data on server, reduce client bundle size
- Use Client Components (`"use client"`) only when needed

**Code Splitting**: Automatic via Next.js App Router
- Each route is a separate bundle
- Dynamic imports for heavy components

**Image Optimization**: Use Next.js `<Image>` component
- Automatic lazy loading, responsive images, format optimization

**API Calls**:
- Minimize redundant requests (cache in component state when appropriate)
- Use loading states to prevent multiple simultaneous requests
- Consider request deduplication for shared data

## Development Workflow

**Local Development**:
```bash
npm run dev  # Start development server on http://localhost:3000
```

**Build and Production**:
```bash
npm run build  # Create production build
npm run start  # Start production server
```

**Linting**:
```bash
npm run lint  # Run ESLint
```

**Environment Variables**:
- Development: `.env.local` (gitignored)
- Production: Set via deployment platform
- Required: `NEXT_PUBLIC_API_URL`
