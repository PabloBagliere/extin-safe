CREATE TABLE `maintenance_relationships` (
	`id` text PRIMARY KEY NOT NULL,
	`client_organization_id` text NOT NULL,
	`maintenance_organization_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`initiated_by_organization_id` text NOT NULL,
	`invitation_email` text,
	`accepted_at` integer,
	`ended_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`client_organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`maintenance_organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`initiated_by_organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `maintenance_relationships_client_idx` ON `maintenance_relationships` (`client_organization_id`);--> statement-breakpoint
CREATE INDEX `maintenance_relationships_maintenance_idx` ON `maintenance_relationships` (`maintenance_organization_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `maintenance_relationships_pair_idx` ON `maintenance_relationships` (`client_organization_id`,`maintenance_organization_id`);--> statement-breakpoint
CREATE TABLE `organization_member_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`invited_by_user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`accepted_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invited_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `organization_member_invitations_email_idx` ON `organization_member_invitations` (`email`);--> statement-breakpoint
CREATE INDEX `organization_member_invitations_organization_idx` ON `organization_member_invitations` (`organization_id`);--> statement-breakpoint
CREATE TABLE `organization_members` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`invited_by_user_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invited_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `organization_members_user_id_idx` ON `organization_members` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `organization_members_organization_user_idx` ON `organization_members` (`organization_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`tax_id` text,
	`contact_email` text,
	`contact_phone` text,
	`address` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `organizations_type_idx` ON `organizations` (`type`);--> statement-breakpoint
ALTER TABLE `session` ADD `active_organization_id` text;