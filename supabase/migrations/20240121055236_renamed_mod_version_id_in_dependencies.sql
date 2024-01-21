alter table "public"."mod_version_dependencies" drop constraint "mod_version_dependencies_mod_id_fkey";

alter table "public"."mod_version_dependencies" drop column "mod_id";

alter table "public"."mod_version_dependencies" add column "mod_versions_id" uuid not null;

alter table "public"."mod_version_dependencies" add constraint "mod_version_dependencies_mod_versions_id_fkey" FOREIGN KEY (mod_versions_id) REFERENCES mod_versions(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."mod_version_dependencies" validate constraint "mod_version_dependencies_mod_versions_id_fkey";


