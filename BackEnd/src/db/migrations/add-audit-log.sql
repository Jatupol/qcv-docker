-- Migration: add audit_log table
-- Apply with:  psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f add-audit-log.sql
-- Or run from server/:  npm run db:push   (Drizzle will diff and create the new table only)

CREATE TABLE IF NOT EXISTS "audit_log" (
  "id"             serial PRIMARY KEY,
  "action"         varchar(16)  NOT NULL,
  "entity"         varchar(64)  NOT NULL,
  "record_id"      varchar(128) NOT NULL,
  "old_values"     jsonb,
  "new_values"     jsonb,
  "actor_user_id"  integer REFERENCES "users"("id") ON DELETE SET NULL,
  "actor_username" varchar(50),
  "actor_role"     varchar(20),
  "ip_address"     varchar(64),
  "user_agent"     varchar(512),
  "reason"         varchar(255),
  "created_at"     timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_audit_entity_record" ON "audit_log" ("entity", "record_id");
CREATE INDEX IF NOT EXISTS "idx_audit_actor"         ON "audit_log" ("actor_user_id");
CREATE INDEX IF NOT EXISTS "idx_audit_created_at"    ON "audit_log" ("created_at");
