ALTER TABLE `messages` ADD `aiResponse` text;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `aiwResponse`;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `isFromCustomer`;