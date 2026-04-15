# Twogether: The LDR "Daily Sync" Feature PRD

**BE:** Claude Code (Subagent) &nbsp;&nbsp;&nbsp; **FE:** Claude Code (Main) &nbsp;&nbsp;&nbsp; **Design:** Tailwind/Expo Default &nbsp;&nbsp;&nbsp; **PM:** User & Gemini &nbsp;&nbsp;&nbsp; **QA:** Claude Code

---

## ✨ Context
Long-Distance Relationships (LDRs) suffer from asynchronous communication and emotional decay. Existing apps like "Been Together" act as passive day-counters with low retention and high churn. We are building "Twogether," a gamified, active relationship OS. To validate the app and reach $5k MRR, we are starting with a weekend MVP focused on one high-retention habit loop.

---

## ✨ Problem
- Passive relationship trackers have no daily retention triggers.
- Couples in LDRs struggle to initiate meaningful, non-repetitive daily conversations.
- Utility apps struggle to monetize without a clear, habitual value driver.

---

## ✨ User Profile
- **Demographic:** Gen Z and Millennials (18–35), highly mobile-native.
- **Context:** Currently in a Long-Distance Relationship or separated by opposing work schedules.
- **Pain Point:** The "waiting" anxiety and the friction of keeping a text conversation interesting every single day.

---

## ✨ Solution Options
- **Option A:** A shared calendar and countdown widget. (Rejected: Passive, already commoditized).
- **Option B:** A real-time chat clone. (Rejected: Too high friction to build, competes with iMessage/WhatsApp).
- **Option C:** The "Blind Daily Prompt" (BeReal for text). A daily question pushed to both partners; answers are hidden until both reply. Drives a shared streak.
**→ Selected approach:** Option C. Highest emotional ROI for the lowest technical lift.

---

## ✨ Northstar / Objective
Achieve a 7-day streak retention rate of 40% among paired couples, proving the "Blind Daily Prompt" habit loop works, paving the way for premium subscription up-sells.

---

## ✨ Design Requirements
- **Theme:** Minimalist, high-contrast. Dark mode native. 
- **Layout:** One primary CTA on the home screen. No cluttered nav bars.
- **Feedback:** Immediate haptic feedback and visual celebration (confetti) when a streak increments.

---

## ✨ V1 Solution
- **Onboarding:** Simple 6-digit code to link Partner A and Partner B.
- **The Core Loop:** Home screen displays today's locked question. A text input field.
- **The Reveal:** Once both answer, the UI unlocks to show both responses side-by-side.
- **The Streak:** A large number tracking consecutive days answered.

---

## ✨ Engineering Requirements (V1)
- React Native with Expo (Managed Workflow) for cross-platform UI.
- Supabase for Auth (Magic Link/Email) and Database.
- Supabase Realtime enabled on the `answers` table so the UI unlocks instantly when the partner submits.
- Local async storage for caching the streak count (reduce DB reads).

---

## ✨ V2 Solution
- RevenueCat integration for "Twogether Premium" ($4.99/mo).
- Premium features: "Streak Freezes" and "Relationship Analytics" (AI-driven insights on their past answers).
- Custom home screen widgets (iOS/Android).

---

## ✨ Engineering Requirements (V2)
- Integrate `react-native-purchases` (RevenueCat SDK).
- Set up push notification infrastructure (Expo Push Notifications) for the daily prompt trigger.

---

## ✨ QA Checklist
- Happy Path: User A and B link successfully. User A answers (UI stays locked). User B answers (UI unlocks for both).
- Error State: Partner unpairs/deletes account.
- Edge Case: Both users answer at the exact same millisecond.

---

## ✨ Analytics Requirements
- Event: `couple_paired` (Tracks onboarding success).
- Event: `daily_prompt_answered` (Tracks engagement).
- Event: `streak_incremented` (Tracks retention).