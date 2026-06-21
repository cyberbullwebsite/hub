# CyberBull Authentication Foundation

Production-grade authentication foundation for CyberBull.

## Stack

- React + Vite + TypeScript
- Firebase Authentication v11 modular SDK
- Cloud Firestore
- React Router
- Tailwind CSS
- Framer Motion

## Included

- Smartschool-inspired but original auth card
- Login, registration, owner login, forgot password
- Firebase auth persistence
- Firestore user creation and settings architecture
- Protected routes
- Placeholder dashboard, profile, settings, admin shells
- Localization scaffold for Dutch and English
- Security rules
- Responsive UI

## Setup

1. Copy `.env.example` to `.env`
2. Install dependencies
3. Run `npm run dev`
4. Build with `npm run build`

## Firestore docs

- `settings/global`
- `settings/auth`
- `settings/ui`
- `settings/featureFlags`
- `users/{uid}`
