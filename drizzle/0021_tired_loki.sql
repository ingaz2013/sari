ALTER TABLE `subscriptions` ADD `messagesUsed` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `lastResetAt` timestamp DEFAULT (now()) NOT NULL;