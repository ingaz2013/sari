CREATE TABLE `competitor_analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` varchar(500) NOT NULL,
	`industry` varchar(100),
	`overall_score` int NOT NULL DEFAULT 0,
	`seo_score` int NOT NULL DEFAULT 0,
	`performance_score` int NOT NULL DEFAULT 0,
	`ux_score` int NOT NULL DEFAULT 0,
	`content_score` int NOT NULL DEFAULT 0,
	`avg_price` decimal(10,2),
	`min_price` decimal(10,2),
	`max_price` decimal(10,2),
	`currency` varchar(10) DEFAULT 'SAR',
	`product_count` int NOT NULL DEFAULT 0,
	`strengths` text,
	`weaknesses` text,
	`opportunities` text,
	`status` enum('pending','analyzing','completed','failed') NOT NULL DEFAULT 'pending',
	`error_message` text,
	`analyzed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `competitor_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`competitor_id` int NOT NULL,
	`merchant_id` int NOT NULL,
	`name` varchar(500) NOT NULL,
	`description` text,
	`price` decimal(10,2),
	`currency` varchar(10) DEFAULT 'SAR',
	`image_url` varchar(500),
	`product_url` varchar(500),
	`category` varchar(255),
	`similar_to_merchant_product` int,
	`price_difference` decimal(10,2),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `extracted_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysis_id` int NOT NULL,
	`merchant_id` int NOT NULL,
	`name` varchar(500) NOT NULL,
	`description` text,
	`price` decimal(10,2),
	`currency` varchar(10) DEFAULT 'SAR',
	`image_url` varchar(500),
	`product_url` varchar(500),
	`category` varchar(255),
	`tags` text,
	`in_stock` tinyint NOT NULL DEFAULT 1,
	`stock_quantity` int,
	`ai_extracted` tinyint NOT NULL DEFAULT 1,
	`confidence` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `website_analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`url` varchar(500) NOT NULL,
	`title` varchar(500),
	`description` text,
	`industry` varchar(100),
	`language` varchar(10),
	`seo_score` int NOT NULL DEFAULT 0,
	`seo_issues` text,
	`meta_tags` text,
	`performance_score` int NOT NULL DEFAULT 0,
	`load_time` int,
	`page_size` int,
	`ux_score` int NOT NULL DEFAULT 0,
	`mobile_optimized` tinyint NOT NULL DEFAULT 0,
	`has_contact_info` tinyint NOT NULL DEFAULT 0,
	`has_whatsapp` tinyint NOT NULL DEFAULT 0,
	`content_quality` int NOT NULL DEFAULT 0,
	`word_count` int NOT NULL DEFAULT 0,
	`image_count` int NOT NULL DEFAULT 0,
	`video_count` int NOT NULL DEFAULT 0,
	`overall_score` int NOT NULL DEFAULT 0,
	`status` enum('pending','analyzing','completed','failed') NOT NULL DEFAULT 'pending',
	`error_message` text,
	`analyzed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `website_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysis_id` int NOT NULL,
	`merchant_id` int NOT NULL,
	`category` enum('seo','performance','ux','content','marketing','security') NOT NULL,
	`type` enum('strength','weakness','opportunity','threat','recommendation') NOT NULL,
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`title` varchar(500) NOT NULL,
	`description` text NOT NULL,
	`recommendation` text,
	`impact` text,
	`ai_generated` tinyint NOT NULL DEFAULT 1,
	`confidence` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE `competitor_analyses` ADD CONSTRAINT `competitor_analyses_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `competitor_products` ADD CONSTRAINT `competitor_products_competitor_id_competitor_analyses_id_fk` FOREIGN KEY (`competitor_id`) REFERENCES `competitor_analyses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `competitor_products` ADD CONSTRAINT `competitor_products_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `competitor_products` ADD CONSTRAINT `competitor_products_similar_to_merchant_product_products_id_fk` FOREIGN KEY (`similar_to_merchant_product`) REFERENCES `products`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `extracted_products` ADD CONSTRAINT `extracted_products_analysis_id_website_analyses_id_fk` FOREIGN KEY (`analysis_id`) REFERENCES `website_analyses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `extracted_products` ADD CONSTRAINT `extracted_products_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `website_analyses` ADD CONSTRAINT `website_analyses_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `website_insights` ADD CONSTRAINT `website_insights_analysis_id_website_analyses_id_fk` FOREIGN KEY (`analysis_id`) REFERENCES `website_analyses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `website_insights` ADD CONSTRAINT `website_insights_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `competitor_analyses_merchant_id_idx` ON `competitor_analyses` (`merchant_id`);--> statement-breakpoint
CREATE INDEX `competitor_analyses_url_idx` ON `competitor_analyses` (`url`);--> statement-breakpoint
CREATE INDEX `competitor_products_competitor_id_idx` ON `competitor_products` (`competitor_id`);--> statement-breakpoint
CREATE INDEX `competitor_products_merchant_id_idx` ON `competitor_products` (`merchant_id`);--> statement-breakpoint
CREATE INDEX `extracted_products_analysis_id_idx` ON `extracted_products` (`analysis_id`);--> statement-breakpoint
CREATE INDEX `extracted_products_merchant_id_idx` ON `extracted_products` (`merchant_id`);--> statement-breakpoint
CREATE INDEX `website_analyses_merchant_id_idx` ON `website_analyses` (`merchant_id`);--> statement-breakpoint
CREATE INDEX `website_analyses_url_idx` ON `website_analyses` (`url`);--> statement-breakpoint
CREATE INDEX `website_insights_analysis_id_idx` ON `website_insights` (`analysis_id`);--> statement-breakpoint
CREATE INDEX `website_insights_merchant_id_idx` ON `website_insights` (`merchant_id`);--> statement-breakpoint
CREATE INDEX `website_insights_category_idx` ON `website_insights` (`category`);