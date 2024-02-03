ALTER TABLE "github_users" DROP CONSTRAINT "github_users_id_fkey";
--> statement-breakpoint
ALTER TABLE "mod_contributors" DROP CONSTRAINT "mod_contributors_mod_id_fkey";
--> statement-breakpoint
ALTER TABLE "mod_contributors" DROP CONSTRAINT "mod_contributors_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "mod_version_dependencies" DROP CONSTRAINT "mod_version_dependencies_dependency_id_fkey";
--> statement-breakpoint
ALTER TABLE "mod_version_dependencies" DROP CONSTRAINT "mod_version_dependencies_mod_versions_id_fkey";
--> statement-breakpoint
ALTER TABLE "mod_version_supported_game_versions" DROP CONSTRAINT "mod_version_supported_game_versions_game_version_id_fkey";
--> statement-breakpoint
ALTER TABLE "mod_version_supported_game_versions" DROP CONSTRAINT "mod_version_supported_game_versions_mod_version_id_fkey";
--> statement-breakpoint
ALTER TABLE "mod_versions" DROP CONSTRAINT "mod_versions_mod_id_fkey";
--> statement-breakpoint
ALTER TABLE "mods" DROP CONSTRAINT "mods_category_fkey";
--> statement-breakpoint
ALTER TABLE "mods" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "mods" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "github_users" ADD CONSTRAINT "github_users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mod_contributors" ADD CONSTRAINT "mod_contributors_mod_id_mods_id_fk" FOREIGN KEY ("mod_id") REFERENCES "mods"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mod_contributors" ADD CONSTRAINT "mod_contributors_user_id_github_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "github_users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mod_version_dependencies" ADD CONSTRAINT "mod_version_dependencies_mod_versions_id_mod_versions_id_fk" FOREIGN KEY ("mod_versions_id") REFERENCES "mod_versions"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mod_version_dependencies" ADD CONSTRAINT "mod_version_dependencies_dependency_id_mods_id_fk" FOREIGN KEY ("dependency_id") REFERENCES "mods"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mod_version_supported_game_versions" ADD CONSTRAINT "mod_version_supported_game_versions_mod_version_id_mod_versions_id_fk" FOREIGN KEY ("mod_version_id") REFERENCES "mod_versions"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mod_version_supported_game_versions" ADD CONSTRAINT "mod_version_supported_game_versions_game_version_id_game_versions_id_fk" FOREIGN KEY ("game_version_id") REFERENCES "game_versions"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mod_versions" ADD CONSTRAINT "mod_versions_mod_id_mods_id_fk" FOREIGN KEY ("mod_id") REFERENCES "mods"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mods" ADD CONSTRAINT "mods_category_categories_name_fk" FOREIGN KEY ("category") REFERENCES "categories"("name") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
