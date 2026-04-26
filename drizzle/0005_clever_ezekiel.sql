PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_agent_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text,
	`trigger` text,
	`agent_type` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`input_context` text,
	`output` text,
	`tool_calls` text,
	`tokens_used` integer,
	`duration_ms` integer,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`next_attempt_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_agent_runs`("id", "team_id", "trigger", "agent_type", "status", "input_context", "output", "tool_calls", "tokens_used", "duration_ms", "created_at") SELECT "id", "team_id", "trigger", "agent_type", "status", "input_context", "output", "tool_calls", "tokens_used", "duration_ms", "created_at" FROM `agent_runs`;--> statement-breakpoint
DROP TABLE `agent_runs`;--> statement-breakpoint
ALTER TABLE `__new_agent_runs` RENAME TO `agent_runs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `agent_runs_team_created_idx` ON `agent_runs` (`team_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `agent_runs_status_next_idx` ON `agent_runs` (`status`,`next_attempt_at`);
