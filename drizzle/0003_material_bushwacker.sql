CREATE INDEX `agent_runs_team_created_idx` ON `agent_runs` (`team_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `channel_members_user_id_idx` ON `channel_members` (`user_id`);--> statement-breakpoint
CREATE INDEX `channel_members_channel_id_idx` ON `channel_members` (`channel_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `channel_members_channel_user_unq` ON `channel_members` (`channel_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `channels_team_id_idx` ON `channels` (`team_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `channels_team_name_active_unq` ON `channels` (`team_id`,`name`) WHERE archived_at IS NULL;--> statement-breakpoint
CREATE INDEX `decisions_team_id_idx` ON `decisions` (`team_id`);--> statement-breakpoint
CREATE INDEX `entities_team_id_idx` ON `entities` (`team_id`);--> statement-breakpoint
CREATE INDEX `exit_packs_team_id_idx` ON `exit_packs` (`team_id`);--> statement-breakpoint
CREATE INDEX `exit_packs_member_user_id_idx` ON `exit_packs` (`member_user_id`);--> statement-breakpoint
CREATE INDEX `extracted_facts_team_id_idx` ON `extracted_facts` (`team_id`);--> statement-breakpoint
CREATE INDEX `generated_documents_team_id_idx` ON `generated_documents` (`team_id`);--> statement-breakpoint
CREATE INDEX `invites_team_id_idx` ON `invites` (`team_id`);--> statement-breakpoint
CREATE INDEX `invites_email_idx` ON `invites` (`email`);--> statement-breakpoint
CREATE INDEX `judge_sessions_team_id_idx` ON `judge_sessions` (`team_id`);--> statement-breakpoint
CREATE INDEX `magic_links_email_idx` ON `magic_links` (`email`);--> statement-breakpoint
CREATE INDEX `memberships_user_id_idx` ON `memberships` (`user_id`);--> statement-breakpoint
CREATE INDEX `memberships_team_id_idx` ON `memberships` (`team_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `memberships_user_team_unq` ON `memberships` (`user_id`,`team_id`);--> statement-breakpoint
CREATE INDEX `messages_channel_created_idx` ON `messages` (`channel_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `tasks_team_id_idx` ON `tasks` (`team_id`);--> statement-breakpoint
CREATE INDEX `tasks_channel_id_idx` ON `tasks` (`channel_id`);--> statement-breakpoint
CREATE INDEX `tasks_assigned_to_user_id_idx` ON `tasks` (`assigned_to_user_id`);