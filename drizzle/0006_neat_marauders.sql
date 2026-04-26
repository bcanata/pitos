ALTER TABLE `messages` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `messages` ADD `deleted_by_user_id` text REFERENCES users(id);