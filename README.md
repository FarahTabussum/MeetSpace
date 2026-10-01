# MeetSpace - Meeting Room Booking System

A modular HRIS/ERP meeting room booking system built with Django REST Framework (backend) and React + MUI + Framer Motion (frontend).

## Tech Stack

| Layer    | Technology                                               |
| -------- | -------------------------------------------------------- |
| Backend  | Django 5.x, Django REST Framework, SimpleJWT             |
| Frontend | React 18, MUI (Material UI), Framer Motion, React Router |
| Database | SQLite (dev), PostgreSQL (production ready)              |
| Email    | Gmail SMTP                                               |
| Auth     | JWT (access + refresh tokens), role-based access control |

---

## User Roles

| Role         | Description                                                                                               |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| **HR-Admin** | Full system access: user management, room management, booking approvals, announcements, all bookings view |
| **Employee** | Book rooms, view own bookings, receive announcements, access essential information                        |

---

## Features Implemented

### 1. Authentication & User Management

- **Custom User Model** with email as username, role field (HR-Admin / Employee), `must_change_password` flag
- **JWT Authentication** — login, logout, token refresh, change password, forced password change on first login
- **Registration** — default password `Welcome@123`, `must_change_password=true`
- **User Management (Admin)** — CRUD, activate/deactivate users, CSV bulk upload with validation
- **Role-Based Access Control (RBAC)** — permissions enforced on backend and frontend

### 2. Room Management (Admin)

- **CRUD** — create, read, update, delete rooms
- Room fields: room number, floor, min/max occupancy, active status
- Inline edit dialog, status toggle

### 3. Room Booking (Employee)

- **Availability Search** — date, time range, participant count
- **Conflict Detection** — backend validates no double-booking (overlap check on approved bookings)
- **Next-Best-Time Suggestions** — when no rooms available, suggests alternatives across 3-day window, 30-min increments
- **Requirements Field** with categorized options:
  - IT Technologies (projector, video conferencing, HDMI, etc.)
  - Refreshment (coffee, snacks, water, etc.)
  - Each category opens its own text field; both optional but at least one field (text or file) required
- **Booking Submission** — creates booking with `pending` status, toast: "Room Booking Request Sent Successfully"

### 4. My Bookings (Employee)

- **All Bookings Table** — shows every booking regardless of status (In Progress, Approved, Rejected, Cancelled, Alternatives)
- **Status Column** with color-coded chips
- **Cancel Booking** — mandatory reason dialog with "Clear" button
- **Clear All** button to clear view (client-side only)
- **Alternatives Modal** — when admin suggests alternatives, employee can accept one or reject all

### 5. Admin Booking Approvals

- **Pending Bookings List** — cards with meeting details, employee info
- **Three Actions per Booking**:
  - **Approve** — confirmation email sent to employee
  - **Reject** — mandatory reason + rejection email
  - **Alternatives** — opens dialog with week availability grid:
    - Shows all available room + date + time combinations (8 AM–8 PM, 30-min slots)
    - Day filter chips (All Days + each date)
    - Multi-select alternatives, send to employee via email
- **Email Notifications** for all actions (Gmail SMTP)

### 6. Admin All Bookings

- **List View** with filters: date, room, status (In Progress, Approved, Rejected, Cancelled, Alternatives)
- **Calendar View** — monthly grid showing bookings per day
- **Cancel Any Booking** — mandatory reason, allowed for In Progress, Approved, Alternatives
- **Clear All** button (client-side)
- **Clickable Status Chips** — on Cancelled/Rejected rows, click to view reason + timestamp in a dialog

### 7. Dashboards

| Dashboard               | Widgets                                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| **Admin**               | Total users, active users, total rooms, total bookings, upcoming bookings, recent bookings (5) |
| **Employee (Overview)** | Upcoming bookings, past bookings, cancelled bookings — stat cards with icons                   |

### 8. Announcements

- **Admin Page** (`/admin/announcements`) — "Add Announcement" button opens dialog:
  - Text field (optional)
  - File upload (any type: PDF, image, video, Excel, etc.)
  - At least one (text or file) required
  - Table shows all announcements with download links, delete action
- **Employee Page** (`/employee/announcements`) — read-only table with download links
- Backend: `GET/POST/DELETE /api/announcements/`, media served at `/media/`

### 9. Meeting Rooms (Admin) — Unified Page

- Single sidebar entry **"Meeting Rooms"** → `/admin/meeting-rooms`
- Top tabs (50/50 width): **Room Management** | **Booking Approval**
- Old routes `/admin/rooms` and `/admin/approvals` redirect here

### 10. Essential Information & Forms (Employee)

- Page at `/employee/essential-info` with two sections:
  - **Company Information** — 6 cards: Working Hours, Contacts, Email Directory, Policies, IT & Facilities, Company Overview
  - **Forms** — 5 downloadable forms (Leave, Expense, Feedback, Training, Asset) with format badges

### 11. Navigation & Layout

- **Shared Navbar** on every page (logo, user avatar, logout)
- **Admin Sidebar**: Overview, User Management, Meeting Rooms, All Bookings, Announcement
- **Employee Sidebar**: Overview (was Dashboard), Room Booking, Announcement, Essential Information & Forms
- **Home page removed** — `/` redirects to `/login`

### 12. Email System

- Gmail SMTP configured via `.env` (not committed)
- Templates for: booking request (admin), approval, rejection, alternatives suggested, alternative accepted/rejected, cancellation
- Sent asynchronously with `fail_silently=True`

### Default Employee Password

All new employees: `Welcome@123` (forced change on first login)

---

## Key Design Decisions

1. **SQLite for development** — PostgreSQL config commented in `settings.py`
2. **Only `approved` bookings block availability** — pending/rejected/alternatives don't create conflicts
3. **Booking statuses**: `pending` (In Progress), `approved`, `rejected`, `cancelled`, `alternatives`
4. **Alternatives stored as JSONField** on Booking model
5. **Cancelled + Rejected grouped** in employee "Cancelled Bookings" section
6. **Frontend date inputs** use `slotProps={{ inputLabel: { shrink: true } }}` to prevent label overlap
7. **Toast message** exactly: "Room Booking Request Sent Successfully"

- Login page with forced password change flow
- Admin sidebar with Meeting Rooms tab
- Room Management / Booking Approval tabs (50/50)
- Employee Overview with stat cards
- Booking form with IT/Refreshment requirement chips
- Admin approvals with alternatives week-grid
- Announcements with file upload
- Essential Information cards + Forms table

---
