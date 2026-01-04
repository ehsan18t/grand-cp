# GitHub Copilot Instructions for Custom Components

This project is a custom component collection for Next.js using TailwindCSS v4, GSAP, and TypeScript. Follow these patterns and conventions to maintain consistency.

- Never use inline SVG, use icons from `lucide-react`. If you can't find the required icon use `react-icons` as a last resort.
- Always run `bun lint; bun format; bun typecheck` after making changes and fix issues if any.
- Ensure all components are tree-shakeable and optimized for performance.
- Always use `bun` for package management and scripts.
- Always commit after as task is done.
- Always communicate with nextjs dev tool mcp server for continuous checks if anything is wrong.
- NEVER get to the conclusion that its external issue and not your code. Always double check your code first.
- Always complete all todo you have. don't stop and ask for confirmation.
- Never run the dev server. Just assume its already running. if you need terminal output or any logs just use `next-devtools` mcp server to get them.
- Always write type safe typescript code.
- DON'T JUST MAKE ANOTHER SHADCN DESIGN. IF I WANTED THAT I WOULD JUST USE SHADCN. MAKE IT DIFFERENT AND UNIQUE.


---

## 🎯 Core Principles

1. **Performance First** - Components should be lightweight and tree-shakeable
2. **Accessibility** - Follow WCAG guidelines, use proper ARIA attributes
3. **Themeable** - Use CSS variables from `globals.css`, never hardcode colors
4. **Animated** - Use GSAP for animations, respect `prefers-reduced-motion`
5. **Type-Safe** - Full TypeScript with proper prop types and exports

---

## 🧯 Avoid Deprecated APIs (Required)

- Treat any new deprecation warnings as blockers. If you introduce a deprecated API/import, replace it with the recommended alternative (don’t silence it).
- Always run `bun lint; bun format; bun typecheck` before finishing a task.
- Prefer stable APIs over “nursery/experimental” patterns unless the repo already uses them.

### Drizzle ORM

- Do **not** use deprecated composite-PK helpers/signatures.
- Prefer a simple `id` primary key plus a `uniqueIndex(...).on(a, b)` for composite uniqueness unless a true composite primary key is strictly required.

### Next.js

- Prefer `next/image` (`Image`) over raw `<img>`.
- Prefer `Number.parseInt(value, 10)` when parsing route params.


---

## 🎨 Theming System

### CSS Variables
All colors are defined in `globals.css` using CSS variables with `oklch()` color space:

```css
/* Light theme */
:root {
  --primary: oklch(...);
  --background: oklch(...);
  --foreground: oklch(...);
  /* ... */
}

/* Dark theme */
[data-theme="dark"] {
  --primary: oklch(...);
  /* ... */
}
```

### Available Color Tokens
| Token | Usage |
|-------|-------|
| `primary` / `primary-foreground` | Primary actions, buttons |
| `secondary` / `secondary-foreground` | Secondary elements |
| `muted` / `muted-foreground` | Muted backgrounds, disabled text |
| `accent` / `accent-foreground` | Accent highlights |
| `destructive` / `destructive-foreground` | Errors, delete actions |
| `success` / `success-foreground` | Success states |
| `warning` / `warning-foreground` | Warning states |
| `info` / `info-foreground` | Info states |
| `background` / `foreground` | Page background, main text |
| `card` / `card-foreground` | Card backgrounds |
| `popover` / `popover-foreground` | Popover, dropdown backgrounds |
| `border` | Border colors |
| `input` | Input backgrounds |
| `ring` | Focus ring color |

### Usage in Components
```tsx
// ✅ Correct - Use Tailwind classes with theme colors
className="bg-primary text-primary-foreground"
className="border-border hover:bg-accent"

// ❌ Wrong - Never hardcode colors
className="bg-blue-500 text-white"
style={{ backgroundColor: '#3b82f6' }}
```


---

## ✅ Component Checklist

When creating a new component, ensure:

- [ ] Uses `"use client"` directive if it has interactivity
- [ ] Uses `forwardRef` for DOM element access
- [ ] Exports variants using `tailwind-variants`
- [ ] Exports TypeScript interface for props
- [ ] Uses `cn()` utility for className merging
- [ ] Uses theme colors (never hardcoded)
- [ ] Has `displayName` set for debugging
- [ ] Respects `prefers-reduced-motion` for animations
- [ ] Uses proper ARIA attributes for accessibility
- [ ] Has JSDoc comments for complex props
- [ ] Is exported from `index.ts`

---

## 🔧 Utility Functions

### `cn()` - Class Name Merger
Combines `clsx` and `tailwind-merge`:

```tsx
import { cn } from "@/lib/utils";

// Merges classes and resolves Tailwind conflicts
cn("px-4 py-2", condition && "bg-primary", className);
// "px-4 py-2 bg-primary [user className]"
```

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `tailwind-variants` | Variant-based component styling |
| `tailwind-merge` | Merge Tailwind classes without conflicts |
| `clsx` | Conditional className construction |
| `gsap` | Animation library |
| `@gsap/react` | React integration for GSAP |
| `lucide-react` | Icon library |

---

## 🚫 Anti-Patterns

### Don't Do This:
```tsx
// ❌ Hardcoded colors
className="bg-blue-500 text-white"

// ❌ Inline styles for theme colors
style={{ backgroundColor: 'var(--primary)' }}

// ❌ Missing forwardRef
const Button = (props) => <button {...props} />

// ❌ Not using cn() for className
className={`${baseClass} ${className}`}

// ❌ Ignoring reduced motion
gsap.to(el, { x: 100 }); // Always animates

// ❌ Not exporting types
export { Button }; // Missing ButtonProps
```

### Do This Instead:
```tsx
// ✅ Theme colors
className="bg-primary text-primary-foreground"

// ✅ Use Tailwind classes
className={cn("bg-primary", className)}

// ✅ forwardRef pattern
const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => ...)

// ✅ Use cn() utility
className={cn(baseVariants(), className)}

// ✅ Respect reduced motion
const prefersReducedMotion = useReducedMotion();
if (!prefersReducedMotion) gsap.to(el, { x: 100 });

// ✅ Export types
export { Button, buttonVariants };
export type { ButtonProps };
```

---

## 🔄 Common Tasks

### Adding a New Color Token
1. Add to `:root` and `[data-theme="dark"]` in `globals.css`
2. Add to `@theme inline` block in `globals.css`
3. Use in components: `bg-newcolor text-newcolor-foreground`

### Creating a New Component
1. Create file in `src/components/ui/ComponentName.tsx`
2. Follow the component file structure template above
3. Export from `src/components/ui/index.ts`
4. Add to demo page if needed

### Adding a New Animation Type
1. Add to `AnimationType` or `ScrollAnimationType` in respective hook
2. Add preset in `getAnimationPreset()` function
3. Document in this file

---

## 📝 Code Style

- Use **TypeScript** strict mode
- Use **Biome** for formatting (auto-sorts Tailwind classes)
- Prefer **named exports** over default exports
- Use **arrow functions** for components with `forwardRef`
- Group imports: React → external → internal → types
- Add comments for complex logic only

---

*Last updated: December 2024*
