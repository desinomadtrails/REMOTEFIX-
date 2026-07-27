ALTER TABLE [bookings] ADD [city] varchar(100);--> statement-breakpoint
ALTER TABLE [bookings] ADD [state] varchar(100);--> statement-breakpoint
ALTER TABLE [bookings] ADD [pin_code] varchar(20);--> statement-breakpoint
ALTER TABLE [bookings] ADD [device_type] varchar(50);--> statement-breakpoint
ALTER TABLE [bookings] ADD [brand] varchar(100);--> statement-breakpoint
ALTER TABLE [bookings] ADD [model] varchar(100);--> statement-breakpoint
ALTER TABLE [bookings] ADD [serial_number] varchar(100);--> statement-breakpoint
ALTER TABLE [bookings] ADD [priority] varchar(20) NOT NULL CONSTRAINT [bookings_priority_default] DEFAULT ('normal');--> statement-breakpoint
ALTER TABLE [bookings] ADD [ticket_id] varchar(50);--> statement-breakpoint
ALTER TABLE [bookings] ALTER COLUMN [operating_system] varchar(50);--> statement-breakpoint
ALTER TABLE [bookings] ADD CONSTRAINT [bookings_ticket_id_key] UNIQUE([ticket_id]);