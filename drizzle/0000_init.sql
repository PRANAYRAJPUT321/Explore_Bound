CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reference` text NOT NULL,
	`package_id` integer NOT NULL,
	`departure_id` integer,
	`travel_date` text NOT NULL,
	`tier` text DEFAULT 'standard' NOT NULL,
	`adults` integer NOT NULL,
	`children` integer DEFAULT 0 NOT NULL,
	`infants` integer DEFAULT 0 NOT NULL,
	`add_ons` text DEFAULT '[]' NOT NULL,
	`travellers` text DEFAULT '[]' NOT NULL,
	`subtotal` integer NOT NULL,
	`taxes` integer NOT NULL,
	`total_amount` integer NOT NULL,
	`advance_amount` integer NOT NULL,
	`customer_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`special_requests` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_status` text DEFAULT 'unpaid' NOT NULL,
	`admin_note` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`departure_id`) REFERENCES `departures`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_reference_idx` ON `bookings` (`reference`);--> statement-breakpoint
CREATE TABLE `departures` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`package_id` integer NOT NULL,
	`start_date` text NOT NULL,
	`total_seats` integer NOT NULL,
	`booked_seats` integer DEFAULT 0 NOT NULL,
	`price` integer,
	`status` text DEFAULT 'open' NOT NULL,
	FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `departures_package_idx` ON `departures` (`package_id`);--> statement-breakpoint
CREATE TABLE `destinations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`country` text NOT NULL,
	`region` text NOT NULL,
	`tagline` text NOT NULL,
	`description` text NOT NULL,
	`hero_image` text NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`best_time` text NOT NULL,
	`climate` text DEFAULT '' NOT NULL,
	`visa_info` text DEFAULT '' NOT NULL,
	`highlights` text DEFAULT '[]' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `destinations_slug_idx` ON `destinations` (`slug`);--> statement-breakpoint
CREATE TABLE `enquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`package_id` integer,
	`destination` text DEFAULT '' NOT NULL,
	`travel_month` text DEFAULT '' NOT NULL,
	`duration` text DEFAULT '' NOT NULL,
	`travellers` text DEFAULT '' NOT NULL,
	`budget` text DEFAULT '' NOT NULL,
	`interests` text DEFAULT '[]' NOT NULL,
	`preferred_time` text DEFAULT '' NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`category` text NOT NULL,
	`score` integer NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `packages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`destination_id` integer NOT NULL,
	`category` text NOT NULL,
	`themes` text DEFAULT '[]' NOT NULL,
	`route` text DEFAULT '[]' NOT NULL,
	`duration_days` integer NOT NULL,
	`duration_nights` integer NOT NULL,
	`price` integer NOT NULL,
	`original_price` integer,
	`offer_ends_at` integer,
	`cover_image` text NOT NULL,
	`gallery` text DEFAULT '[]' NOT NULL,
	`summary` text NOT NULL,
	`overview` text NOT NULL,
	`highlights` text DEFAULT '[]' NOT NULL,
	`itinerary` text DEFAULT '[]' NOT NULL,
	`inclusions` text DEFAULT '[]' NOT NULL,
	`exclusions` text DEFAULT '[]' NOT NULL,
	`group_size_max` integer DEFAULT 12 NOT NULL,
	`difficulty` text DEFAULT 'easy' NOT NULL,
	`is_group_tour` integer DEFAULT false NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`rating` real DEFAULT 0 NOT NULL,
	`review_count` integer DEFAULT 0 NOT NULL,
	`popularity` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`destination_id`) REFERENCES `destinations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `packages_slug_idx` ON `packages` (`slug`);--> statement-breakpoint
CREATE INDEX `packages_destination_idx` ON `packages` (`destination_id`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`package_id` integer,
	`name` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`rating` integer NOT NULL,
	`title` text NOT NULL,
	`comment` text NOT NULL,
	`trip_type` text DEFAULT '' NOT NULL,
	`travel_month` text DEFAULT '' NOT NULL,
	`photo_url` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`helpful` integer DEFAULT 0 NOT NULL,
	`reply` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `reviews_package_idx` ON `reviews` (`package_id`);--> statement-breakpoint
CREATE INDEX `reviews_status_idx` ON `reviews` (`status`);--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_email_idx` ON `subscribers` (`email`);