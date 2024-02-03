
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

CREATE SCHEMA IF NOT EXISTS "supabase_migrations";

ALTER SCHEMA "supabase_migrations" OWNER TO "postgres";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TYPE "public"."contributor_type" AS (
	"id" "uuid",
	"name" "text",
	"user_name" "text",
	"avatar_url" "text"
);

ALTER TYPE "public"."contributor_type" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.github_users (id, name, user_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', NULL),
    coalesce(new.raw_user_meta_data ->> 'user_name', new.email),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', NULL));
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

CREATE OR REPLACE FUNCTION "public"."handle_update_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$begin
  update public.github_users
    set id = new.id,
    name = coalesce(new.raw_user_meta_data ->> 'name', NULL),user_name = coalesce(new.raw_user_meta_data ->> 'user_name', new.email),
    avatar_url = coalesce(new.raw_user_meta_data ->> 'avatar_url', NULL)
  where id = new.id;
  return new;
end;
$$;

create or replace trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_update_user();
  
SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text"
);

ALTER TABLE "public"."categories" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."game_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "version" "text" NOT NULL,
    "published" boolean DEFAULT false NOT NULL
);

ALTER TABLE "public"."game_versions" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."github_users" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text",
    "user_name" "text" NOT NULL,
    "avatar_url" "text"
);

ALTER TABLE "public"."github_users" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."mod_contributors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mod_id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL
);

ALTER TABLE "public"."mod_contributors" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."mod_version_dependencies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "semver" "text" NOT NULL,
    "dependency_id" "text" NOT NULL,
    "mod_versions_id" "uuid" NOT NULL
);

ALTER TABLE "public"."mod_version_dependencies" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."mod_version_supported_game_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mod_version_id" "uuid" NOT NULL,
    "game_version_id" "uuid"
);

ALTER TABLE "public"."mod_version_supported_game_versions" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."mod_versions" (
    "mod_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "version" "text" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "download_url" "text" NOT NULL
);

ALTER TABLE "public"."mod_versions" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."mods" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "more_info_url" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "category" "text" NOT NULL
);

ALTER TABLE "public"."mods" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "supabase_migrations"."schema_migrations" (
    "version" "text" NOT NULL,
    "statements" "text"[],
    "name" "text"
);

ALTER TABLE "supabase_migrations"."schema_migrations" OWNER TO "postgres";

ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "Categories_name_key" UNIQUE ("name");

ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "Categories_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."game_versions"
    ADD CONSTRAINT "GameVersions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."game_versions"
    ADD CONSTRAINT "GameVersions_version_key" UNIQUE ("version");

ALTER TABLE ONLY "public"."github_users"
    ADD CONSTRAINT "GithubUser_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."mod_contributors"
    ADD CONSTRAINT "ModContributors_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."mod_version_supported_game_versions"
    ADD CONSTRAINT "ModVersionSupportedGameVersions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."mod_versions"
    ADD CONSTRAINT "ModVersions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."mods"
    ADD CONSTRAINT "Mod_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."mods"
    ADD CONSTRAINT "Mod_slug_key" UNIQUE ("slug");

ALTER TABLE ONLY "public"."mod_version_dependencies"
    ADD CONSTRAINT "mod_version_dependencies_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "supabase_migrations"."schema_migrations"
    ADD CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version");

ALTER TABLE ONLY "public"."github_users"
    ADD CONSTRAINT "github_users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."mod_contributors"
    ADD CONSTRAINT "mod_contributors_mod_id_fkey" FOREIGN KEY ("mod_id") REFERENCES "public"."mods"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."mod_contributors"
    ADD CONSTRAINT "mod_contributors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."github_users"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."mod_version_dependencies"
    ADD CONSTRAINT "mod_version_dependencies_dependency_id_fkey" FOREIGN KEY ("dependency_id") REFERENCES "public"."mods"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."mod_version_dependencies"
    ADD CONSTRAINT "mod_version_dependencies_mod_versions_id_fkey" FOREIGN KEY ("mod_versions_id") REFERENCES "public"."mod_versions"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."mod_version_supported_game_versions"
    ADD CONSTRAINT "mod_version_supported_game_versions_game_version_id_fkey" FOREIGN KEY ("game_version_id") REFERENCES "public"."game_versions"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."mod_version_supported_game_versions"
    ADD CONSTRAINT "mod_version_supported_game_versions_mod_version_id_fkey" FOREIGN KEY ("mod_version_id") REFERENCES "public"."mod_versions"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."mod_versions"
    ADD CONSTRAINT "mod_versions_mod_id_fkey" FOREIGN KEY ("mod_id") REFERENCES "public"."mods"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."mods"
    ADD CONSTRAINT "mods_category_fkey" FOREIGN KEY ("category") REFERENCES "public"."categories"("name") ON UPDATE CASCADE ON DELETE RESTRICT;

CREATE POLICY "Enable read access for all users" ON "public"."mod_version_supported_game_versions" FOR SELECT USING (true);

ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."game_versions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."github_users" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."mod_contributors" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."mod_version_dependencies" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."mod_version_supported_game_versions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."mod_versions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."mods" ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA "public" TO "postgres";

GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";

GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";

GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";

GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";

GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";

GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";

GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";

GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";

GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";

GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";

GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";

GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";

GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";

GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";

GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";

GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";

GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";

GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";

GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";

GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";

GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";

GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";

GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";

RESET ALL;

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id") VALUES
	('mods', 'mods', NULL, '2024-02-03 02:18:42.200365+00', '2024-02-03 02:18:42.200365+00', true, false, 15728640, '{application/zip}', NULL);