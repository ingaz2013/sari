CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`customer_phone` varchar(20) NOT NULL,
	`customer_name` varchar(255),
	`service_id` int NOT NULL,
	`staff_id` int,
	`appointment_date` timestamp NOT NULL,
	`start_time` varchar(5) NOT NULL,
	`end_time` varchar(5) NOT NULL,
	`status` enum('pending','confirmed','cancelled','completed','no_show') NOT NULL DEFAULT 'pending',
	`google_event_id` varchar(255),
	`reminder_24h_sent` tinyint NOT NULL DEFAULT 0,
	`reminder_1h_sent` tinyint NOT NULL DEFAULT 0,
	`notes` text,
	`cancellation_reason` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `business_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessType` enum('store','services','both') NOT NULL,
	`template_name` varchar(255) NOT NULL,
	`icon` varchar(50),
	`services` text,
	`products` text,
	`working_hours` text,
	`bot_personality` text,
	`settings` text,
	`description` text,
	`suitable_for` text,
	`is_active` tinyint NOT NULL DEFAULT 1,
	`usage_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `business_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `google_integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`integration_type` enum('calendar','sheets') NOT NULL,
	`credentials` text,
	`calendar_id` varchar(255),
	`sheet_id` varchar(255),
	`is_active` tinyint NOT NULL DEFAULT 1,
	`last_sync` timestamp,
	`settings` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `google_integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_packages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`service_ids` text,
	`original_price` int,
	`package_price` int,
	`discount_percentage` int,
	`is_active` tinyint NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `service_packages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`service_id` int NOT NULL,
	`customer_phone` varchar(20) NOT NULL,
	`customer_name` varchar(255),
	`rating` int NOT NULL,
	`comment` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `service_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`price_type` enum('fixed','variable','custom') NOT NULL DEFAULT 'fixed',
	`base_price` int,
	`min_price` int,
	`max_price` int,
	`duration_minutes` int NOT NULL,
	`buffer_time_minutes` int NOT NULL DEFAULT 0,
	`requires_appointment` tinyint NOT NULL DEFAULT 1,
	`max_bookings_per_day` int,
	`advance_booking_days` int NOT NULL DEFAULT 30,
	`staff_ids` text,
	`is_active` tinyint NOT NULL DEFAULT 1,
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `setup_wizard_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`current_step` int NOT NULL DEFAULT 1,
	`completed_steps` text,
	`wizard_data` text,
	`is_completed` tinyint NOT NULL DEFAULT 0,
	`completed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `setup_wizard_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `setup_wizard_progress_merchant_id_unique` UNIQUE(`merchant_id`)
);
--> statement-breakpoint
CREATE TABLE `staff_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(20),
	`email` varchar(255),
	`role` varchar(100),
	`working_hours` text,
	`is_active` tinyint NOT NULL DEFAULT 1,
	`google_calendar_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `staff_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `merchants` ADD `businessType` enum('store','services','both');--> statement-breakpoint
ALTER TABLE `merchants` ADD `setupCompleted` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `merchants` ADD `setupCompletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `merchants` ADD `address` varchar(500);--> statement-breakpoint
ALTER TABLE `merchants` ADD `description` text;--> statement-breakpoint
ALTER TABLE `merchants` ADD `workingHoursType` enum('24_7','weekdays','custom') DEFAULT 'weekdays';--> statement-breakpoint
ALTER TABLE `merchants` ADD `workingHours` text;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_service_id_services_id_fk` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_staff_id_staff_members_id_fk` FOREIGN KEY (`staff_id`) REFERENCES `staff_members`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `google_integrations` ADD CONSTRAINT `google_integrations_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `service_packages` ADD CONSTRAINT `service_packages_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `service_reviews` ADD CONSTRAINT `service_reviews_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `service_reviews` ADD CONSTRAINT `service_reviews_service_id_services_id_fk` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `services` ADD CONSTRAINT `services_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `setup_wizard_progress` ADD CONSTRAINT `setup_wizard_progress_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `staff_members` ADD CONSTRAINT `staff_members_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;