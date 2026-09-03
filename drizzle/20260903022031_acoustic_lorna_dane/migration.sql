CREATE TABLE `actionErrors` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`actionId` integer NOT NULL,
	`errorType` text NOT NULL,
	`message` text,
	`createdAt` integer NOT NULL,
	CONSTRAINT `fk_actionErrors_actionId_actions_id_fk` FOREIGN KEY (`actionId`) REFERENCES `actions`(`id`)
);
--> statement-breakpoint
CREATE TABLE `actions` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`jobId` integer NOT NULL,
	`fileId` integer NOT NULL,
	`rowNum` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`startedAt` integer NOT NULL,
	`completedAt` integer,
	CONSTRAINT `fk_actions_jobId_jobs_id_fk` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`),
	CONSTRAINT `fk_actions_fileId_rowNum_fileRows_fileId_rowNum_fk` FOREIGN KEY (`fileId`,`rowNum`) REFERENCES `fileRows`(`fileId`,`rowNum`)
);
--> statement-breakpoint
CREATE TABLE `fileErrors` (
	`fileId` integer NOT NULL,
	`rowNum` integer NOT NULL,
	`colName` text NOT NULL,
	`errorType` text NOT NULL,
	CONSTRAINT `fileErrors_pk` PRIMARY KEY(`fileId`, `rowNum`, `colName`),
	CONSTRAINT `fk_fileErrors_fileId_rowNum_fileRows_fileId_rowNum_fk` FOREIGN KEY (`fileId`,`rowNum`) REFERENCES `fileRows`(`fileId`,`rowNum`)
);
--> statement-breakpoint
CREATE TABLE `fileRows` (
	`fileId` integer NOT NULL,
	`rowNum` integer NOT NULL,
	`rawJson` text NOT NULL,
	`parsedJson` text NOT NULL,
	`status` text NOT NULL,
	CONSTRAINT `fileRows_pk` PRIMARY KEY(`fileId`, `rowNum`),
	CONSTRAINT `fk_fileRows_fileId_files_id_fk` FOREIGN KEY (`fileId`) REFERENCES `files`(`id`)
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`filename` text NOT NULL,
	`storagePath` text NOT NULL,
	`sha256` text NOT NULL,
	`uploadedAt` integer NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`processId` text NOT NULL,
	`fileId` integer NOT NULL,
	`startedAt` integer NOT NULL,
	`completedAt` integer,
	CONSTRAINT `fk_jobs_processId_processes_id_fk` FOREIGN KEY (`processId`) REFERENCES `processes`(`id`),
	CONSTRAINT `fk_jobs_fileId_files_id_fk` FOREIGN KEY (`fileId`) REFERENCES `files`(`id`)
);
--> statement-breakpoint
CREATE TABLE `processes` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`desc` text NOT NULL
);
