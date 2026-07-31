# Example: SQL Schema Table Migration - RemoteFix

```sql
-- Drizzle Kit generated migration file
-- Target: Microsoft Azure SQL

BEGIN TRANSACTION;

CREATE TABLE [dbo].[customer_feedback] (
    [id] VARCHAR(36) NOT NULL,
    [booking_id] VARCHAR(36) NOT NULL,
    [rating] INT NOT NULL,
    [comment] NVARCHAR(MAX),
    [created_at] DATETIME2 DEFAULT GETDATE() NOT NULL,
    CONSTRAINT [PK_customer_feedback] PRIMARY KEY CLUSTERED ([id] ASC)
);

CREATE NONCLUSTERED INDEX [IX_feedback_booking_id]
    ON [dbo].[customer_feedback]([booking_id] ASC);

COMMIT;
```
