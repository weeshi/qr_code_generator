CREATE TABLE `scan_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`scannedData` text NOT NULL,
	`dataType` varchar(50),
	`scannedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scan_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `scan_history` ADD CONSTRAINT `scan_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;