# Task Management App

A Trello-style kanban board built as a capstone project for RAVN's frontend training module. The app lets you view, create, edit, and delete tasks across five status columns, search tasks by name, and view your profile — all against a live GraphQL API.

---

## Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Access credentials for the GraphQL API (endpoint URL + bearer token)

### Steps

1. **Clone the repo and install dependencies**

   ```bash
   git clone <repo-url>
   cd task-management-app
   npm install
   ```

2. **Configure environment variables**

   Create a `.env` file at the project root:

   ```env
   VITE_GRAPHQL_ENDPOINT=https://<your-api-host>/graphql
   VITE_GRAPHQL_TOKEN=<your-bearer-token>
   ```

   Both variables are required. The app will not authenticate without them.

3. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Run the test suite**

   ```bash
   npx vitest run
   ```

---

## Project Description

The app is a task management board that maps to the five task statuses defined by the API: `BACKLOG`, `TODO`, `IN_PROGRESS`, `DONE`, and `CANCELLED`. Each column shows all tasks in that status along with a task count badge.

### Features implemented

- **Board view** — five-column kanban layout matching the API's `Status` enum
- **Create task** — modal form with name, due date, point estimate, status, tags, and optional assignee
- **Edit task** — same modal pre-populated with the task's current values
- **Delete task** — options menu on each card, with a confirmation dialog before the mutation fires
- **Search by name** — live search input in the header, debounced 300 ms, synced to the URL as `?q=`
- **Profile page** — shows the authenticated user's avatar, name, email, role, and member-since date
- **Responsive layout** — desktop sidebar + header; mobile bottom navigation + floating action button

---

## Technologies

| Area | Choice |
|---|---|
| Bundler | Vite |
| Language | TypeScript |
| UI framework | React 19 |
| Routing | react-router-dom v7 |
| GraphQL client | Apollo Client v4 (`HttpLink` + `InMemoryCache`) |
| Styling | CSS Modules + CSS custom properties |
| Testing | Vitest + React Testing Library + `@testing-library/user-event` |
| Test environment | jsdom |

---

## Project Structure

```
src/
├── components/
│   ├── layout/         # PageWrapper, Header, Sidebar, BottomNav
│   └── ui/icons/       # SVG icon components
├── features/
│   ├── tasks/
│   │   ├── components/ # TaskCard, TaskColumn, TaskModal
│   │   ├── context/    # TasksUIContext + reducer (modal state)
│   │   ├── graphql/    # GET_TASKS, GET_USERS, CREATE/UPDATE/DELETE_TASK
│   │   ├── hooks/      # useTasks, useCreateTask, useUpdateTask, useDeleteTask, useUsers
│   │   └── types.ts    # TypeScript types mirroring the GraphQL schema
│   └── profile/
│       ├── graphql/    # GET_PROFILE
│       └── hooks/      # useProfile
├── hooks/              # useDebounce (shared)
├── lib/
│   ├── apollo-client.ts
│   └── avatar.ts       # DiceBear URL normalization
├── pages/              # DashboardPage, ProfilePage, NotFoundPage
├── routes/             # AppRoutes
└── styles/
    └── variables.css   # Design tokens (colors, status colors, tag colors)
```

---

## Decision Rationale

### Apollo Client — no `setContext`, static headers

The API token is a static credential set at build time via an environment variable. Since it never changes at runtime, the bearer token is injected once into `HttpLink`'s `headers` option directly. This is simpler and avoids pulling in `@apollo/client/link/context` for something that doesn't need reactivity.

### CSS Modules + CSS custom properties — no utility framework

Styling follows the project's established convention: one `.module.css` file per component, with design tokens (colors, status colors, tag colors) defined as CSS variables in `src/styles/variables.css`. This keeps component styles self-contained and avoids the specificity conflicts and global-class pollution that come with utility frameworks. It also reflects real-world RAVN project conventions.

### React Context + `useReducer` — no external state library

Global client-side UI state (modal open/closed, which task is being edited) is managed with a single `TasksUIContext` backed by `useReducer`. Apollo's `InMemoryCache` already owns server state (tasks, users, profile), so the only client-only state is the modal. Using Context + `useReducer` directly demonstrates hooks proficiency without reaching for Redux or Zustand for a problem that doesn't warrant them.

### Enum mirroring as `const` objects

GraphQL enums are mirrored in `src/features/tasks/types.ts` as TypeScript `const` objects with a companion union type (e.g., `export const Status = { BACKLOG: 'BACKLOG', ... } as const; export type Status = ...`). This lets components reference `Status.BACKLOG` as a typed constant rather than bare strings, without requiring a codegen step.

### URL-driven search with `useDebounce`

The search term is stored in the URL as `?q=` rather than in component state. This gives back/forward navigation and allows sharing a filtered view via URL. `useTasks` reads `?q=` with `useSearchParams`, passes it through a 300 ms `useDebounce`, and sends it as `FilterTaskInput.name` to GraphQL. The Header writes to the URL independently, so the hook and the input are decoupled.

### `refetchQueries` for mutation consistency

All three mutations (create, update, delete) call `refetchQueries: [GET_TASKS]` on completion. This re-fetches the task list from the server and ensures the board always reflects authoritative server state, rather than relying on manual cache updates that could diverge.

---

## Schema / Design Mismatches

These are intentional divergences from the Figma mockup or API spec, documented here as required by the challenge brief.

### 1. Board has 5 columns, not 3

The Board View mockup shows only three columns ("Working", "In Progress", "Completed"). The API's `Status` enum defines five values: `BACKLOG`, `TODO`, `IN_PROGRESS`, `DONE`, `CANCELLED`. The app renders all five columns, matching the real data model. Colors for `BACKLOG` and `CANCELLED` are not present in any mockup and were invented to complete the token set (see `variables.css`).

### 2. Profile page shows `type` instead of "Position"

The challenge brief's Phase 6 asks for a "Position" field on the profile page. The `User` type in the schema has no such field — it only exposes `id`, `fullName`, `email`, `avatar`, `type`, `createdAt`, and `updatedAt`. The profile page shows `type` (`ADMIN` or `CANDIDATE`) in the position slot as the closest available field.

### 3. New task status defaults to `BACKLOG`

`CreateTaskInput` requires a `status` field, but the Add Task modal mockup does not show a status selector. New tasks default to `BACKLOG`. The status can be changed via the Edit modal after creation.

### 4. DiceBear avatar URLs normalized to v9

The API returns avatar URLs in the legacy DiceBear v7 format (`avatars.dicebear.com/api/…`). These resolve to a redirect but degrade gracefully in some environments. `src/lib/avatar.ts` exports a `normalizeAvatarUrl()` utility that rewrites them to the current v9 API format (`api.dicebear.com/9.x/…`) before they are passed to `<img>` elements.
