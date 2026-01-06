CREATE TABLE `template_translations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`template_id` int NOT NULL,
	`language` enum('ar','en') NOT NULL,
	`template_name` varchar(255) NOT NULL,
	`description` text,
	`suitable_for` text,
	`bot_personality` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `template_translations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `business_templates` ADD `default_language` enum('ar','en') DEFAULT 'ar' NOT NULL;--> statement-breakpoint
ALTER TABLE `template_translations` ADD CONSTRAINT `template_translations_template_id_business_templates_id_fk` FOREIGN KEY (`template_id`) REFERENCES `business_templates`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `template_translations_template_id_idx` ON `template_translations` (`template_id`);--> statement-breakpoint
CREATE INDEX `template_translations_language_idx` ON `template_translations` (`language`);