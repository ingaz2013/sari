CREATE TABLE `whatsapp_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`phone_number` varchar(20),
	`business_name` varchar(255),
	`status` enum('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
	`instance_id` varchar(100),
	`token` text,
	`api_url` varchar(255) DEFAULT 'https://api.green-api.com',
	`qr_code_url` text,
	`qr_code_expires_at` timestamp,
	`connected_at` timestamp,
	`reviewed_by` int,
	`reviewed_at` timestamp,
	`admin_notes` text,
	`rejection_reason` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whatsapp_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `whatsapp_requests` ADD CONSTRAINT `whatsapp_requests_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;