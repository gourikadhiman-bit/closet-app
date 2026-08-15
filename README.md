# Closet

Closet is a social wardrobe app for organizing your clothes and sharing your closet with friends. Users can upload clothing, browse their virtual closet, discover other users, view friends' closets, and eventually request to borrow pieces directly through the app.

Currently in development.

## Tech Stack

* **React Native + Expo** for cross-platform mobile development
* **TypeScript** for application logic and type safety
* **Expo Router** for file-based navigation and protected routes
* **Supabase** for authentication, database, and image storage
* **PostgreSQL** for user, profile, clothing, and social data

## Features

### Built

* Email-based signup and login
* Persistent authentication and session handling
* New-user onboarding and profile setup
* Protected application routes
* Photo-based clothing uploads
* Clothing categories and closet filtering
* Individual item detail pages
* User search and profiles
* Viewing other users' closets
* Supabase-backed user and clothing data
* Image storage for clothing photos

### In Progress

* Friend and closet-sharing functionality
* Clothing borrowing requests
* Lending status and request tracking
* Additional social features

## Project Structure

```text
src/
├── app/
│   ├── (protected)/        # Authenticated application screens
│   ├── login.tsx
│   ├── onboarding.tsx
│   └── signup.tsx
├── components/             # Reusable UI components
├── constants/              # Shared application constants
├── context/                # Authentication, closet, and profile state
├── lib/                    # Supabase client and shared utilities
└── types/                  # TypeScript types

supabase/
├── profiles.sql
└── schema.sql

docs/
└── supabase-setup.md
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Create a local environment file from the included example:

```bash
cp .env.example .env
```

Add your Supabase project credentials to `.env`.

Database setup instructions are available in [`docs/supabase-setup.md`](docs/supabase-setup.md).

### 3. Start the app

```bash
npx expo start
```

From there, the app can be opened with Expo Go, an iOS simulator, or an Android emulator.

## Development

Closet is an ongoing personal project. I am currently expanding the social and lending functionality while continuing to build out the backend data model and mobile experience.
