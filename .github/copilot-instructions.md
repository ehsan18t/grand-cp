# GitHub Copilot Instructions

## 🔧 General Rules

- **Plan first**: Do deep research, then make plans before coding
- **Todo list**: Maintain and follow strictly. Complete all todos.
- **Icons**: Use `lucide-react`. Never inline SVG.
- **Validation**: Always run `bun lint; bun format; bun typecheck` after changes
- **Commit**: After each task is done
- **Dev server**: Assume it's running. Use `next-devtools` MCP for logs.
- **Type safety**: Always write type-safe TypeScript
- **Design**: Don't just copy shadcn. Make it unique.

---

## 🎯 Core Principles

1. **Performance** - Lightweight, tree-shakeable components
2. **Accessibility** - WCAG guidelines, proper ARIA attributes
3. **Themeable** - CSS variables from `globals.css`, never hardcode colors
4. **Animated** - GSAP for animations, respect `prefers-reduced-motion`
5. **Type-Safe** - Full TypeScript with proper types

---

## 🎨 Theming

Colors in `globals.css` using `oklch()`. Use Tailwind classes:

```tsx
// ✅ Correct
className="bg-primary text-primary-foreground"

// ❌ Wrong
className="bg-blue-500 text-white"
```

Key tokens: `primary`, `secondary`, `muted`, `accent`, `destructive`, `success`, `warning`, `info`, `background`, `foreground`, `card`, `popover`, `border`, `ring`

Status colors: `status-solved`, `status-attempting`, `status-revisit`, `status-skipped`, `status-untouched`

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `tailwind-variants` | Variant-based styling |
| `tailwind-merge` | Merge Tailwind classes |
| `clsx` | Conditional classNames |
| `gsap` / `@gsap/react` | Animations |
| `lucide-react` | Icons |
| `better-auth` | Authentication |
| `drizzle-orm` | Database ORM |

---

## 🏗️ Architecture (Mandatory)

```
Pages/Components → Services → Repositories → Database
```

### Rules

**Pages/Components** (`src/app/`, `src/components/`):
- ❌ No database queries, no `@/db/schema` imports
- ✅ Use `getRequestContext()` or `getServicesOnly()`
- ✅ Call service methods for data

**API Routes** (`src/app/api/`):
- ✅ Use `getApiContext()` from `@/lib/request-context`

**Services** (`src/services/`):
- ❌ No raw database queries
- ✅ Business logic, use repositories

**Repositories** (`src/repositories/`):
- ✅ Pure database queries with Drizzle ORM

### Request Context

```tsx
// Server Components:
const { services, userId } = await getRequestContext();
const services = await getServicesOnly(); // No auth

// API Routes:
const { auth, services } = await getApiContext();
const session = await auth.api.getSession({ headers: request.headers });
```

---

## ✅ Component Checklist

- [ ] `"use client"` if interactive
- [ ] `forwardRef` for DOM access
- [ ] `tailwind-variants` for variants
- [ ] Export TypeScript interface
- [ ] Use `cn()` for className merging
- [ ] Theme colors only
- [ ] `displayName` set
- [ ] Respects `prefers-reduced-motion`
- [ ] Proper ARIA attributes
- [ ] Exported from `index.ts`

---

## 🔄 Common Patterns

### Adding a Feature

1. Add type in `src/types/domain.ts`
2. Add repository in `src/repositories/`
3. Add service in `src/services/`
4. Register in `src/lib/service-factory.ts`
5. Use via `getRequestContext()` in pages

### Client State

- Zustand stores in `src/stores/`
- `persist` middleware with `sessionStorage`
- Selector hooks for performance

---

## 🚫 Anti-Patterns

```tsx
// ❌ Direct context creation
const { env } = await getCloudflareContext({ async: true });

// ❌ Database query in page
const data = await db.select().from(users);

// ❌ Hardcoded colors
className="bg-blue-500"

// ✅ Use request context
const { services } = await getRequestContext();
```

---

## 📝 Code Style

- TypeScript strict mode
- Biome for formatting
- Named exports preferred
- Arrow functions with `forwardRef`
- Group imports: React → external → internal → types

---

*Last updated: January 2025*
