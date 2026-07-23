CREATE TABLE `brand_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`logo_path` text,
	`primary_color` text,
	`secondary_color` text,
	`font_family` text,
	`watermark` text,
	`intro_template_path` text,
	`outro_template_path` text,
	`is_default` integer DEFAULT true,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `characters` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`appearance` text,
	`reference_images` text DEFAULT '[]',
	`voice_profile` text,
	`is_default` integer DEFAULT false,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`images` text DEFAULT '[]',
	`price` text,
	`target_audience` text,
	`analysis` text,
	`video_count` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `script_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text,
	`video_mode` text,
	`style_type` text,
	`shots` text DEFAULT '[]',
	`source_project_id` text,
	`use_count` integer DEFAULT 0,
	`created_at` integer
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_video_clips` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`shot_id` integer NOT NULL,
	`asset_id` text,
	`file_path` text,
	`duration` integer,
	`provider` text,
	`model` text,
	`transition_type` text DEFAULT 'ai_start_end',
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_video_clips`("id", "project_id", "shot_id", "asset_id", "file_path", "duration", "provider", "model", "transition_type", "status", "created_at") SELECT "id", "project_id", "shot_id", "asset_id", "file_path", "duration", "provider", "model", "transition_type", "status", "created_at" FROM `video_clips`;--> statement-breakpoint
DROP TABLE `video_clips`;--> statement-breakpoint
ALTER TABLE `__new_video_clips` RENAME TO `video_clips`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `projects` ADD `product_id` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `brand_id` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `template_id` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `video_mode` text DEFAULT 'product_closeup';--> statement-breakpoint
ALTER TABLE `projects` ADD `source_type` text DEFAULT 'manual';--> statement-breakpoint
ALTER TABLE `projects` ADD `source_video_url` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `character_id` text;