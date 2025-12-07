CREATE TABLE `notification_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`status` varchar(50) NOT NULL,
	`template` text NOT NULL,
	`enabled` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `notification_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`merchant_id` int NOT NULL,
	`customer_phone` varchar(20) NOT NULL,
	`status` varchar(50) NOT NULL,
	`message` text NOT NULL,
	`sent` boolean DEFAULT false,
	`sent_at` timestamp,
	`error` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `order_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `notification_templates` ADD CONSTRAINT `notification_templates_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_notifications` ADD CONSTRAINT `order_notifications_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_notifications` ADD CONSTRAINT `order_notifications_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;