DO $$ BEGIN
 CREATE TYPE "approval_status" AS ENUM('pending', 'approved', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pending_mods_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pending_mod_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"diff" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pending_mods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mod_id" text NOT NULL,
	"description" text,
	"more_info_url" text NOT NULL,
	"category" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "approval_status" DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pending_mods_audit_log" ADD CONSTRAINT "pending_mods_audit_log_pending_mod_id_pending_mods_id_fk" FOREIGN KEY ("pending_mod_id") REFERENCES "pending_mods"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pending_mods_audit_log" ADD CONSTRAINT "pending_mods_audit_log_user_id_github_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "github_users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pending_mods" ADD CONSTRAINT "pending_mods_mod_id_mods_id_fk" FOREIGN KEY ("mod_id") REFERENCES "mods"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pending_mods" ADD CONSTRAINT "pending_mods_category_categories_name_fk" FOREIGN KEY ("category") REFERENCES "categories"("name") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "public"."pending_mods_audit_log" OWNER TO "postgres";
ALTER TABLE "public"."pending_mods_audit_log" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."pending_mods" OWNER TO "postgres";
ALTER TABLE "public"."pending_mods" ENABLE ROW LEVEL SECURITY;
