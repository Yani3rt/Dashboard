## PS5 Dashboard OS Direction

### Goal

Shift the dashboard from a generic productivity layout to a PS5-inspired interface that feels premium, focused, and easy to navigate.

### Experience Principles

- Keep the existing information architecture so the product stays intuitive.
- Emphasize focus states, motion, and layered surfaces to mirror console navigation.
- Use a controlled PS5-style palette: deep navy canvas, electric blue highlights, cool white text, and translucent panels.
- Make interactive controls feel large, readable, and comfortable on both desktop and mobile.

### Visual System

- Typography: clean geometric display styling with a modern body font for legibility.
- Surfaces: glass-like cards, low-contrast borders, soft depth, and ambient lighting.
- Accents: blue glow reserved for active state, primary actions, and navigation emphasis.
- Background: cinematic gradients with subtle wave-like circular framing instead of flat fills.

### Navigation Pattern

- Sidebar becomes a destination rail with larger targets, active glow, and premium account footer.
- Top bar acts like a console status strip with current location, quick actions, and live session state.
- Command palette and quick capture remain central interaction shortcuts to preserve speed.

### Home Screen Pattern

- Hero becomes a featured session stage with quick destinations and progress framing.
- Supporting cards behave like focused content panels instead of plain utility boxes.
- Metrics and task progress are presented as high-clarity session stats.

### Implementation Scope

- Update shared theme tokens in `app/globals.css`.
- Restyle shell and sidebar in `components/shell.tsx` and `components/ui/sidebar.tsx`.
- Update shared component surfaces in `components/ui/button.tsx`, `components/ui/card.tsx`, `components/ui/input.tsx`, and `components/ui/dialog.tsx`.
- Refresh the main dashboard hero in `app/page.tsx`.

### Verification

- Run `npm run lint` after the visual update.
- Review on desktop and mobile to confirm spacing, hierarchy, and interaction clarity.
