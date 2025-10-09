# Frontend Structure

This Next.js 14 application follows a modern structure with the `src/` directory pattern and route groups for organization.

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public route group (no auth required)
│   │   ├── login/               # Login page
│   │   └── layout.tsx           # Public layout
│   ├── (protected)/             # Protected route group (auth required)
│   │   ├── dashboard/           # Dashboard page
│   │   ├── projects/            # Projects page
│   │   ├── tasks/               # Tasks page
│   │   └── layout.tsx           # Protected layout with AppShell
│   ├── api/                     # API routes (BFF pattern)
│   │   └── auth/                # Authentication endpoints
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Root page (redirects to /login)
├── components/                   # React components
│   ├── app-shell/               # App shell components
│   │   ├── app-shell.tsx        # Main app shell wrapper
│   │   ├── sidebar.tsx          # Navigation sidebar
│   │   ├── topbar.tsx           # Top navigation bar
│   │   └── tenant-switcher.tsx  # Tenant selection dropdown
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx           # Button component
│   │   ├── input.tsx            # Input component
│   │   └── label.tsx            # Label component
│   └── index.ts                 # Component exports
├── lib/                         # Utility functions
│   └── utils.ts                 # Common utilities (cn helper)
├── providers/                   # React context providers
│   ├── query-provider.tsx       # React Query provider
│   ├── urql-provider.tsx        # URQL GraphQL provider
│   └── index.ts                 # Provider exports
├── styles/                      # Stylesheets
│   └── globals.css              # Global styles with Tailwind
└── middleware.ts                # Next.js middleware for auth
```

## Key Features

### Route Groups
- `(public)`: Routes accessible without authentication
- `(protected)`: Routes that require authentication

### Authentication
- JWT-based authentication with httpOnly cookies
- Route protection via middleware
- Mock authentication endpoints for development

### State Management
- **React Query**: Server state management
- **URQL**: GraphQL client with caching

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality component library
- **CSS Variables**: Design system with CSS custom properties

### App Shell Pattern
- Consistent layout for protected routes
- Sidebar navigation
- Top bar with tenant switcher
- Responsive design

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Navigate to `http://localhost:3000`
   - Automatically redirects to `/login`
   - Use any email/password to login (mock auth)
   - Redirects to `/dashboard` after login

## Development Notes

- All paths use `@/` alias pointing to `src/`
- Components are organized by type and purpose
- API routes follow BFF (Backend for Frontend) pattern
- Authentication state managed via HTTP cookies
- TypeScript strict mode enabled
- ESLint and Prettier configured

## TODO

- [ ] Connect to real backend authentication
- [ ] Add real data fetching with React Query
- [ ] Implement GraphQL queries with URQL
- [ ] Add error boundaries
- [ ] Add loading states
- [ ] Add form validation
- [ ] Add tests