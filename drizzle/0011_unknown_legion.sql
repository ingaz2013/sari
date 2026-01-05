CREATE TABLE `discovered_pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`page_type` enum('about','shipping','returns','faq','contact','privacy','terms','other') NOT NULL,
	`title` varchar(500),
	`url` varchar(1000) NOT NULL,
	`content` text,
	`is_active` tinyint NOT NULL DEFAULT 1,
	`use_in_bot` tinyint NOT NULL DEFAULT 1,
	`discovered_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `extracted_faqs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`page_id` int,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`category` varchar(255),
	`is_active` tinyint NOT NULL DEFAULT 1,
	`use_in_bot` tinyint NOT NULL DEFAULT 1,
	`priority` int NOT NULL DEFAULT 0,
	`usage_count` int NOT NULL DEFAULT 0,
	`last_used_at` timestamp,
	`extracted_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE `merchants` ADD `website_url` varchar(500);--> statement-breakpoint
ALTER TABLE `merchants` ADD `platform_type` enum('salla','zid','shopify','woocommerce','custom','unknown');--> statement-breakpoint
ALTER TABLE `merchants` ADD `last_analysis_date` timestamp;--> statement-breakpoint
ALTER TABLE `merchants` ADD `analysis_status` enum('pending','analyzing','completed','failed') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `discovered_pages` ADD CONSTRAINT `discovered_pages_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `extracted_faqs` ADD CONSTRAINT `extracted_faqs_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `extracted_faqs` ADD CONSTRAINT `extracted_faqs_page_id_discovered_pages_id_fk` FOREIGN KEY (`page_id`) REFERENCES `discovered_pages`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `discovered_pages_merchant_id_idx` ON `discovered_pages` (`merchant_id`);--> statement-breakpoint
CREATE INDEX `discovered_pages_page_type_idx` ON `discovered_pages` (`page_type`);--> statement-breakpoint
CREATE INDEX `extracted_faqs_merchant_id_idx` ON `extracted_faqs` (`merchant_id`);--> statement-breakpoint
CREATE INDEX `extracted_faqs_category_idx` ON `extracted_faqs` (`category`);--> statement-breakpoint
CREATE INDEX `extracted_faqs_page_id_idx` ON `extracted_faqs` (`page_id`);