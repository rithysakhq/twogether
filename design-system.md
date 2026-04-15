# Twogether: Design System & Brand Guidelines

**Vibe:** Premium, Stealthy, Dark-Mode Native, High-Contrast Gamification.

## Colors
- **Primary Background:** `#0F0F13` (Deep Charcoal/Almost Black)
- **Secondary Background (Cards/Inputs):** `#1C1C21` (Slightly lighter grey for elevation)
- **Primary Accent (The Streak/Action):** `#FF2A5F` (Vibrant Neon Pink - signals love/urgency)
- **Success/Completed:** `#00E59B` (Electric Mint)
- **Text Primary:** `#FFFFFF` (Pure White)
- **Text Secondary:** `#8E8E93` (Muted Grey)

## Typography
- **Headings:** Sans-serif, bold, tight tracking. (Default system fonts: San Francisco on iOS, Roboto on Android, but strictly weighted heavily).
- **Body:** Clean, highly legible, 16px base size.

## UI/UX Rules for Claude
- **Hit Areas:** All touchable elements MUST have a minimum height of 44px (Apple HIG standard).
- **Borders:** Subtle border radii (12px to 16px) for cards and inputs. No sharp corners.
- **Shadows:** Minimal. In dark mode, use background color lightness to show elevation, not heavy drop shadows.
- **Safe Areas:** Always use `SafeAreaView` from `react-native-safe-area-context` to prevent UI from hiding under the iPhone dynamic island or Android navigation bar.