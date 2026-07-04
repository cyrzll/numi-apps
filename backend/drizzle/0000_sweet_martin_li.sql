CREATE TABLE `inventories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`item_id` varchar(50) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	CONSTRAINT `inventories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kancil_status` (
	`user_id` varchar(36) NOT NULL,
	`level` int NOT NULL DEFAULT 1,
	`xp` int NOT NULL DEFAULT 0,
	`hunger` int NOT NULL DEFAULT 30,
	`happiness` int NOT NULL DEFAULT 80,
	`energy` int NOT NULL DEFAULT 80,
	`health` int NOT NULL DEFAULT 100,
	`coins` int NOT NULL DEFAULT 100,
	`is_sleeping` int NOT NULL DEFAULT 0,
	CONSTRAINT `kancil_status_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subject` varchar(50) NOT NULL,
	`level_min` int NOT NULL DEFAULT 1,
	`question_text` text NOT NULL,
	`options` text NOT NULL,
	`correct_option_index` int NOT NULL,
	`reward_coins` int NOT NULL DEFAULT 10,
	`reward_xp` int NOT NULL DEFAULT 20,
	CONSTRAINT `quiz_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_progress` (
	`user_id` varchar(36) NOT NULL,
	`current_world_id` int NOT NULL DEFAULT 1,
	`unlocked_worlds` text NOT NULL,
	`completed_stories` text NOT NULL,
	CONSTRAINT `user_progress_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`username` varchar(50) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` varchar(20) NOT NULL DEFAULT 'user',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
ALTER TABLE `inventories` ADD CONSTRAINT `inventories_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kancil_status` ADD CONSTRAINT `kancil_status_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_progress` ADD CONSTRAINT `user_progress_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;