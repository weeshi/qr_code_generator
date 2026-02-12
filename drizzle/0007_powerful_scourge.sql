CREATE TABLE `loyalty_points` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalPoints` int NOT NULL DEFAULT 0,
	`availablePoints` int NOT NULL DEFAULT 0,
	`usedPoints` int NOT NULL DEFAULT 0,
	`tier` enum('bronze','silver','gold','platinum') NOT NULL DEFAULT 'bronze',
	`lastUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loyalty_points_id` PRIMARY KEY(`id`),
	CONSTRAINT `loyalty_points_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `loyalty_rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`pointsRequired` int NOT NULL,
	`rewardType` enum('discount','feature_unlock','premium_access','badge','custom') NOT NULL,
	`rewardValue` varchar(255),
	`icon` text,
	`isActive` int NOT NULL DEFAULT 1,
	`maxRedemptions` int,
	`currentRedemptions` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loyalty_rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loyalty_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`transactionType` enum('qr_created','qr_scanned','file_uploaded','referral','bonus','redeemed','expired') NOT NULL,
	`points` int NOT NULL,
	`description` text,
	`relatedId` int,
	`relatedType` varchar(50),
	`status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'completed',
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loyalty_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_redemptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`rewardId` int NOT NULL,
	`pointsSpent` int NOT NULL,
	`status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
	`redeemedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_redemptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `loyalty_points` ADD CONSTRAINT `loyalty_points_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `loyalty_transactions` ADD CONSTRAINT `loyalty_transactions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_redemptions` ADD CONSTRAINT `user_redemptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_redemptions` ADD CONSTRAINT `user_redemptions_rewardId_loyalty_rewards_id_fk` FOREIGN KEY (`rewardId`) REFERENCES `loyalty_rewards`(`id`) ON DELETE no action ON UPDATE no action;