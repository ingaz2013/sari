ALTER TABLE `whatsapp_connection_requests` MODIFY COLUMN `status` enum('pending','approved','rejected','connected') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `whatsapp_connection_requests` ADD `instanceId` varchar(255);--> statement-breakpoint
ALTER TABLE `whatsapp_connection_requests` ADD `apiToken` varchar(255);--> statement-breakpoint
ALTER TABLE `whatsapp_connection_requests` ADD `apiUrl` varchar(255) DEFAULT 'https://api.green-api.com';--> statement-breakpoint
ALTER TABLE `whatsapp_connection_requests` ADD `connectedAt` timestamp;