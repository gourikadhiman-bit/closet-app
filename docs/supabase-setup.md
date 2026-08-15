# Supabase setup

The app uses Supabase Authentication for real user sessions and `public.clothing_items` for closet item persistence. React Context caches the rows currently shown in the UI; it is not permanent storage.

## 1. Create a Supabase project

Create a project in the Supabase dashboard. Open the project's **Connect** panel and locate its project URL and publishable key.

Use only the publishable key in the app. Never put a secret or service-role key in an Expo environment variable because `EXPO_PUBLIC_` values are included in the app bundle.

## 2. Configure local environment variables

Copy `.env.example` to a new `.env` file in the project root:

```sh
cp .env.example .env
```

Replace the placeholders with values from the Supabase Connect panel:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Restart Expo after changing these values. The reusable client is exported from `src/lib/supabase.ts`.

## 3. Create the database table

Open the Supabase SQL Editor, copy the contents of `supabase/schema.sql`, and run it once.

The script creates `public.clothing_items`, enables Row Level Security, and adds policies that allow authenticated users to access only their own rows. It also creates the private `clothing-images` Storage bucket and Storage policies for each user's own ID folder. The app sends the signed-in user's ID with inserts and scopes reads and mutations to that ID. The RLS policies remain the backend authorization boundary.

If the clothing table already exists, still run the Storage section at the bottom of `supabase/schema.sql`. The `insert ... on conflict` statement safely creates the bucket when missing and forces an existing bucket with that ID to remain private.

For an existing project that already has clothing items and Storage configured, run only `supabase/profiles.sql`. It creates the profile table, username constraint, timestamp trigger, grants, and profile RLS policies without recreating or deleting clothing data.

## 4. Check authentication settings

In **Authentication → Providers**, keep the Email provider enabled. Decide whether **Confirm email** should be enabled; the app supports both immediate sessions and confirmation-required sign-ups.

In **Authentication → URL Configuration**, set a valid Site URL for confirmation links. Add `closetapp://login` as an allowed redirect URL before implementing in-app email-link handling. The current confirmation flow asks users to confirm in their email and then return to the app to log in.

Set the dashboard's minimum password length to at least 8 characters if you want the server policy to match the app's validation.

## Closet data flow

The closet provider:

1. Fetch the signed-in user's rows from `clothing_items`.
2. Convert database fields such as `image_url` into the app's `ClosetItem` shape.
3. Put the fetched array into React Context so the existing screens keep reading the same UI state.
4. Send inserts, updates, and deletes to Supabase, then update Context after each operation succeeds.

Clothing items are not read from or written to AsyncStorage. AsyncStorage remains configured only in `src/lib/supabase.ts` for persistent authentication sessions.

## Image storage

Selected image bytes are uploaded to the private `clothing-images` bucket under `{userId}/{unique-file-name}`. Only that durable object path is stored in `clothing_items.image_url`. The provider creates short-lived signed URLs for rendering and keeps those temporary URLs only in React state.

The create and replacement flows remove a newly uploaded file if the subsequent database operation fails. After a successful replacement, the old file is removed. Deletes remove the database row first and then its image; this keeps the database from referencing a missing file if Storage cleanup fails. Any cleanup failure is reported to the user and logged for later orphan cleanup.

Rows created before Storage support may still contain device-local URIs. Those bytes cannot be recovered by the server. The app shows a placeholder for those legacy paths and requires the user to select a new photo when editing the item; the next successful update replaces the legacy URI with a Storage path.

## Profiles

Each `public.profiles` row has the same UUID as its corresponding `auth.users` row. The foreign key deletes the profile automatically if the authentication user is deleted. Authenticated users can read profiles, but insert and update policies require `auth.uid() = profiles.id`.

After authentication, the profile provider queries the current user's row. A missing row routes to `/profile-setup`; a database or network error shows a retry state instead. Successful setup caches the returned row and opens the closet. Existing profiles continue directly to protected app screens.
