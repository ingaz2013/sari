CREATE TABLE `platform_integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`platform_type` enum('zid','calendly','shopify','woocommerce') NOT NULL,
	`store_name` varchar(255),
	`store_url` varchar(500),
	`access_token` text,
	`refresh_token` text,
	`is_active` tinyint NOT NULL DEFAULT 1,
	`settings` text,
	`last_sync_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platform_integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `platform_integrations` ADD CONSTRAINT `platform_integrations_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;