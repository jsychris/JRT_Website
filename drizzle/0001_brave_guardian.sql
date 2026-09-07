ALTER TABLE `events` ADD `cost_pence` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `options_json` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `revision` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `rsvps` ADD `answers_json` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `rsvps` ADD `event_revision` integer DEFAULT 1 NOT NULL;