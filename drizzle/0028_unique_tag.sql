CREATE TABLE `quick_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`trigger` varchar(255) NOT NULL,
	`keywords` text,
	`response` text NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`priority` int NOT NULL DEFAULT 0,
	`use_count` int NOT NULL DEFAULT 0,
	`last_used_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quick_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sari_personality_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchant_id` int NOT NULL,
	`tone` enum('friendly','professional','casual','enthusiastic') NOT NULL DEFAULT 'friendly',
	`style` enum('saudi_dialect','formal_arabic','english','bilingual') NOT NULL DEFAULT 'saudi_dialect',
	`emoji_usage` enum('none','minimal','moderate','frequent') NOT NULL DEFAULT 'moderate',
	`custom_instructions` text,
	`brand_voice` text,
	`max_response_length` int NOT NULL DEFAULT 200,
	`response_delay` int NOT NULL DEFAULT 2,
	`custom_greeting` text,
	`custom_farewell` text,
	`recommendation_style` enum('direct','consultative','enthusiastic') NOT NULL DEFAULT 'consultative',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sari_personality_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `sari_personality_settings_merchant_id_unique` UNIQUE(`merchant_id`)
);
--> statement-breakpoint
CREATE TABLE `sentiment_analysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`message_id` int NOT NULL,
	`conversation_id` int NOT NULL,
	`sentiment` enum('positive','negative','neutral','angry','happy','sad','frustrated') NOT NULL,
	`confidence` int NOT NULL,
	`keywords` text,
	`reasoning` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sentiment_analysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `quick_responses` ADD CONSTRAINT `quick_responses_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sari_personality_settings` ADD CONSTRAINT `sari_personality_settings_merchant_id_merchants_id_fk` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sentiment_analysis` ADD CONSTRAINT `sentiment_analysis_message_id_messages_id_fk` FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sentiment_analysis` ADD CONSTRAINT `sentiment_analysis_conversation_id_conversations_id_fk` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE cascade ON UPDATE no action;