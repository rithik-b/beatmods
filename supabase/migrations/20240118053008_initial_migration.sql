
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

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

CREATE SCHEMA IF NOT EXISTS "supabase_migrations";

ALTER SCHEMA "supabase_migrations" OWNER TO "postgres";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS trigger
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.github_users (id, name, user_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'user_name', new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_update_user"() RETURNS trigger
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  update public.github_users
    set id = new.id, name = new.raw_user_meta_data ->> 'name', user_name = new.raw_user_meta_data ->> 'user_name', avatar_url = new.raw_user_meta_data ->> 'avatar_url'
  where id = new.id;
  return new;
end;
$$;

ALTER FUNCTION "public"."handle_update_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "description" text
);

ALTER TABLE "public"."categories" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."game_versions" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "version" text NOT NULL,
    "published" boolean DEFAULT false NOT NULL
);

ALTER TABLE "public"."game_versions" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."github_users" (
    "id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "name" text,
    "user_name" text NOT NULL,
    "avatar_url" text
);

ALTER TABLE "public"."github_users" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."mod_contributors" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "mod_id" text NOT NULL,
    "user_id" uuid NOT NULL
);

ALTER TABLE "public"."mod_contributors" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."mod_version_dependencies" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "mod_id" uuid NOT NULL,
    "semver" text NOT NULL,
    "dependency_id" text NOT NULL
);

ALTER TABLE "public"."mod_version_dependencies" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."mod_version_supported_game_versions" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "mod_version_id" uuid NOT NULL,
    "game_version_id" uuid
);

ALTER TABLE "public"."mod_version_supported_game_versions" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."mod_versions" (
    "mod_id" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "version" text NOT NULL,
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "download_url" text NOT NULL
);

ALTER TABLE "public"."mod_versions" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."mods" (
    "id" text NOT NULL,
    "name" text NOT NULL,
    "slug" text NOT NULL,
    "description" text,
    "more_info_url" text NOT NULL,
    "created_at" timestamp without time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
    "category" text NOT NULL
);

ALTER TABLE "public"."mods" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "supabase_migrations"."schema_migrations" (
    "version" text NOT NULL,
    "statements" text[],
    "name" text
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
    ADD CONSTRAINT "github_users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."mod_contributors"
    ADD CONSTRAINT "mod_contributors_mod_id_fkey" FOREIGN KEY (mod_id) REFERENCES public.mods(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."mod_contributors"
    ADD CONSTRAINT "mod_contributors_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.github_users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."mod_version_dependencies"
    ADD CONSTRAINT "mod_version_dependencies_dependency_id_fkey" FOREIGN KEY (dependency_id) REFERENCES public.mods(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."mod_version_dependencies"
    ADD CONSTRAINT "mod_version_dependencies_mod_id_fkey" FOREIGN KEY (mod_id) REFERENCES public.mod_versions(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."mod_version_supported_game_versions"
    ADD CONSTRAINT "mod_version_supported_game_versions_game_version_id_fkey" FOREIGN KEY (game_version_id) REFERENCES public.game_versions(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."mod_version_supported_game_versions"
    ADD CONSTRAINT "mod_version_supported_game_versions_mod_version_id_fkey" FOREIGN KEY (mod_version_id) REFERENCES public.mod_versions(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."mod_versions"
    ADD CONSTRAINT "mod_versions_mod_id_fkey" FOREIGN KEY (mod_id) REFERENCES public.mods(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."mods"
    ADD CONSTRAINT "mods_category_fkey" FOREIGN KEY (category) REFERENCES public.categories(name) ON UPDATE CASCADE ON DELETE RESTRICT;

CREATE POLICY "Enable delete for existing mod contributors" ON "public"."mod_contributors" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.mod_contributors mod_contributors_reference
  WHERE ((mod_contributors_reference.user_id = auth.uid()) AND (mod_contributors_reference.mod_id = mod_contributors.mod_id)))));

CREATE POLICY "Enable insert for existing mod contributors" ON "public"."mod_contributors" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.mod_contributors mod_contributors_reference
  WHERE ((mod_contributors_reference.user_id = auth.uid()) AND (mod_contributors_reference.mod_id = mod_contributors.mod_id)))));

CREATE POLICY "Enable insert for mod contributors" ON "public"."mod_versions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.mod_contributors
  WHERE ((mod_contributors.user_id = auth.uid()) AND (mod_contributors.mod_id = mod_versions.mod_id)))));

CREATE POLICY "Enable read access for all users" ON "public"."categories" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."game_versions" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."github_users" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."mod_contributors" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."mod_version_supported_game_versions" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."mod_versions" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."mods" FOR SELECT USING (true);

CREATE POLICY "Enable update for mod contributors" ON "public"."mod_versions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.mod_contributors
  WHERE ((mod_contributors.user_id = auth.uid()) AND (mod_contributors.mod_id = mod_versions.mod_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.mod_contributors
  WHERE ((mod_contributors.user_id = auth.uid()) AND (mod_contributors.mod_id = mod_versions.mod_id)))));

CREATE POLICY "Enable update for mod contributors" ON "public"."mods" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.mod_contributors
  WHERE ((mod_contributors.user_id = auth.uid()) AND (mod_contributors.mod_id = mods.id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.mod_contributors
  WHERE ((mod_contributors.user_id = auth.uid()) AND (mod_contributors.mod_id = mods.id)))));

ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."game_versions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."github_users" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."mod_contributors" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."mod_version_dependencies" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."mod_version_supported_game_versions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."mod_versions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."mods" ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_update_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_update_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_update_user"() TO "service_role";

GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";

GRANT ALL ON TABLE "public"."game_versions" TO "anon";
GRANT ALL ON TABLE "public"."game_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."game_versions" TO "service_role";

GRANT ALL ON TABLE "public"."github_users" TO "anon";
GRANT ALL ON TABLE "public"."github_users" TO "authenticated";
GRANT ALL ON TABLE "public"."github_users" TO "service_role";

GRANT ALL ON TABLE "public"."mod_contributors" TO "anon";
GRANT ALL ON TABLE "public"."mod_contributors" TO "authenticated";
GRANT ALL ON TABLE "public"."mod_contributors" TO "service_role";

GRANT ALL ON TABLE "public"."mod_version_dependencies" TO "anon";
GRANT ALL ON TABLE "public"."mod_version_dependencies" TO "authenticated";
GRANT ALL ON TABLE "public"."mod_version_dependencies" TO "service_role";

GRANT ALL ON TABLE "public"."mod_version_supported_game_versions" TO "anon";
GRANT ALL ON TABLE "public"."mod_version_supported_game_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."mod_version_supported_game_versions" TO "service_role";

GRANT ALL ON TABLE "public"."mod_versions" TO "anon";
GRANT ALL ON TABLE "public"."mod_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."mod_versions" TO "service_role";

GRANT ALL ON TABLE "public"."mods" TO "anon";
GRANT ALL ON TABLE "public"."mods" TO "authenticated";
GRANT ALL ON TABLE "public"."mods" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
