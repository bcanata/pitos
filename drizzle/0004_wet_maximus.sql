ALTER TABLE `memberships` ADD `status` text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `memberships` ADD `approved_at` integer;--> statement-breakpoint
ALTER TABLE `memberships` ADD `approved_by_user_id` text REFERENCES users(id);