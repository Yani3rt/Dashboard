# Agent Guidelines for Dashboard

This document provides guidance for agents working on this codebase.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Styling:** Tailwind CSS 4, class-variance-authority, tailwind-merge, clsx
- **UI Components:** Radix UI (Dialog, Dropdown Menu, Select, Tooltip)
- **Icons:** Lucide React
- **Language:** TypeScript (strict mode)
- **Testing:** Vitest, Testing Library, jsdom
- **State Management:** React Context + useReducer

## Commands

### Development
```bash
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Testing
```bash
npm test             # Run all tests once
npm run test:watch  # Run tests in watch mode
```

To run a **single test file**, use:
```bash
npx vitest run test/habits.test.ts
```

To run a **single test** by name:
```bash
npx vitest run -t "returns current and best streak"
```

## Project Structure

```
/app                 # Next.js App Router pages
  /tasks            # Tasks page
  /habits           # Habits page
  /notes            # Notes page
  /settings         # Settings page
/components          # React components
  /ui               # Reusable UI primitives (button, card, input, etc.)
/lib                 # Business logic
  /domain           # Domain models and logic (models.ts, habits.ts, date.ts)
  /data             # Data layer (local-provider.ts, repositories.ts)
  /state            # State management (dashboard-context.tsx)
/test                # Test files
```

## Code Style Guidelines

### Imports

- Use the `@/` path alias for absolute imports from project root
- Order imports: React → external libs → internal modules → utilities
- Use `type` keyword for type-only imports when appropriate
- Example:
```typescript
import * as React from "react";
import { useCallback, useMemo, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AppState, type Task } from "@/lib/domain/models";
```

### Naming Conventions

- **Files:** kebab-case for components (`kanban-board.tsx`), camelCase for utilities (`id.ts`)
- **Components:** PascalCase (`Button`, `TaskList`)
- **Hooks:** camelCase with `use` prefix (`useDashboard`, `useCallback`)
- **Types/Interfaces:** PascalCase, use `TaskPriority`, `TaskStatus` for unions
- **Constants:** SCREAMING_SNAKE_CASE for config values

### TypeScript

- Enable strict mode in tsconfig
- Always type function parameters and return values
- Use explicit types over `any`
- Prefer interfaces over types for object shapes
- Use utility types (`Partial`, `Pick`, `Omit`) when appropriate

### React Patterns

- Use `"use client"` directive for client-side components
- Use `React.forwardRef` for components that need ref forwarding
- Always set `displayName` on forwarded refs
- Wrap callbacks with `useCallback` when passed as props
- Use `useMemo` for expensive computations
- Prefer composition over inheritance
- Extract reusable logic into custom hooks

### State Management

- Use React Context + useReducer for global state (see `dashboard-context.tsx`)
- Define action types as a union type
- Use immer or immutable update patterns for nested state
- Always include default case in reducers

### Error Handling

- Use early returns for validation
- Return result objects with `{ ok: boolean; error?: string }` for operations that can fail
- Throw descriptive errors in utility functions
- Use try/catch for async operations with user feedback

### Component Patterns

Follow the pattern used in `/components/ui/`:

1. Use `cva` (class-variance-authority) for variant props
2. Create `ComponentProps` interface extending native HTML attributes
3. Use `cn()` utility for conditional class merging
4. Forward refs with proper typing
5. Export both component and variants

Example:
```typescript
const buttonVariants = cva("base classes", {
  variants: {
    variant: { default: "...", secondary: "..." },
    size: { default: "...", sm: "..." },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### Styling with Tailwind

- Use Tailwind's CSS variables for theming (defined in tailwind.config.ts)
- Use `cn()` utility to merge conditional classes
- Follow mobile-first approach
- Use semantic color names (`primary`, `secondary`, `accent`, `muted`)
- Dark mode is controlled via `[data-theme="dark"]` class

### Testing

- Test files go in `/test/` directory
- Use `.test.ts` for pure function tests, `.test.tsx` for component tests
- Use `describe` blocks to group related tests
- Use `it` or `test` for individual test cases
- Mock timers with `vi.useFakeTimers()` when testing time-dependent logic
- Use Testing Library for component tests
- Follow AAA pattern: Arrange, Act, Assert

### File Organization

1. Imports
2. Types/Interfaces
3. Constants/Config
4. Utility functions
5. Component definitions
6. Exports

### Miscellaneous

- No comments unless explaining complex business logic
- Use meaningful variable names
- Keep functions small and focused
- Prefer early returns to reduce nesting
- Use nullish coalescing (`??`) and optional chaining (`?.`) appropriately
