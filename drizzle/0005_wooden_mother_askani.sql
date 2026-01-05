CREATE TABLE `booking_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`booking_id` int NOT NULL,
	`service_id` int NOT NULL,
	`staff_id` int,
	`customer_phone` varchar(20) NOT NULL,
	`customer_name` varchar(255),
	`overall_rating` int NOT NULL,
	`service_quality` int,
	`professionalism` int,
	`value_for_money` int,
	`comment` text,
	`is_public` tinyint NOT NULL DEFAULT 1,
	`is_verified` tinyint NOT NULL DEFAULT 1,
	`merchant_reply` text,
	`replied_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `booking_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `booking_time_slots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`service_id` int NOT NULL,
	`staff_id` int,
	`slot_date` date NOT NULL,
	`start_time` varchar(5) NOT NULL,
	`end_time` varchar(5) NOT NULL,
	`is_available` tinyint NOT NULL DEFAULT 1,
	`is_blocked` tinyint NOT NULL DEFAULT 0,
	`block_reason` text,
	`max_bookings` int NOT NULL DEFAULT 1,
	`current_bookings` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `booking_time_slots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`service_id` int NOT NULL,
	`customer_phone` varchar(20) NOT NULL,
	`customer_name` varchar(255),
	`customer_email` varchar(255),
	`staff_id` int,
	`booking_date` date NOT NULL,
	`start_time` varchar(5) NOT NULL,
	`end_time` varchar(5) NOT NULL,
	`duration_minutes` int NOT NULL,
	`status` enum('pending','confirmed','in_progress','completed','cancelled','no_show') NOT NULL DEFAULT 'pending',
	`payment_status` enum('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid',
	`base_price` int NOT NULL,
	`discount_amount` int NOT NULL DEFAULT 0,
	`final_price` int NOT NULL,
	`google_event_id` varchar(255),
	`reminder_24h_sent` tinyint NOT NULL DEFAULT 0,
	`reminder_1h_sent` tinyint NOT NULL DEFAULT 0,
	`notes` text,
	`cancellation_reason` text,
	`cancelled_by` enum('customer','merchant','system'),
	`booking_source` enum('whatsapp','website','phone','walk_in') NOT NULL DEFAULT 'whatsapp',
	`confirmed_at` timestamp,
	`completed_at` timestamp,
	`cancelled_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `booking_reviews` ADD CONSTRAINT `booking_reviews_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `booking_reviews` ADD CONSTRAINT `booking_reviews_booking_id_bookings_id_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `booking_reviews` ADD CONSTRAINT `booking_reviews_service_id_services_id_fk` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `booking_reviews` ADD CONSTRAINT `booking_reviews_staff_id_staff_members_id_fk` FOREIGN KEY (`staff_id`) REFERENCES `staff_members`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `booking_time_slots` ADD CONSTRAINT `booking_time_slots_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `booking_time_slots` ADD CONSTRAINT `booking_time_slots_service_id_services_id_fk` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `booking_time_slots` ADD CONSTRAINT `booking_time_slots_staff_id_staff_members_id_fk` FOREIGN KEY (`staff_id`) REFERENCES `staff_members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_service_id_services_id_fk` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_staff_id_staff_members_id_fk` FOREIGN KEY (`staff_id`) REFERENCES `staff_members`(`id`) ON DELETE set null ON UPDATE no action;