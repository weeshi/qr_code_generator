CREATE TABLE `points_adjustments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`adminId` int NOT NULL,
	`pointsAdjusted` int NOT NULL,
	`reason` text NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `points_adjustments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `points_rates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actionType` enum('qr_created','qr_scanned','file_uploaded','referral','signup_bonus','daily_login','profile_complete') NOT NULL,
	`pointsValue` int NOT NULL DEFAULT 0,
	`description` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `points_rates_id` PRIMARY KEY(`id`),
	CONSTRAINT `points_rates_actionType_unique` UNIQUE(`actionType`)
);
--> statement-breakpoint
CREATE TABLE `points_statistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`totalPointsDistributed` int NOT NULL DEFAULT 0,
	`totalPointsRedeemed` int NOT NULL DEFAULT 0,
	`activeUsersWithPoints` int NOT NULL DEFAULT 0,
	`averagePointsPerUser` int NOT NULL DEFAULT 0,
	`topTierCount` int NOT NULL DEFAULT 0,
	`lastUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `points_statistics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `points_adjustments` ADD CONSTRAINT `points_adjustments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `points_adjustments` ADD CONSTRAINT `points_adjustments_adminId_users_id_fk` FOREIGN KEY (`adminId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;