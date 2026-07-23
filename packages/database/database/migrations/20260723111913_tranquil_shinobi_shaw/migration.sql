CREATE TABLE [audit_logs] (
	[id] varchar(36),
	[user_id] varchar(36),
	[action] varchar(100) NOT NULL,
	[details] text NOT NULL,
	[ip_address] varchar(45),
	[created_at] datetime2 NOT NULL CONSTRAINT [audit_logs_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [audit_logs_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [blog_posts] (
	[id] varchar(36),
	[title] varchar(255) NOT NULL,
	[slug] varchar(255) NOT NULL,
	[content] text NOT NULL,
	[author_id] varchar(36) NOT NULL,
	[published_at] datetime2,
	[is_published] bit NOT NULL CONSTRAINT [blog_posts_is_published_default] DEFAULT ((0)),
	[created_at] datetime2 NOT NULL CONSTRAINT [blog_posts_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [blog_posts_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [blog_posts_pkey] PRIMARY KEY([id]),
	CONSTRAINT [blog_posts_slug_key] UNIQUE([slug])
);
--> statement-breakpoint
CREATE TABLE [booking_images] (
	[id] varchar(36),
	[booking_id] varchar(36) NOT NULL,
	[image_url] varchar(500) NOT NULL,
	[created_at] datetime2 NOT NULL CONSTRAINT [booking_images_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [booking_images_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [bookings] (
	[id] varchar(36),
	[customer_id] varchar(36) NOT NULL,
	[service_id] varchar(36),
	[type] varchar(20) NOT NULL,
	[status] varchar(20) NOT NULL CONSTRAINT [bookings_status_default] DEFAULT ('pending'),
	[name] varchar(255) NOT NULL,
	[phone] varchar(20) NOT NULL,
	[email] varchar(255) NOT NULL,
	[company] varchar(255),
	[address] varchar(500),
	[problem_description] text NOT NULL,
	[preferred_date] varchar(10) NOT NULL,
	[preferred_time] varchar(5) NOT NULL,
	[operating_system] varchar(50) NOT NULL,
	[engineer_id] varchar(36),
	[created_at] datetime2 NOT NULL CONSTRAINT [bookings_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [bookings_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [bookings_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [customers] (
	[id] varchar(36),
	[user_id] varchar(36) NOT NULL,
	[phone] varchar(20) NOT NULL,
	[company_name] varchar(255),
	[billing_address] varchar(500),
	[created_at] datetime2 NOT NULL CONSTRAINT [customers_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [customers_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [customers_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [engineers] (
	[id] varchar(36),
	[user_id] varchar(36) NOT NULL,
	[phone] varchar(20) NOT NULL,
	[bio] text,
	[specialities] text,
	[status] varchar(20) NOT NULL CONSTRAINT [engineers_status_default] DEFAULT ('available'),
	[created_at] datetime2 NOT NULL CONSTRAINT [engineers_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [engineers_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [engineers_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [faqs] (
	[id] varchar(36),
	[question] varchar(500) NOT NULL,
	[answer] text NOT NULL,
	[category] varchar(100) NOT NULL,
	[is_active] bit NOT NULL CONSTRAINT [faqs_is_active_default] DEFAULT ((1)),
	[created_at] datetime2 NOT NULL CONSTRAINT [faqs_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [faqs_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [faqs_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [invoices] (
	[id] varchar(36),
	[booking_id] varchar(36) NOT NULL,
	[invoice_number] varchar(50) NOT NULL,
	[amount] decimal(10,2) NOT NULL,
	[status] varchar(20) NOT NULL CONSTRAINT [invoices_status_default] DEFAULT ('unpaid'),
	[pdf_url] varchar(500),
	[created_at] datetime2 NOT NULL CONSTRAINT [invoices_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [invoices_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [invoices_pkey] PRIMARY KEY([id]),
	CONSTRAINT [invoices_invoice_number_key] UNIQUE([invoice_number])
);
--> statement-breakpoint
CREATE TABLE [payments] (
	[id] varchar(36),
	[invoice_id] varchar(36) NOT NULL,
	[payment_method] varchar(50) NOT NULL,
	[transaction_id] varchar(100) NOT NULL,
	[amount] decimal(10,2) NOT NULL,
	[status] varchar(20) NOT NULL CONSTRAINT [payments_status_default] DEFAULT ('pending'),
	[created_at] datetime2 NOT NULL CONSTRAINT [payments_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [payments_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [reviews] (
	[id] varchar(36),
	[booking_id] varchar(36) NOT NULL,
	[rating] int NOT NULL,
	[comment] text,
	[created_at] datetime2 NOT NULL CONSTRAINT [reviews_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [reviews_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [services] (
	[id] varchar(36),
	[name] varchar(100) NOT NULL,
	[description] text NOT NULL,
	[category] varchar(50) NOT NULL,
	[price] decimal(10,2) NOT NULL,
	[estimated_duration_minutes] int NOT NULL,
	[is_active] bit NOT NULL CONSTRAINT [services_is_active_default] DEFAULT ((1)),
	[created_at] datetime2 NOT NULL CONSTRAINT [services_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [services_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [services_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [ticket_messages] (
	[id] varchar(36),
	[ticket_id] varchar(36) NOT NULL,
	[sender_id] varchar(36) NOT NULL,
	[message] text NOT NULL,
	[created_at] datetime2 NOT NULL CONSTRAINT [ticket_messages_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [ticket_messages_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [tickets] (
	[id] varchar(36),
	[booking_id] varchar(36),
	[customer_id] varchar(36) NOT NULL,
	[subject] varchar(255) NOT NULL,
	[description] text NOT NULL,
	[priority] varchar(20) NOT NULL CONSTRAINT [tickets_priority_default] DEFAULT ('medium'),
	[status] varchar(20) NOT NULL CONSTRAINT [tickets_status_default] DEFAULT ('open'),
	[engineer_id] varchar(36),
	[created_at] datetime2 NOT NULL CONSTRAINT [tickets_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [tickets_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [tickets_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [users] (
	[id] varchar(36),
	[email] varchar(255) NOT NULL,
	[password_hash] varchar(255),
	[full_name] varchar(255) NOT NULL,
	[role] varchar(20) NOT NULL,
	[status] varchar(20) NOT NULL CONSTRAINT [users_status_default] DEFAULT ('active'),
	[google_id] varchar(255),
	[microsoft_id] varchar(255),
	[created_at] datetime2 NOT NULL CONSTRAINT [users_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [users_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [users_pkey] PRIMARY KEY([id]),
	CONSTRAINT [users_email_key] UNIQUE([email])
);
--> statement-breakpoint
ALTER TABLE [audit_logs] ADD CONSTRAINT [audit_logs_user_id_users_id_fk] FOREIGN KEY ([user_id]) REFERENCES [users]([id]);--> statement-breakpoint
ALTER TABLE [blog_posts] ADD CONSTRAINT [blog_posts_author_id_users_id_fk] FOREIGN KEY ([author_id]) REFERENCES [users]([id]);--> statement-breakpoint
ALTER TABLE [booking_images] ADD CONSTRAINT [booking_images_booking_id_bookings_id_fk] FOREIGN KEY ([booking_id]) REFERENCES [bookings]([id]);--> statement-breakpoint
ALTER TABLE [bookings] ADD CONSTRAINT [bookings_customer_id_customers_id_fk] FOREIGN KEY ([customer_id]) REFERENCES [customers]([id]);--> statement-breakpoint
ALTER TABLE [bookings] ADD CONSTRAINT [bookings_service_id_services_id_fk] FOREIGN KEY ([service_id]) REFERENCES [services]([id]);--> statement-breakpoint
ALTER TABLE [bookings] ADD CONSTRAINT [bookings_engineer_id_engineers_id_fk] FOREIGN KEY ([engineer_id]) REFERENCES [engineers]([id]);--> statement-breakpoint
ALTER TABLE [customers] ADD CONSTRAINT [customers_user_id_users_id_fk] FOREIGN KEY ([user_id]) REFERENCES [users]([id]);--> statement-breakpoint
ALTER TABLE [engineers] ADD CONSTRAINT [engineers_user_id_users_id_fk] FOREIGN KEY ([user_id]) REFERENCES [users]([id]);--> statement-breakpoint
ALTER TABLE [invoices] ADD CONSTRAINT [invoices_booking_id_bookings_id_fk] FOREIGN KEY ([booking_id]) REFERENCES [bookings]([id]);--> statement-breakpoint
ALTER TABLE [payments] ADD CONSTRAINT [payments_invoice_id_invoices_id_fk] FOREIGN KEY ([invoice_id]) REFERENCES [invoices]([id]);--> statement-breakpoint
ALTER TABLE [reviews] ADD CONSTRAINT [reviews_booking_id_bookings_id_fk] FOREIGN KEY ([booking_id]) REFERENCES [bookings]([id]);--> statement-breakpoint
ALTER TABLE [ticket_messages] ADD CONSTRAINT [ticket_messages_ticket_id_tickets_id_fk] FOREIGN KEY ([ticket_id]) REFERENCES [tickets]([id]);--> statement-breakpoint
ALTER TABLE [ticket_messages] ADD CONSTRAINT [ticket_messages_sender_id_users_id_fk] FOREIGN KEY ([sender_id]) REFERENCES [users]([id]);--> statement-breakpoint
ALTER TABLE [tickets] ADD CONSTRAINT [tickets_booking_id_bookings_id_fk] FOREIGN KEY ([booking_id]) REFERENCES [bookings]([id]);--> statement-breakpoint
ALTER TABLE [tickets] ADD CONSTRAINT [tickets_customer_id_customers_id_fk] FOREIGN KEY ([customer_id]) REFERENCES [customers]([id]);--> statement-breakpoint
ALTER TABLE [tickets] ADD CONSTRAINT [tickets_engineer_id_engineers_id_fk] FOREIGN KEY ([engineer_id]) REFERENCES [engineers]([id]);