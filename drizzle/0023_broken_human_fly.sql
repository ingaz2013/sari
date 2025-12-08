ALTER TABLE `testDeals` DROP INDEX `testDeals_conversationId_unique`;--> statement-breakpoint
ALTER TABLE `testDeals` MODIFY COLUMN `conversationId` int;