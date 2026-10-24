# Tide & Table

A Supabase-backed restaurant reservation demo with a flat, dark/teal SaaS-style interface.

## Pages

- `/` — main restaurant experience, reservation form, and auth modal (rewritten to `olive_ember_restaurant_website.html` on Vercel)
- `/auth/login.html` — standalone login
- `/auth/register.html` — standalone create account
- `/admin.html` — reservation dashboard for admin accounts

## Supabase

The frontend uses the publishable Supabase key. Reservation access is protected by RLS: guests can create and read their own reservations, while admin accounts can read and manage all reservations.

## Deploy on Vercel

1. Import this repository into Vercel.
2. Use the **Other** framework preset.
3. Leave the build command empty and use the repository root as the output directory.
4. Deploy.

`vercel.json` rewrites `/` to the main page so the site opens at the clean root URL.
