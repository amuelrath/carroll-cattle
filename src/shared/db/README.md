# `schema.ts`

> Defines the sqlite database schema.

## Tables

### `processes`

- seeded values only.
- represents one business process to be automated by a playwright bot.

### `files`

- an uploaded spreadsheet, stored on disk at `storagePath` with its original filename and a `sha256` hash for de-duping
  re-uploads.
- `status` reflects whether every row in the file passed validation.

### `fileRows`

- one row of an uploaded file, keyed by `(fileId, rowNum)`.
- `rawJson` holds the row as originally parsed; `parsedJson` holds it after type coercion/normalization.
- `status` reflects whether that individual row passed validation.

### `fileErrors`

- a single validation failure for one column of one `fileRow`, keyed by `(fileId, rowNum, colName)`.
- created during file validation; a `fileRow` with `status: 'invalid'` should have at least one associated error here.

### `jobs`

- when a user starts a process, a `job` is created to track its completion and is visible in history.
- tied to the `process` being run and the `file` supplying its input data.

### `actions`

- an individual action that a playwright bot takes while engaging in a specific `process`, corresponding to
  one `fileRow`.
- created before starting the action, with `status: 'pending'`. Updated to `running`, then `success`/`failed`, and
  marked complete when done.

### `actionErrors`

- a failure recorded against a specific `action`, with an `errorType` category and a `message` describing what went
  wrong.
- an `action` with `status: 'failed'` should have at least one associated error here.
