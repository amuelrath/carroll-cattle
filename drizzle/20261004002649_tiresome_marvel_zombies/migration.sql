CREATE TABLE `fileRows`
(
    `fileId` integer NOT NULL,
    `rowIdx` integer NOT NULL,
    `json`   text    NOT NULL,
    CONSTRAINT `fileRows_pk` PRIMARY KEY (`fileId`, `rowIdx`),
    CONSTRAINT `fk_fileRows_fileId_files_id_fk` FOREIGN KEY (`fileId`) REFERENCES `files` (`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `files`
(
    `id`         integer PRIMARY KEY AUTOINCREMENT,
    `fileName`   text    NOT NULL,
    `sheetName`  text    NOT NULL,
    `uploadedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `jobs`
(
    `id`          integer PRIMARY KEY AUTOINCREMENT,
    `status`      text DEFAULT 'inactive' NOT NULL,
    `processId`   text                    NOT NULL,
    `fileId`      integer                 NOT NULL,
    `createdAt`   integer                 NOT NULL,
    `startedAt`   integer,
    `completedAt` integer,
    CONSTRAINT `fk_jobs_processId_processes_id_fk` FOREIGN KEY (`processId`) REFERENCES `processes` (`id`),
    CONSTRAINT `fk_jobs_fileId_files_id_fk` FOREIGN KEY (`fileId`) REFERENCES `files` (`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `processes`
(
    `id`   text PRIMARY KEY,
    `name` text NOT NULL,
    `desc` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `taskIssues`
(
    `taskId`    integer PRIMARY KEY,
    `imgBase64` text NOT NULL,
    `desc`      text NOT NULL,
    `createdAt` integer,
    CONSTRAINT `fk_taskIssues_taskId_tasks_id_fk` FOREIGN KEY (`taskId`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `taskProofs`
(
    `taskId`    integer PRIMARY KEY,
    `imgBase64` text NOT NULL,
    `createdAt` integer,
    CONSTRAINT `fk_taskProofs_taskId_tasks_id_fk` FOREIGN KEY (`taskId`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `tasks`
(
    `id`          integer PRIMARY KEY AUTOINCREMENT,
    `jobId`       integer                NOT NULL,
    `fileId`      integer                NOT NULL,
    `rowIdx`      integer                NOT NULL,
    `createdAt`   integer                NOT NULL,
    `status`      text DEFAULT 'notDone' NOT NULL,
    `startedAt`   integer,
    `completedAt` integer,
    CONSTRAINT `fk_tasks_jobId_jobs_id_fk` FOREIGN KEY (`jobId`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_tasks_fileId_files_id_fk` FOREIGN KEY (`fileId`) REFERENCES `files` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_tasks_fileId_rowIdx_fileRows_fileId_rowIdx_fk` FOREIGN KEY (`fileId`, `rowIdx`) REFERENCES `fileRows` (`fileId`, `rowIdx`)
);
