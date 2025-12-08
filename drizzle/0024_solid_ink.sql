CREATE TABLE `bot_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`auto_reply_enabled` boolean NOT NULL DEFAULT true,
	`working_hours_enabled` boolean NOT NULL DEFAULT false,
	`working_hours_start` varchar(5) DEFAULT '09:00',
	`working_hours_end` varchar(5) DEFAULT '18:00',
	`working_days` varchar(50) DEFAULT '1,2,3,4,5',
	`welcome_message` text,
	`out_of_hours_message` text,
	`response_delay` int DEFAULT 2,
	`max_response_length` int DEFAULT 200,
	`tone` enum('friendly','professional','casual') NOT NULL DEFAULT 'friendly',
	`language` enum('ar','en','both') NOT NULL DEFAULT 'ar',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bot_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `bot_settings_merchant_id_unique` UNIQUE(`merchant_id`)
);
--> statement-breakpoint
ALTER TABLE `bot_settings` ADD CONSTRAINT `bot_settings_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;