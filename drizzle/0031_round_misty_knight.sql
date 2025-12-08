CREATE TABLE `password_reset_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`attempted_at` timestamp NOT NULL DEFAULT (now()),
	`ip_address` varchar(45),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `password_reset_attempts_id` PRIMARY KEY(`id`)
);
