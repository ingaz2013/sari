CREATE TABLE `notification_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`notification_key` varchar(255) NOT NULL,
	`type` varchar(100) NOT NULL,
	`message` text NOT NULL,
	`sent_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notification_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `notification_records` ADD CONSTRAINT `notification_records_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `notification_records_merchant_id_idx` ON `notification_records` (`merchant_id`);--> statement-breakpoint
CREATE INDEX `notification_records_key_idx` ON `notification_records` (`notification_key`);--> statement-breakpoint
CREATE INDEX `notification_records_type_idx` ON `notification_records` (`type`);