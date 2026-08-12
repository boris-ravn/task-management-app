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

   Copy `.env.example` to `.env` at the project root and fill in both values:

   ```bash
   cp .env.example .env
   ```

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

## Deployment

The app is a static SPA. `npm run build` type-checks and emits `dist/`.

```bash
npm run build
```

Set `VITE_GRAPHQL_ENDPOINT` and `VITE_GRAPHQL_TOKEN` in the host's environment-variable settings. Both are inlined into the bundle at build time, so the host must have them **before** the build runs, and the token is visible to anyone who opens devtools — it is a scoped challenge credential, not a secret.

### Why `vercel.json` is required

Routing uses `BrowserRouter`, so `/tasks` and `/profile` are real URL paths rather than hash fragments. Client-side navigation works because React Router intercepts it, but a **hard reload or a directly pasted link is a genuine HTTP request** for a path that has no file on disk — only `index.html` exists. Without a rewrite rule the host returns its own 404 and the app never boots (which also means the `path="*"` route can never render `NotFoundPage`).

`vercel.json` tells Vercel to serve `index.html` for every unmatched path, letting the router resolve it on the client:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Note that `npm run dev` and `npm run preview` both ship this fallback in their own middleware, so the failure only ever appears on a real static host — it cannot be reproduced locally. Another host needs its own equivalent (`_redirects` on Netlify, `try_files` on nginx).

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
- **Success/failure notifications** — every create, update and delete reports its outcome as a toast; failures also go to an error-logging service
- **Empty state** — an empty board distinguishes "no tasks yet" from "no tasks match your search"

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
│   └── ui/
│       ├── Toast/      # ToastContainer (renders the notification queue)
│       └── icons/      # SVG icon components
├── context/
│   └── ToastContext/   # App-level notification state + reducer
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
│   ├── avatar.ts       # DiceBear URL normalization
│   ├── date.ts         # Calendar-date parsing and formatting
│   └── error-logger.ts # Mocked error-reporting service
├── pages/              # DashboardPage, TasksPage, ProfilePage, NotFoundPage
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

### Error handling — `try`/`catch` at call sites, not `onError` in the hooks

Apollo's `useMutation` accepts an `onError` option, which would centralise error handling inside `useCreateTask`/`useUpdateTask`/`useDeleteTask`. It is deliberately not used: supplying `onError` stops the mutate function from rejecting, so `await createTask(...)` would resolve even on failure and the modal would close as if the save had succeeded. Keeping the rejection and catching it at the call site preserves the rule that matters — **close only on success**. On failure the modal and the delete dialog stay open with the user's input intact, and a toast explains why.

### Toast context exposes callbacks, not `dispatch`

`TasksUIContext` exposes its raw `dispatch`. `ToastContext` instead exposes `showToast(variant, message)` and `dismissToast(id)`. The reason is that each toast needs a unique id, and generating one inside the reducer would make it impure. The id is generated in the provider from a `useRef` counter, so the reducer stays a pure function of `(state, action)` and call sites never deal with ids.

### Error logging as a swappable service

`src/lib/error-logger.ts` collects failures into an in-memory array and mirrors them to `console.error` in development. The array stands in for a real transport (Sentry, Datadog) — replacing it is a change to that one file, with no edits at any call site. `getLoggedErrors()` also lets tests assert that a failure was reported without spying on `console`.

### Enum mirroring as `const` objects

GraphQL enums are mirrored in `src/features/tasks/types.ts` as TypeScript `const` objects with a companion union type (e.g., `export const Status = { BACKLOG: 'BACKLOG', ... } as const; export type Status = ...`). This lets components reference `Status.BACKLOG` as a typed constant rather than bare strings, without requiring a codegen step.

### URL-driven search with `useDebounce`

The search term is stored in the URL as `?q=` rather than in component state. This gives back/forward navigation and allows sharing a filtered view via URL. `useTasks` reads `?q=` with `useSearchParams`, passes it through a 300 ms `useDebounce`, and sends it as `FilterTaskInput.name` to GraphQL. The Header writes to the URL independently, so the hook and the input are decoupled.

### Cache strategy: eviction for delete, refetch for create and update

`InMemoryCache` stores **one task list per filter**. Typing two search terms leaves three separate lists in `ROOT_QUERY`, all pointing at the same normalized `Task:<id>` entities:

```
tasks({"input":{}})                  → 9 refs
tasks({"input":{"name":"Ticket1"}})  → 1 ref
tasks({"input":{"name":"Ticket"}})   → 8 refs
```

That structure decides the strategy, because the three mutations are not equivalent:

**Update needs no cache work at all.** `UPDATE_TASK` returns the full task, so normalization writes the entity once and every cached list sees the new field values immediately. Only changes to list *membership* are a problem.

**Delete evicts the entity** (`useDeleteTask.ts`). One call removes it from every cached list at once, because Apollo filters unreadable references out of array results on read. No per-list logic, and no refetch:

```ts
update: (cache) => {
  cache.evict({ id: cache.identify({ __typename: 'Task', id }) });
}
```

Paired with an `optimisticResponse`, the card disappears in well under 100 ms — verified — and Apollo rolls the eviction back automatically if the mutation fails, so the card reappears alongside the error toast.

Two non-obvious details this relies on:

- **`__typename: 'Task'` is mandatory in the optimistic response.** `DELETE_TASK` selects only `id`; Apollo injects `__typename` into the *server's* selection set, but a hand-written optimistic object gets no such treatment, and without it the write is never normalized and the eviction silently matches nothing.
- **No `cache.gc()`.** The familiar docs snippet pairs `evict` with `gc`, but `gc()` always deletes from the root cache layer (`while (root instanceof Layer) root = root.parent`), so calling it during the optimistic pass makes deletions that a rollback cannot undo. It is only safe *after* the mutation settles. Skipping it can leave an orphaned `User` entity, which is a bounded memory nicety, not a correctness issue.

**Create and update keep `refetchQueries: [GET_TASKS]`.** Inserting into a *filtered* list would mean reimplementing the server's filter predicate on the client — deciding whether a new task matches `{"name":"Ticket"}` — which is exactly the kind of client/server divergence manual cache writes are criticised for.

**The list query revalidates.** `refetchQueries` only refreshes queries with an active observer, so a create during an active search left other cached lists stale, and the default `cache-first` policy served them indefinitely. `useTasks` therefore sets `fetchPolicy: 'cache-and-network'`: cached data paints instantly, then the query revalidates. Preferred over `refetchQueries: 'all'`, which would re-fetch every cached query — including `profile` and every accumulated search variant — growing without bound as the user types.

This is why `DashboardPage` guards on `loading && tasks.length === 0` rather than `loading` alone. Under `cache-and-network`, `loading` is also true during background revalidation, when there is good data on screen that must not be replaced by a placeholder.

The `error` branch has no equivalent check, and that is a deliberate simplification rather than a proven invariant. Whether a failed revalidation still has data to show depends on cache warmth: within a session an errored query can report the cached list (`dataState: 'complete'`), whereas a reload with the network already broken has nothing to report at all, because `InMemoryCache` is not persisted across reloads. `errorPolicy: 'all'` does not help either way — it discards the data on network failures. `DashboardPage` therefore treats any `error` as the error state: unavoidable when the cache is cold, and in the warm case a deliberate trade of a silently stale board for an explicit message with a working retry.

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

### 5. `dueDate` is treated as a calendar date, not an instant

The API returns `dueDate` as an ISO datetime, but it means a calendar day. Parsing it with `new Date('2026-09-01')` yields **midnight UTC**, which is the previous day in any negative-offset timezone — a task due today would render as overdue, and "TODAY" would never appear. `src/lib/date.ts` therefore parses the date parts into the local-time `Date` constructor instead.

---

## Known gaps

Scoped out deliberately, listed so they are not mistaken for oversights:

- **Empty states are board-level only.** An individual empty column still renders a blank gap under its `(00)` badge, and the assignee dropdown renders an empty box while `GET_USERS` is in flight.
- **No error boundary.** A render-time throw still blanks the app; only async mutation failures are handled.
- **A failed background revalidation replaces the board with the error state** instead of keeping the last good list on screen. Holding it would mean caching it outside Apollo (a `keepPreviousData` pattern).
- **No CI.** Tests must be run manually before pushing.
- **Only the `name` filter is implemented** of the six the brief lists.
- **Create and update are not optimistic.** They still wait for the server round-trip, and a task created while a search is active can briefly be missing from the unfiltered list until `cache-and-network` revalidates it. Delete is the only mutation with instant feedback.
