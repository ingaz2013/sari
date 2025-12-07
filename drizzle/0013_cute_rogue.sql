CREATE TABLE `occasion_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchantId` int NOT NULL,
	`occasionType` enum('ramadan','eid_fitr','eid_adha','national_day','new_year','hijri_new_year') NOT NULL,
	`year` int NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`discountCode` varchar(50),
	`discountPercentage` int NOT NULL DEFAULT 15,
	`messageTemplate` text,
	`sentAt` timestamp,
	`recipientCount` int NOT NULL DEFAULT 0,
	`status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `occasion_campaigns_id` PRIMARY KEY(`id`)
);
