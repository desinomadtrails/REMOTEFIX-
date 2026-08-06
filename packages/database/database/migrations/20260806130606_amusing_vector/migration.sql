CREATE TABLE [otp_verifications] (
	[id] varchar(36),
	[email] varchar(255) NOT NULL,
	[otp] varchar(20) NOT NULL,
	[purpose] varchar(50) NOT NULL CONSTRAINT [otp_verifications_purpose_default] DEFAULT ('email_verification'),
	[is_used] bit NOT NULL CONSTRAINT [otp_verifications_is_used_default] DEFAULT ((0)),
	[expires_at] datetime2 NOT NULL,
	[created_at] datetime2 NOT NULL CONSTRAINT [otp_verifications_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [otp_verifications_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
ALTER TABLE [refresh_tokens] ADD [revoked_at] datetime2;--> statement-breakpoint
ALTER TABLE [users] ADD [first_name] varchar(100);--> statement-breakpoint
ALTER TABLE [users] ADD [last_name] varchar(100);--> statement-breakpoint
ALTER TABLE [users] ADD [mobile] varchar(20);--> statement-breakpoint
ALTER TABLE [users] ADD [last_login_at] datetime2;--> statement-breakpoint
CREATE INDEX [idx_otp_email] ON [otp_verifications] ([email]);--> statement-breakpoint
CREATE INDEX [idx_otp_purpose] ON [otp_verifications] ([purpose]);--> statement-breakpoint
CREATE INDEX [idx_users_mobile] ON [users] ([mobile]);