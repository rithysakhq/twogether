# Twogether MVP - Execution Plan

- [x] **Phase 1: Foundation**
  - [x] Initialize React Native Expo app with TypeScript (`blank-typescript` template, SDK 54).
  - [x] Move CLAUDE.md, prd.md, design-system.md, tasks/ into `twogether-app/`.
  - [x] Install core deps: `@supabase/supabase-js`, `react-native-url-polyfill`, `react-native-safe-area-context`.
  - [x] Create `src/components`, `src/screens`, `src/lib` directory structure.
  - [x] Create `src/lib/supabase.ts` with placeholder Supabase client init (keys empty).
  - [x] Rewrite `App.tsx`: `#0F0F13` background, `#FF2A5F` bold centered text, `SafeAreaProvider` + `SafeAreaView`.
  - [x] Verified: `npx expo start --clear` launches, no TypeScript errors.
- [x] **Phase 2: Database & Auth Schema**
  - [x] Create `profiles` table (id, pair_id, created_at) — done manually in Supabase.
  - [x] Create `prompts` table (id, question_text, active_date) — done manually in Supabase.
  - [x] Create `answers` table (id, user_id, prompt_id, answer_text, created_at) — done manually in Supabase.
  - [x] Add `pair_code TEXT UNIQUE` column to profiles — SQL: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pair_code TEXT UNIQUE;`
  - [x] Create `link_pair` Postgres RPC function (SECURITY DEFINER) — see plan for SQL.
  - [x] Build `src/screens/AuthScreen.tsx` — email/password, Sign In / Sign Up mode toggle.
  - [x] Build `src/screens/PairingScreen.tsx` — display pair_code, enter partner code, call link_pair RPC.
  - [x] Rewrite `App.tsx` — session state machine: loading → AuthScreen → PairingScreen → "Coupled!".
  - [x] TypeScript verified: `npx tsc --noEmit` — zero errors.
- [x] **Phase 3: The Core Loop (UI)**
  - [x] Update tasks/todo.md with Phase 3 checklist.
  - [x] Create `src/screens/HomeScreen.tsx` — fetch today's prompt, check answers, show 4 UI states (unanswered / waiting / revealed / no-prompt).
  - [x] Implement Supabase Realtime subscription on `answers` for today's `prompt_id` → instant UI update when partner answers.
  - [x] Implement Streak counter logic (client-side from DB data, no AsyncStorage).
  - [x] Update `App.tsx` — replace "Coupled!" placeholder with `<HomeScreen userId pairId />`.
  - [x] Verified: `npx tsc --noEmit` — zero errors.
- [x] **Phase 5: Revenue & Retention Hooks**
  - [x] Update tasks/todo.md with Phase 5 checklist.
  - [x] Install `react-native-purchases` via `npx expo install`.
  - [x] Initialize RevenueCat SDK in `App.tsx`; add `isPremium` state + `checkPremium` + `onPremiumUnlocked`.
  - [x] Wire purchase logic in `PaywallScreen.tsx` — fetch offerings, `purchasePackage`, call `onPremiumUnlocked` on success.
  - [x] Feature-gate Past Memories in `HomeScreen.tsx` — free: 2 cards + "Unlock All Memories" upsell card; premium: all 7.
  - [x] Fix `AuthScreen.tsx` Email input: `letterSpacing: 0`.
  - [x] Verified: `npx tsc --noEmit` — zero errors.
- [x] **Phase 4: Polish & First Paywall**
  - [x] Update tasks/todo.md with Phase 4 checklist.
  - [x] Create `src/screens/SettingsScreen.tsx` — pair_code display, Go Premium button, Sign Out.
  - [x] Create `src/screens/PaywallScreen.tsx` — sleek paywall UI, no logic wired yet.
  - [x] Update `src/screens/HomeScreen.tsx` — header row (streak + gear), Past Memories gallery, modal state.
  - [x] Update `App.tsx` — pass `pairCode` prop to HomeScreen.
  - [x] Verified: `npx tsc --noEmit` — zero errors.

---

## Review

### Phase 5 — Completed 2026-04-05
- `react-native-purchases` installed via `npx expo install` (4 packages).
- App.tsx: `Purchases.configure({ apiKey })` on mount; `checkPremium()` reads `entitlements.active['premium']`; `onPremiumUnlocked` sets `isPremium=true`. Both `isPremium` and `onPremiumUnlocked` passed to HomeScreen. `isPremium` resets to false on sign-out.
- PaywallScreen: fetches `current.monthly` offering on mount; `purchasePackage` on CTA; calls `onPremiumUnlocked` + `onClose` on success; swallows `userCancelled` errors silently; shows error text for other failures; CTA disabled while purchasing or if no offering loaded (e.g. simulator).
- HomeScreen: `isPremium` + `onPremiumUnlocked` props added; free tier shows `memories.slice(0, 2)` + pink-bordered "✦ Unlock All Memories" upsell card; premium shows all 7. `onPremiumUnlocked` passed through to PaywallScreen modal.
- AuthScreen: `letterSpacing: 0` added to `input` style — fixes placeholder spacing on email field.
- **Important:** `react-native-purchases` uses native modules — requires `npx expo run:ios` or a dev client build. Will not work in Expo Go.
- **Before testing:** Replace `[PASTE_YOUR_REVENUECAT_KEY_HERE]` in App.tsx with your actual RevenueCat API key. Set up a "premium" entitlement and a monthly offering in the RevenueCat dashboard.

### Phase 4 — Completed 2026-04-05
- No new packages. Pure RN primitives throughout.
- HomeScreen: replaced bare streak label with a header row (streak left, ⚙ gear right, minWidth/minHeight 44px). Gear opens SettingsScreen modal.
- SettingsScreen: `<Modal animationType="slide">` — displays pair_code, "Twogether Premium ✦" button → opens PaywallScreen, "Sign Out" button calls `supabase.auth.signOut()` (App.tsx state machine handles routing automatically).
- PaywallScreen: `<Modal animationType="slide">` — headline "Protect Your Connection.", 3 feature cards (∞ Unlimited History, ❄ Streak Freezes, ✦ Exclusive Prompts), CTA button (no-op; RevenueCat wired in next sub-step).
- Past Memories: consolidated streak history query to also fetch `answer_text` + `question_text`. `buildMemories()` groups by date, excludes today, requires both users answered, sorts desc, caps at 7. Rendered as horizontal `ScrollView` of 240px cards below revealed answers. Hidden when empty.
- App.tsx: one-line change — passes `pairCode={profile.pair_code ?? ''}` to `<HomeScreen>`.
- To test memories: seed past prompts + both users' answers in Supabase with `active_date` set to prior dates.

### Phase 1 — Completed 2026-04-05
- Expo SDK 54, TypeScript managed workflow.
- Deps confirmed in package.json: supabase-js ^2.101.1, url-polyfill ^3.0.0, safe-area-context ~5.6.0.
- App.tsx: SafeAreaProvider + SafeAreaView, #0F0F13 bg, #FF2A5F bold accent text, StatusBar light. Pure RN primitives only.
- src/lib/supabase.ts — live Supabase URL + anon key added by user.

### Phase 3 — Completed 2026-04-05
- No new packages. Pure RN primitives throughout.
- HomeScreen: 4 UI states (unanswered / waiting / revealed / no-prompt). `KeyboardAvoidingView` + `ScrollView`.
- Realtime: Supabase channel on `answers` INSERT filtered by `prompt_id`. Partner's answer appears instantly via `postgres_changes`.
- Streak: Client-side computation — fetches all answers for both users with embedded `prompts.active_date`, counts consecutive days both answered ending today.
- App.tsx: "Coupled!" placeholder replaced with `<HomeScreen userId pairId />`. Dead imports/styles removed.
- Before testing: run the 2 SQL blocks from the plan (RLS policies on `answers` + seed a prompt for CURRENT_DATE).

### Phase 2 — Completed 2026-04-05
- No new packages installed. Pure RN primitives throughout.
- AuthScreen: email/password, Sign In / Sign Up mode toggle, KeyboardAvoidingView, 44px hit targets.
- PairingScreen: displays user's pair_code (6-char uppercase), accepts partner code, calls `link_pair` Supabase RPC.
- App.tsx: state machine via `onAuthStateChange` + profile fetch. Routes: loading → AuthScreen → PairingScreen → "Coupled!" (#00E59B).
- Pairing is atomic via SECURITY DEFINER RPC — safe with RLS enabled.
- Before testing: run the 2 SQL statements from the plan (pair_code column + link_pair function).
