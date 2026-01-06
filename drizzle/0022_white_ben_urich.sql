CREATE TABLE `merchant_addons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`addon_id` int NOT NULL,
	`subscription_id` int,
	`quantity` int NOT NULL DEFAULT 1,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	`is_active` tinyint NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `merchant_addons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `merchant_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`plan_id` int,
	`status` enum('trial','active','expired','cancelled') NOT NULL,
	`billing_cycle` enum('monthly','yearly') NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	`trial_ends_at` timestamp,
	`auto_renew` tinyint NOT NULL DEFAULT 0,
	`cancelled_at` timestamp,
	`cancellation_reason` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `merchant_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`subscription_id` int,
	`type` enum('subscription','addon','renewal','upgrade','downgrade') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'SAR',
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`payment_method` varchar(50) NOT NULL DEFAULT 'tap',
	`tap_charge_id` varchar(255),
	`tap_response` text,
	`paid_at` timestamp,
	`refunded_at` timestamp,
	`refund_reason` text,
	`metadata` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscription_addons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_en` varchar(255) NOT NULL,
	`description` text,
	`description_en` text,
	`type` enum('extra_whatsapp','extra_customers','custom') NOT NULL,
	`monthly_price` decimal(10,2) NOT NULL,
	`yearly_price` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'SAR',
	`value` int NOT NULL,
	`is_active` tinyint NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscription_addons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscription_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_en` varchar(255) NOT NULL,
	`description` text,
	`description_en` text,
	`monthly_price` decimal(10,2) NOT NULL,
	`yearly_price` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'SAR',
	`max_customers` int NOT NULL,
	`max_whatsapp_numbers` int NOT NULL DEFAULT 1,
	`features` text,
	`is_active` tinyint NOT NULL DEFAULT 1,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscription_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tap_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`secret_key` text NOT NULL,
	`public_key` varchar(500) NOT NULL,
	`is_live` tinyint NOT NULL DEFAULT 0,
	`webhook_url` varchar(500),
	`webhook_secret` varchar(500),
	`is_active` tinyint NOT NULL DEFAULT 1,
	`last_test_at` timestamp,
	`last_test_status` enum('success','failed'),
	`last_test_message` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tap_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `merchants` ADD `current_subscription_id` int;--> statement-breakpoint
ALTER TABLE `merchants` ADD `subscription_status` enum('none','trial','active','expired') DEFAULT 'none';--> statement-breakpoint
ALTER TABLE `merchants` ADD `trial_started_at` timestamp;--> statement-breakpoint
ALTER TABLE `merchants` ADD `trial_ends_at` timestamp;--> statement-breakpoint
ALTER TABLE `merchants` ADD `max_customers_allowed` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `merchants` ADD `current_customers_count` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `merchant_addons` ADD CONSTRAINT `merchant_addons_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `merchant_addons` ADD CONSTRAINT `merchant_addons_addon_id_subscription_addons_id_fk` FOREIGN KEY (`addon_id`) REFERENCES `subscription_addons`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `merchant_addons` ADD CONSTRAINT `merchant_addons_subscription_id_merchant_subscriptions_id_fk` FOREIGN KEY (`subscription_id`) REFERENCES `merchant_subscriptions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `merchant_subscriptions` ADD CONSTRAINT `merchant_subscriptions_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `merchant_subscriptions` ADD CONSTRAINT `merchant_subscriptions_plan_id_subscription_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_transactions` ADD CONSTRAINT `payment_transactions_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_transactions` ADD CONSTRAINT `payment_transactions_subscription_id_merchant_subscriptions_id_fk` FOREIGN KEY (`subscription_id`) REFERENCES `merchant_subscriptions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `merchant_addons_merchant_id_idx` ON `merchant_addons` (`merchant_id`);--> statement-breakpoint
CREATE INDEX `merchant_addons_addon_id_idx` ON `merchant_addons` (`addon_id`);--> statement-breakpoint
CREATE INDEX `merchant_addons_subscription_id_idx` ON `merchant_addons` (`subscription_id`);--> statement-breakpoint
CREATE INDEX `merchant_addons_is_active_idx` ON `merchant_addons` (`is_active`);--> statement-breakpoint
CREATE INDEX `merchant_subscriptions_merchant_id_idx` ON `merchant_subscriptions` (`merchant_id`);--> statement-breakpoint
CREATE INDEX `merchant_subscriptions_plan_id_idx` ON `merchant_subscriptions` (`plan_id`);--> statement-breakpoint
CREATE INDEX `merchant_subscriptions_status_idx` ON `merchant_subscriptions` (`status`);--> statement-breakpoint
CREATE INDEX `merchant_subscriptions_end_date_idx` ON `merchant_subscriptions` (`end_date`);--> statement-breakpoint
CREATE INDEX `payment_transactions_merchant_id_idx` ON `payment_transactions` (`merchant_id`);--> statement-breakpoint
CREATE INDEX `payment_transactions_subscription_id_idx` ON `payment_transactions` (`subscription_id`);--> statement-breakpoint
CREATE INDEX `payment_transactions_status_idx` ON `payment_transactions` (`status`);--> statement-breakpoint
CREATE INDEX `payment_transactions_tap_charge_id_idx` ON `payment_transactions` (`tap_charge_id`);--> statement-breakpoint
CREATE INDEX `payment_transactions_type_idx` ON `payment_transactions` (`type`);--> statement-breakpoint
CREATE INDEX `subscription_addons_is_active_idx` ON `subscription_addons` (`is_active`);--> statement-breakpoint
CREATE INDEX `subscription_addons_type_idx` ON `subscription_addons` (`type`);--> statement-breakpoint
CREATE INDEX `subscription_plans_is_active_idx` ON `subscription_plans` (`is_active`);--> statement-breakpoint
CREATE INDEX `subscription_plans_sort_order_idx` ON `subscription_plans` (`sort_order`);