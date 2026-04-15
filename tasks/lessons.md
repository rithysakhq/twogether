# Claude Code - Self-Improvement & Project Rules

*Review this file at the start of every session to prevent repeated mistakes.*

1. **Simplicity First:** Do not over-engineer UI components. Rely on standard Expo primitives (`View`, `Text`, `TouchableOpacity`) before installing third-party libraries.
2. **Supabase Realtime:** Always ensure RLS (Row Level Security) policies allow users to read their partner's data *only* if they share a `pair_id`.
3. **Verification:** Never mark a step in `todo.md` complete until it has been successfully run and visually verified on the Expo Go app.