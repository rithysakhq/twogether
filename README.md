# Twogether 2.0

Twogether 2.0 is an Expo and React Native app for couples in long-distance relationships. It centers on a daily shared prompt, private partner pairing, streaks, memories, and optional premium features.

## App Stack

- Expo SDK 54 with React Native and TypeScript
- Expo Router for file-based navigation
- Supabase for authentication, profiles, prompts, answers, and realtime updates
- RevenueCat for optional premium subscriptions

## Project Layout

```text
src/
  app/           Expo Router screens
  components/    Shared UI components
  constants/     Brand and color constants
  lib/           Service clients
  screens/       Legacy app-flow screens
  utils/         Platform services
docs/
  product-brief.md
  design-system.md
  archive/
```

## Local Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Fill in the public Expo environment variables:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_REVENUECAT_API_KEY`
4. Start the app with `npm start`.

Only public client keys should use the `EXPO_PUBLIC_` prefix. Keep service-role keys, database passwords, private signing keys, and platform tokens out of the repository.

## Useful Commands

```bash
npm start
npm run ios
npm run android
npm run web
npx tsc --noEmit
```

## Docs

- [Product Brief](docs/product-brief.md)
- [Design System](docs/design-system.md)
- [Security](SECURITY.md)
