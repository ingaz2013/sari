CREATE TABLE `trySariAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(255) NOT NULL,
	`messageCount` int NOT NULL DEFAULT 0,
	`exampleUsed` varchar(255),
	`convertedToSignup` boolean NOT NULL DEFAULT false,
	`signupPromptShown` boolean NOT NULL DEFAULT false,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trySariAnalytics_id` PRIMARY KEY(`id`)
);
