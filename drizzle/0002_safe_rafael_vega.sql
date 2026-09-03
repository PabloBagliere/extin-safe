CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`actor_user_id` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `audit_log_organization_created_idx` ON `audit_log` (`organization_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `establishment_maintenance_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`establishment_id` text NOT NULL,
	`maintenance_relationship_id` text NOT NULL,
	`starts_on` text NOT NULL,
	`ends_on` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`establishment_id`) REFERENCES `establishments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`maintenance_relationship_id`) REFERENCES `maintenance_relationships`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `establishment_assignments_establishment_idx` ON `establishment_maintenance_assignments` (`establishment_id`,`ends_on`);--> statement-breakpoint
CREATE TABLE `establishments` (
	`id` text PRIMARY KEY NOT NULL,
	`client_organization_id` text NOT NULL,
	`name` text NOT NULL,
	`contact_name` text,
	`contact_email` text,
	`contact_phone` text,
	`address_line` text NOT NULL,
	`city` text NOT NULL,
	`province` text NOT NULL,
	`postal_code` text,
	`archived_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`client_organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `establishments_client_archived_idx` ON `establishments` (`client_organization_id`,`archived_at`);--> statement-breakpoint
CREATE TABLE `extinguishers` (
	`id` text PRIMARY KEY NOT NULL,
	`establishment_id` text NOT NULL,
	`code` text NOT NULL,
	`type` text NOT NULL,
	`fire_classes` text NOT NULL,
	`capacity_value` integer NOT NULL,
	`capacity_unit` text NOT NULL,
	`brand` text,
	`serial_number` text,
	`location_description` text NOT NULL,
	`last_control_on` text,
	`next_control_due_on` text,
	`operational_status` text DEFAULT 'active' NOT NULL,
	`notes` text,
	`archived_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`establishment_id`) REFERENCES `establishments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `extinguishers_establishment_code_idx` ON `extinguishers` (`establishment_id`,`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `extinguishers_establishment_serial_idx` ON `extinguishers` (`establishment_id`,`serial_number`);--> statement-breakpoint
CREATE INDEX `extinguishers_establishment_archived_idx` ON `extinguishers` (`establishment_id`,`archived_at`);--> statement-breakpoint
CREATE INDEX `extinguishers_next_control_due_idx` ON `extinguishers` (`next_control_due_on`);--> statement-breakpoint
CREATE TABLE `maintenance_events` (
	`id` text PRIMARY KEY NOT NULL,
	`extinguisher_id` text NOT NULL,
	`maintenance_organization_id` text,
	`performed_by_user_id` text NOT NULL,
	`event_type` text NOT NULL,
	`performed_on` text NOT NULL,
	`resulting_operational_status` text NOT NULL,
	`resulting_next_control_due_on` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`extinguisher_id`) REFERENCES `extinguishers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`maintenance_organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`performed_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `maintenance_events_extinguisher_performed_idx` ON `maintenance_events` (`extinguisher_id`,`performed_on`);