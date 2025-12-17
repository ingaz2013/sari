CREATE TABLE `google_oauth_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` varchar(500) NOT NULL,
	`clientSecret` varchar(500) NOT NULL,
	`is_enabled` tinyint NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `google_oauth_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `google_oauth_settings_clientId_unique` UNIQUE(`clientId`)
);
