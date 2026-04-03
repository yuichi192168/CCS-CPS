# CCS-CPS

CCS-CPS is a web-based College Profiling System built with Next.js and Firebase.
It centralizes student records, faculty profiles, research repository entries, and event schedules in one role-aware dashboard.

## Features

- Authentication and role-aware experience (`admin`, `faculty`, `student`)
- Student management with full profile data
- Faculty management with profile viewing/editing
- Research repository with search and filtering
- Events and schedules with calendar and filters
- Notification bell with unread/read interactions
- Responsive UI with loading states and skeleton placeholders

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Firebase Authentication
- Cloud Firestore
- Radix UI + custom UI components

## Project Structure

- `src/app` - Route pages (`students`, `faculty`, `research`, `events`, `profile`, etc.)
- `src/components` - Layout and UI components
- `src/firebase` - Firebase initialization, hooks, providers, and error utilities
- `docs` - Blueprint and backend reference notes
- `firestore.rules` - Firestore access rules

## Prerequisites

- Node.js 18+
- npm 9+
- A Firebase project with Authentication and Firestore enabled

## Installation

```bash
npm install
```

## Environment Variables

Create a local environment file (for example `.env.local`) and set:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

These are validated by the Firebase config at startup.

## Available Scripts

- `npm run dev` - Start development server on port `9002`
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run lint checks
- `npm run typecheck` - Run TypeScript checks

## Run Locally

```bash
npm run dev
```

Open `http://localhost:9002`.

## Module Overview

### Students

- Add, edit, delete student records
- Table/card/list views
- Profile details page
- Skill filtering (`basketball`, `programming`, etc.)

### Faculty

- Add, edit, delete faculty records
- Card-based profile listing
- Faculty profile page with details

### Research Repository

- Submit research papers
- Search by title/authors/abstract/tags
- Filter by year and tag
- View full abstract dialog

### Events and Schedules

- Add events
- Calendar date selection
- Filter by type and search term
- Event details dialog

## Access Control Notes

Access is enforced via Firestore rules in `firestore.rules`.
By default, write operations are role-restricted (for example, admin-only for certain collections).

## Troubleshooting

### Firestore writes fail

- Verify authenticated role in the `users` collection
- Verify `firestore.rules` permissions for your role
- Check browser console and UI toasts for permission error details

### Firebase configuration errors

- Ensure all `NEXT_PUBLIC_FIREBASE_*` variables are set
- Restart dev server after updating env values

### Build issues

```bash
npm run typecheck
npm run build
```

Fix reported issues, then rerun build.

## Notes

- This project currently uses Firestore as the primary data source.
- Demo/sample data can be seeded from admin workflows already included in the app.
