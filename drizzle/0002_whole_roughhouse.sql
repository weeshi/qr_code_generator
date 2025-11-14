ALTER TABLE `qr_codes` ADD `scanCount` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `qr_codes` ADD `lastScannedAt` timestamp;