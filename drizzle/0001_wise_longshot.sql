CREATE TABLE `qr_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`qrDataUrl` text,
	`qrSvg` text,
	`downloadCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `qr_codes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `qr_codes` ADD CONSTRAINT `qr_codes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;