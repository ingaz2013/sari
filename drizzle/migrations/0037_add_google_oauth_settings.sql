-- Add google_oauth_settings table
CREATE TABLE `google_oauth_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` varchar(500) NOT NULL,
	`clientSecret` varchar(500) NOT NULL,
	`isEnabled` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `google_oauth_settings_id` PRIMARY KEY (`id`),
	CONSTRAINT `google_oauth_settings_clientId_unique` UNIQUE KEY (`clientId`)
);
