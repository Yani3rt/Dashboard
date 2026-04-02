# Night Shift Dashboard — UI/UX Design Specs

## Design Philosophy

Premium dark-mode dashboard inspired by modern enterprise SaaS interfaces. The design emphasizes **depth through subtle transparency**, **warmth in a dark environment** via a coral accent, and **generous spacing** for a calm, professional feel.

---

## Color Palette

### Dark Theme (Primary)

| Token | HSL Value | Hex Approx. | Usage |
|-------|-----------|-------------|-------|
| `--background` | `162 30% 5%` | `#091412` | Page background |
| `--foreground` | `140 15% 92%` | `#E4EDE8` | Primary text |
| `--card` | `160 22% 9%` | `#121F1A` | Card surfaces |
| `--card-foreground` | `140 12% 95%` | `#EFF3F0` | Card text |
| `--popover` | `160 22% 9%` | `#121F1A` | Dropdowns, modals |
| `--primary` | `16 80% 58%` | `#E0734A` | Accent (coral/orange) |
| `--primary-foreground` | `162 30% 5%` | `#091412` | Text on accent |
| `--secondary` | `160 18% 14%` | `#1D2E28` | Secondary surfaces |
| `--muted` | `158 16% 16%` | `#222D29` | Muted backgrounds |
| `--muted-foreground` | `150 8% 55%` | `#7D9189` | Secondary text |
| `--accent` | `158 16% 16%` | `#222D29` | Hover states |
| `--destructive` | `0 62% 50%` | `#CC3333` | Error/danger |
| `--border` | `158 14% 17%` | `#253530` | Subtle borders |
| `--input` | `158 14% 17%` | `#253530` | Input borders |
| `--ring` | `16 80% 58%` | `#E0734A` | Focus rings |
| `--radius` | — | `0.875rem` | Base border-radius (14px) |

### Sidebar

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--sidebar-background` | `162 28% 7%` | Sidebar surface |
| `--sidebar-foreground` | `150 12% 80%` | Sidebar text |
| `--sidebar-primary` | `16 80% 58%` | Active sidebar item |
| `--sidebar-accent` | `160 18% 13%` | Sidebar hover |
| `--sidebar-border` | `158 14% 15%` | Sidebar dividers |

### Light Theme

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--background` | `140 20% 97%` | Page background |
| `--foreground` | `160 30% 8%` | Primary text |
| `--card` | `0 0% 100%` | Card surfaces |
| `--primary` | `16 75% 50%` | Accent (coral) |
| `--muted` | `150 12% 92%` | Muted backgrounds |
| `--border` | `150 10% 87%` | Borders |

---

## Typography

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page heading (h2) | 1.5rem | 700 | `foreground` |
| Section heading (h3) | 1.05rem | 600 | `foreground` |
| Item heading (h4) | 0.925rem | 600 | `foreground` |
| Body text | 0.875rem | 400 | `muted-foreground` |
| Small/label | 0.75rem | 500 | `muted-foreground` |
| Badge | 0.75rem | 500 | `primary` / `secondary-foreground` |

**Font stack**: `"Geist", "Geist Fallback", ui-sans-serif, system-ui, -apple-system, sans-serif`

---

## Spacing

| Context | Value |
|---------|-------|
| Page padding (mobile) | `1rem` |
| Page padding (desktop) | `1.75rem` |
| Card padding | `1.25rem` |
| Gap between cards | `1rem` |
| Form gap | `0.5rem` |
| Section head margin-bottom | `0.75rem` |

---

## Border & Radius

| Element | Radius | Border |
|---------|--------|--------|
| Cards | `0.875rem` (14px) | `1px solid hsl(border / 0.5)` |
| Inner cards (task-row, note-card) | `0.75rem` (12px) | `1px solid hsl(border / 0.4)` |
| Buttons | `0.625rem` (10px) | Varies by variant |
| Inputs | `0.625rem` (10px) | `1px solid hsl(input)` |
| Progress ring | `999px` | None |
| Badges | `999px` | None |

---

## Cards & Glassmorphism

```css
/* Primary card surface */
background: hsl(var(--card) / 0.7);
backdrop-filter: blur(16px);
border: 1px solid hsl(var(--border) / 0.5);
box-shadow:
  0 2px 4px hsl(160 30% 2% / 0.3),
  inset 0 1px 0 hsl(140 20% 90% / 0.03);
```

**Hover state**: Subtle border brightening + gentle lift (`translateY(-2px)`).
No heavy glow — keep it understated and professional.

---

## Animations

| Animation | Duration | Easing | Description |
|-----------|----------|--------|-------------|
| Content fade-in | 0.45s | ease-out | Page content entrance |
| Card hover | 0.22s | ease | Lift + border highlight |
| Task row hover | 0.18s | ease | Subtle slide-right + border |
| Note card hover | 0.2s | ease | Scale + shadow |
| Ring entrance | 1.0s | ease-out | Scale + rotate |
| Skeleton shimmer | 1.5s | ease-in-out | Infinite gradient scroll |
| Streak dot hover | 0.18s | ease | Scale up |

---

## Background Treatment

The page body uses **two subtle radial gradients** (green/teal tones) fixed to the viewport to create depth without distraction:

```css
background-image:
  radial-gradient(ellipse at -10% -20%, hsl(160 60% 20% / 0.12), transparent 50%),
  radial-gradient(ellipse at 110% 0%, hsl(180 50% 18% / 0.10), transparent 45%);
background-attachment: fixed;
```

---

## Interactive States

| Element | Default | Hover | Focus |
|---------|---------|-------|-------|
| Card | `border: hsl(border/0.5)` | `border: hsl(border/0.8)`, `translateY(-2px)` | — |
| Task row | `bg: card/0.55` | `bg: card/0.85`, `translateX(3px)` | — |
| Note card | `bg: card/0.55` | `scale(1.01)`, shadow | — |
| Button (primary) | `bg: primary` | `brightness(1.1)` | `ring: 2px primary` |
| Input | `bg: transparent` | `border: muted-foreground/0.3` | `ring: 1px primary` |
| Streak dot | `bg: muted` | `scale(1.35)` | — |
| Streak dot (filled) | `bg: primary`, glow | `scale(1.35)` | — |
