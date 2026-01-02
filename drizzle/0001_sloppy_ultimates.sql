CREATE TABLE `holdings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`metalType` enum('gold','silver','platinum','palladium') NOT NULL,
	`weightGrams` decimal(12,4) NOT NULL,
	`buyPricePerGram` decimal(12,4),
	`buyDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `holdings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `metal_prices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metalType` enum('gold','silver','platinum','palladium') NOT NULL,
	`pricePerOunce` decimal(12,4) NOT NULL,
	`pricePerGram` decimal(12,4) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`previousClose` decimal(12,4),
	`dayHigh` decimal(12,4),
	`dayLow` decimal(12,4),
	`changePercent` decimal(8,4),
	`fetchedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `metal_prices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolio_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalValueUsd` decimal(14,2) NOT NULL,
	`goldValueUsd` decimal(14,2),
	`silverValueUsd` decimal(14,2),
	`platinumValueUsd` decimal(14,2),
	`palladiumValueUsd` decimal(14,2),
	`snapshotDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `portfolio_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metalType` enum('gold','silver','platinum','palladium') NOT NULL,
	`pricePerOunce` decimal(12,4) NOT NULL,
	`pricePerGram` decimal(12,4) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`priceDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `price_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`weightUnit` enum('grams','ounces') NOT NULL DEFAULT 'grams',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_settings_userId_unique` UNIQUE(`userId`)
);
