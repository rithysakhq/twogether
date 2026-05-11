# Security

This repository is public-safe source code and documentation only.

Do not commit:

- `.env`, `.env.local`, or platform-specific environment files
- Supabase service-role keys or database passwords
- RevenueCat private keys or webhook secrets
- Vercel, GitHub, or Expo access tokens
- Native signing assets such as `.p8`, `.p12`, `.jks`, `.mobileprovision`, or `.pem`

Client-side Expo variables may be committed only as placeholders in `.env.example`. Real values should live in local environment files or the deployment platform's encrypted environment variable store.
