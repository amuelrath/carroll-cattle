# `schema.ts`

> Defines the sqlite database schema.

## Tables

### `processes`

- seeded values only.
- represents one business process to be automated by a playwright bot.

### `jobs`

- when a user starts a process, a `job` is created to track its completion and is visible in history.

### `actions`

- an individual action that a playwright bot takes while engaging in a specific `process`.
- created before starting the action. marked complete when done.
