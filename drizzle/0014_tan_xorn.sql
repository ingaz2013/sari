CREATE TABLE `whatsapp_instances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`instance_id` varchar(255) NOT NULL,
	`token` text NOT NULL,
	`api_url` varchar(255) DEFAULT 'https://api.green-api.com',
	`phone_number` varchar(20),
	`webhook_url` text,
	`status` enum('active','inactive','pending','expired') NOT NULL DEFAULT 'pending',
	`is_primary` boolean NOT NULL DEFAULT false,
	`last_sync_at` timestamp,
	`connected_at` timestamp,
	`expires_at` timestamp,
	`metadata` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whatsapp_instances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `whatsapp_instances` ADD CONSTRAINT `whatsapp_instances_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;