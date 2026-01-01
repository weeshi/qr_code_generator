CREATE TABLE `user_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`permissionType` enum('create_qr','scan','export','share','analytics') NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`grantedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`grantedBy` int,
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user_permissions` ADD CONSTRAINT `user_permissions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_permissions` ADD CONSTRAINT `user_permissions_grantedBy_users_id_fk` FOREIGN KEY (`grantedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;