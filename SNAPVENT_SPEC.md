# Snapvent — App Specification

## 1. Overview

Snapvent is a mobile-first web app for sharing and collecting photos at events. Users create or join event groups, take photos (or upload existing ones), and all images are instantly available in a shared gallery for every participant. The goal is to eliminate the hassle of collecting event photos from multiple people across different platforms.

**Tech stack (already set up):**
- Next.js 16 (App Router) with React 19
- Tailwind CSS 4
- JavaScript (JSX, not TypeScript)
- Project root: `snapvent/`

---

## 2. Navigation & Layout

The app uses a **persistent bottom navigation bar** visible on all screens. The layout is mobile-first (designed for phone screens, max-width ~430px centered on desktop).

### Bottom Nav Bar (5 icons, left to right)
| Position | Icon    | Label   | Action                        |
|----------|---------|---------|-------------------------------|
| 1        | Home    | Home    | Navigate to Event Overview    |
| 2        | Plus    | Add     | Navigate to Create/Join screen|
| 3 (center, larger) | Camera | Camera | Open camera / capture screen |
| 4        | Diamond | Premium | Navigate to Premium/subscription info |
| 5        | Person  | Profile | Navigate to user profile      |

- The **camera icon** in the center should be visually larger/prominent (it is the core action).
- The active tab should be visually highlighted.

---

## 3. Screens & Features

### 3.1 Home Screen — Event Overview (`/`)

The landing page after login. Shows all events/groups the user belongs to.

**Layout:**
- **Header:** Camera icon + "Snapvent" title
- **"+ Gruppe Hinzufügen" button** at top — navigates to the Create/Join screen
- **Event list:** Vertical list of event cards. Each card contains:
  - Thumbnail image (the event's cover photo or most recent photo)
  - Event/group name
- Tapping an event card navigates to that event's **Gallery Screen**
- A search icon is shown for filtering/searching events

### 3.2 Create / Join Screen (`/groups/new`)

Simple screen with two options:

- **"Gruppe erstellen" (Create Group):** Opens a form to create a new event group
  - Fields: Event name, optional description, optional cover image
  - On creation, generate a **join code or invite link** that can be shared
- **"Gruppe beitreten" (Join Group):** Opens a form to join an existing event
  - Field: Enter a join code or scan a QR code

### 3.3 Event Gallery Screen (`/groups/[groupId]`)

The shared photo gallery for a specific event. This is the core screen.

**Layout:**
- **Header:** Event thumbnail + event name (tappable for event details/settings)
- **"+ Hochladen" (Upload) button** at top — allows manual photo upload from device
- **Photo grid:** 3-column grid layout showing all photos in the event
  - Photos displayed as square thumbnails (cropped to fill)
  - Sorted by newest first (most recent photos at top)
  - The last grid cell can show a "+" button for quick upload
- **Upload arrow icon** — for uploading photos
- Tapping a photo opens the **Single Photo View**

**Context menu (long-press or menu button on the gallery):**
- Zurück (Back)
- Teilen (Share) — share the entire gallery or a link to the event
- Fotos hinzufügen (Add photos) — upload from device
- Auswählen (Select) — enter multi-select mode
- Filter — filter photos (e.g., by date, by uploader)
- Bearbeiten (Edit) — edit event details (organizer only)
- Löschen (Delete) — delete selected photos or the event (organizer only)

### 3.4 Single Photo View (`/groups/[groupId]/photos/[photoId]`)

Full-screen view of a single photo.

**Layout:**
- **Header:** Back arrow (">" / Zurück), "Taken by [Username]" label, hamburger menu
- **Full-screen image** — zoomable/pannable
- Navigation to swipe left/right through photos

**Context menu (hamburger or long-press):**
- Kopieren (Copy) — copy image
- Teilen (Share) — share the single photo
- Löschen (Delete) — delete the photo (only available to the photo's uploader or the event organizer)

### 3.5 Camera Screen (`/camera`)

Accessed via the central camera button in the nav bar.

**Behavior:**
- Opens the device camera (using browser media APIs)
- User selects which event/group the photo belongs to (or pre-selected if opened from within a group)
- After taking a photo, it is **automatically uploaded** to the selected event's shared gallery
- Should feel as seamless as a native camera app — snap and it's done

### 3.6 Profile Screen (`/profile`)

Basic user profile page.

- Display name
- Profile picture
- List of events the user is part of
- Settings (e.g., notification preferences)
- Log out button

### 3.7 Premium Screen (`/premium`)

Information about the subscription plan.

- Free tier: limited storage
- Premium subscription (~2.99 CHF/month): more storage
- Display current usage and storage limits

---

## 4. Roles & Permissions

There are two roles per event:

### Event Organizer (creator of the event)
- Can delete any photo in the event
- Can edit event details (name, description, cover image)
- Can delete the entire event
- Has access to the **Swipe Sort Mode** (Tinder-style swipe UI to quickly keep/discard photos — for managing large volumes of event photos)
- Can remove participants from the event

### Participant (joined via code/link)
- Can upload photos
- Can view all photos in the shared gallery
- Can only delete their **own** photos
- Can leave the event

---

## 5. Key Feature Details

### 5.1 Automatic Photo Upload
The defining feature. When a user takes a photo with the in-app camera, it should be automatically uploaded to the active event's gallery without any extra steps. No "confirm upload" dialog — snap and it's shared.

### 5.2 Manual Upload
For photos taken outside the app (e.g., with the native camera). Users can select photos from their device gallery and upload them to an event. This is the "+ Hochladen" button.

### 5.3 Swipe Sort Mode (Organizer Only)
A Tinder-style swipe interface for the event organizer to quickly sort through photos:
- Swipe right = keep the photo
- Swipe left = delete the photo
- This is separate from the normal gallery view — participants don't see this mode
- Purpose: help organizers clean up large photo collections after an event

### 5.4 Join via Code / Link
Events are joined via a short code or a shareable link. No need to exchange phone numbers or emails. This is critical for large events where participants don't know each other.

### 5.5 Photo Attribution
Every photo shows who took/uploaded it ("Taken by [Name]"). This is visible in the single photo view.

---

## 6. UI / Visual Style

- **Mobile-first:** Design for ~375-430px width. On desktop, center the app in a phone-sized container.
- **Clean and minimal:** White/light background, simple card-based layouts.
- **Photo grid:** 3-column square thumbnail grid (like Instagram or a phone gallery).
- **Bottom nav bar:** Fixed at the bottom, 5 icons, camera icon in the center is larger and visually prominent.
- **Fonts:** Geist Sans (already configured).
- **Color scheme:** Use a simple, modern palette. The wireframes suggest blue accents for navigation icons. Consider Snapvent brand colors if defined.
- **Dark mode:** Already supported via CSS variables — maintain support.
- **Rounded corners** on cards, buttons, and image thumbnails.
- **Icons:** Use a consistent icon set (e.g., Lucide, Heroicons, or similar).

---

## 7. Data Model (Conceptual)

### User
- `id` — unique identifier
- `name` — display name
- `email` — for login
- `profileImage` — avatar URL
- `createdAt`

### Event (Group)
- `id` — unique identifier
- `name` — event name
- `description` — optional
- `coverImage` — URL
- `joinCode` — short code for joining
- `organizerId` — reference to the User who created it
- `createdAt`

### EventMember
- `eventId` — reference to Event
- `userId` — reference to User
- `role` — "organizer" or "participant"
- `joinedAt`

### Photo
- `id` — unique identifier
- `eventId` — reference to Event
- `uploaderId` — reference to User who uploaded it
- `imageUrl` — URL to the stored image
- `createdAt`

---

## 8. Pages Summary (Next.js App Router)

```
app/
├── layout.js                          # Root layout with bottom nav bar
├── page.js                            # Home — Event Overview
├── groups/
│   ├── new/
│   │   └── page.js                    # Create / Join Group
│   └── [groupId]/
│       ├── page.js                    # Event Gallery
│       ├── settings/
│       │   └── page.js                # Event settings (organizer)
│       └── photos/
│           └── [photoId]/
│               └── page.js            # Single Photo View
├── camera/
│   └── page.js                        # Camera Screen
├── profile/
│   └── page.js                        # User Profile
├── premium/
│   └── page.js                        # Premium / Subscription Info
└── api/                               # API routes (backend)
    ├── auth/                           # Authentication endpoints
    ├── groups/                         # CRUD for events/groups
    └── photos/                         # Upload / delete photos
```

---

## 9. Backend Considerations (for later)

These are not part of the initial frontend build but should be planned for:

- **Authentication:** User registration and login (email + password, or OAuth)
- **Image storage:** AWS S3 or similar cloud storage for photos
- **Database:** Store users, events, memberships, and photo metadata
- **Real-time updates:** When someone uploads a photo, other participants should see it appear (consider WebSockets or polling)
- **Image optimization:** Compress and create thumbnails on upload to save bandwidth and storage

---

## 10. Product Backlog

### 10.1 MVP (Minimum Viable Product)

These are the features required for the first release. Each item is a user story.

#### Frontend / Global

| # | Feature | User Story |
|---|---------|------------|
| 1 | Create frontend design based on wireframe | As a developer, I want to create the frontend based on our existing wireframe design so the user has an interface to navigate on. |
| 2 | Responsive mobile layout | As a mobile user, I want the app interface to adapt to my screen size so that I can use the app comfortably on my specific smartphone model. |
| 3 | Link to download website | As a potential user, I want to easily be able to download the app on the website once I open the invite link so that I can install the app without having to search for it myself. |
| 4 | Provide APK binary on website | As a potential user, I want to be able to download the APK file directly from the website so that I can install the app on my phone without the app store. |

#### Authentication

| # | Feature | User Story |
|---|---------|------------|
| 5 | Registration with email | As a new user, I want to register an account using my email address so that I can use the app and have an address to receive updates or reset my password. |
| 6 | Password minimum requirements | As a user, I want to be informed about minimum password requirements so that I can protect my account against basic hacking attacks. |
| 7 | Login | As a registered user, I want to log in with my email and password so that I can access the app and use its functionality. |

#### Group Management (Organizer)

| # | Feature | User Story |
|---|---------|------------|
| 8 | Create group / assign name | As an event organizer, I want to create a new group and assign it a name so that I can provide a shared space for photos for my specific event. |
| 9 | Rename group | As an event organizer, I want to change the name of an existing group so that I can update the event title later or correct spelling mistakes. |
| 10 | View/manage group members | As an event organizer, I want to see a list of all users who have joined the group so that I have an overview of who is participating. (Removing users is in a future release.) |
| 11 | Delete group | As an event organizer, I want to delete a group completely so that I can clear old groups from past events. |
| 12 | Generate QR code / invite link | As an event organizer, I want to generate a unique QR code or invite link so that I can easily share access to the group with guests of the event. |

#### Group Participation

| # | Feature | User Story |
|---|---------|------------|
| 13 | Join group via link / QR code | As a user, I want to join existing groups via links or QR codes so I can easily get into new groups at central points in the venue. |
| 14 | Select group from group overview | As a participant, I want to select a specific group from the group view so that I can view and upload photos within that group. |

#### Camera & Photos

| # | Feature | User Story |
|---|---------|------------|
| 15 | In-app camera | As a participant, I want to open the in-app camera so that I can take pictures to upload. |
| 16 | Take a photo | As a participant, I want to take pictures in Snapvent so that I can capture memories. |
| 17 | Automatic photo upload to group | As a participant, I want pictures to be automatically saved to the group so that I do not lose them and don't have to manually upload each picture. |
| 18 | Store two versions per image (thumbnail + full resolution) | As a system, I want to store each image in two versions (a full-resolution image and a downscaled thumbnail) so that bandwidth and storage usage are optimized. |

#### Gallery & Viewing

| # | Feature | User Story |
|---|---------|------------|
| 19 | Gallery view per group | As a participant, I want to view all photos in a gallery view so that I can easily get an overview of the pictures. |
| 20 | Single photo view | As a participant, I want to view a photo in a single-photo view so that I can see it in full resolution and view all details. |

#### Photo Management

| # | Feature | User Story |
|---|---------|------------|
| 21 | Delete own photos | As a participant, I want to delete my own pictures so that I can remove accidental uploads or bad pictures. |

---

### 10.2 Future Releases

These features are planned for later versions after the MVP ships.

| # | Feature | User Story |
|---|---------|------------|
| 1 | Auto-detect and redirect to correct store/group | As a user, I want to be automatically redirected to the correct app store or, if the app is already installed, directly to the correct group so that I can easily join. |
| 2 | OAuth authentication (Google, etc.) | As a user, I want to authenticate using Google or other third-party providers so that I do not have to create and remember an additional password. |
| 3 | Logout | As a user, I want to log out of my account so that my account remains secure when I am no longer using the app. |
| 4 | Delete account | As a user, I want to delete my account so that my personal data is permanently removed. |
| 5 | Promote group members to organizer | As an organizer, I want to promote group members from participants to organizers so that they have additional permissions. |
| 6 | "Forgot password" feature | As a user, I want to reset my password so that I can still access my account if I forget it. |
| 7 | Set max photo quality per group | As an organizer, I want to set a storage limit for individual photos so that the group's storage does not fill up too quickly. |
| 8 | Remove group members | As an organizer, I want to remove a group member so that they no longer have access to the group. |

---

## 11. Build Priorities

Build in this order:

1. **Layout & Navigation** — Bottom nav bar, page routing, mobile-first container (MVP #1, #2)
2. **Authentication** — Registration, login, password requirements (MVP #5, #6, #7)
3. **Home Screen** — Event list / group overview (MVP #14)
4. **Create / Join Group** — Forms, join code, QR generation (MVP #8, #12, #13)
5. **Event Gallery** — Photo grid with thumbnails (MVP #19)
6. **Single Photo View** — Full-screen photo display (MVP #20)
7. **Camera Integration** — Browser camera API, auto-upload flow (MVP #15, #16, #17)
8. **Image Optimization** — Thumbnail + full-res storage (MVP #18)
9. **Photo Management** — Delete own photos (MVP #21)
10. **Group Management** — Rename, view members, delete group (MVP #9, #10, #11)
11. **Download Website** — Landing page with APK download (MVP #3, #4)
12. **Future Release features** — OAuth, logout, account deletion, member management, etc.
