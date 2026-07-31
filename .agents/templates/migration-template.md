# SQL Migration Template - RemoteFix

## Purpose
Details the required SQL conventions for schema modifications.

## When to use
When manually adjusting generated Drizzle Kit schema migrations.

## Required inputs
- Clustered indices and constraint definitions.

## Example
```sql
BEGIN TRANSACTION;
CREATE TABLE [dbo].[audit_logs] (
    [id] VARCHAR(36) NOT NULL,
    [action] VARCHAR(255) NOT NULL,
    CONSTRAINT [PK_audit_logs] PRIMARY KEY CLUSTERED ([id] ASC)
);
COMMIT;
```

## Common mistakes
- Omitting clustered primary keys or running unparameterized DDL scripts.

## Checklist
- [ ] Migration wraps inside sql transactions block.
