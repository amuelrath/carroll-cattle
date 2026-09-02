CREATE TABLE `actions` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`jobId` integer NOT NULL,
	`startedAt` integer NOT NULL,
	`completedAt` integer,
	CONSTRAINT `fk_actions_jobId_jobs_id_fk` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`processId` integer NOT NULL,
	`startedAt` integer NOT NULL,
	`completedAt` integer,
	CONSTRAINT `fk_jobs_processId_processes_id_fk` FOREIGN KEY (`processId`) REFERENCES `processes`(`id`)
);
--> statement-breakpoint
CREATE TABLE `processes` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`desc` text NOT NULL
);
