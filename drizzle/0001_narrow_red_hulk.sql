CREATE TABLE `translation_cache` (
	`lang` text PRIMARY KEY NOT NULL,
	`bundle` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `teams` ADD `language` text DEFAULT 'en' NOT NULL;