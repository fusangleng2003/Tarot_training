# Design System

## Direction
Personality: Sophistication & Trust
Foundation: Tinted (deep indigo/violet)
Depth: Subtle glows + borders

## Tokens
### Spacing
Base: 4px
Scale: 4, 8, 12, 16, 20, 24, 32, 48, 64

### Colors
```
--foreground: mystic-moon (#f0e8ff)
--secondary: mystic-star (#c9b8f0)
--muted: mystic-star/40
--faint: mystic-veil (#2d2553)
--accent: mystic-gold (#d4a843)
--accent-alt: mystic-rose (#e8729a)
--background: mystic-void (#0d0a1a)
--surface: mystic-deep (#1a1435)
--interactive: mystic-glow (#7c5cbf)
```

### Radius
Scale: 8px, 12px, 16px (rounded-lg, rounded-xl, rounded-2xl)

### Typography
Font: Cinzel (headings), Noto Serif SC (body), Inter (UI)
Scale: 10, 12, 13, 14 (base), 16, 18, 24, 32
Weights: 400, 500, 600, 700

## Patterns
### Button Primary
- Height: 40px
- Padding: 12px 20px
- Radius: 12px
- Font: 14px, 500 weight
- Background: accent color
- Usage: Primary actions

### Card Default
- Border: 2px solid (accent/30)
- Padding: 20px
- Radius: 16px
- Background: mystic-deep/60
- Usage: Interactive cards

### Card Content
- Border: 1px solid (veil)
- Padding: 16px
- Radius: 12px
- Background: mystic-deep/40
- Usage: Static content containers

### Badge
- Padding: 2px 8px
- Radius: full
- Font: 10-12px, Inter
- Background: accent/10
- Usage: Labels, status indicators

## Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Glow effects over shadows | Glows feel magical; box-shadows feel corporate on dark backgrounds | 2026-04-12 |
| Cinzel for headings | Classical serif conveys tradition and mysticism | 2026-04-12 |
| Per-context accent colors | Gold/rose/blue/purple map to different tarot practice modes | 2026-04-12 |
| border-2 on interactive cards | Thicker borders give tangible, card-like feel matching tarot cards | 2026-04-12 |
