CREATE TABLE `merchant_payment_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`tap_enabled` tinyint NOT NULL DEFAULT 0,
	`tap_public_key` text,
	`tap_secret_key` text,
	`tap_test_mode` tinyint NOT NULL DEFAULT 1,
	`auto_send_payment_link` tinyint NOT NULL DEFAULT 1,
	`payment_link_message` text,
	`default_currency` varchar(3) NOT NULL DEFAULT 'SAR',
	`tap_webhook_secret` text,
	`webhook_url` text,
	`is_verified` tinyint NOT NULL DEFAULT 0,
	`last_verified_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `merchant_payment_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `merchant_payment_settings_merchant_id_unique` UNIQUE(`merchant_id`)
);
--> statement-breakpoint
ALTER TABLE `merchant_payment_settings` ADD CONSTRAINT `merchant_payment_settings_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;