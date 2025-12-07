CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referralCodeId` int NOT NULL,
	`referredPhone` varchar(20) NOT NULL,
	`referredName` varchar(255) NOT NULL,
	`orderCompleted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `referral_codes` ADD `referrerPhone` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `referral_codes` ADD `referrerName` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `referral_codes` ADD `rewardGiven` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `referral_codes` DROP COLUMN `customerId`;--> statement-breakpoint
ALTER TABLE `referral_codes` DROP COLUMN `discountValue`;--> statement-breakpoint
ALTER TABLE `referral_codes` DROP COLUMN `rewardValue`;--> statement-breakpoint
ALTER TABLE `referral_codes` DROP COLUMN `maxReferrals`;--> statement-breakpoint
ALTER TABLE `referral_codes` DROP COLUMN `totalRewards`;