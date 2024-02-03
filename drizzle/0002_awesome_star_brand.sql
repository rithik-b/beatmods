ALTER TABLE "github_users" DROP CONSTRAINT "github_users_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "github_users" ADD COLUMN "auth_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "github_users" ADD CONSTRAINT "github_users_auth_id_users_id_fk" FOREIGN KEY ("auth_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.github_users (id, auth_id, name, user_name, avatar_url)
  values (
    gen_random_uuid(),
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', NULL),
    coalesce(new.raw_user_meta_data ->> 'user_name', new.email),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', NULL));
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."handle_update_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$begin
  update public.github_users
    set auth_id = new.id,
    name = coalesce(new.raw_user_meta_data ->> 'name', NULL),user_name = coalesce(new.raw_user_meta_data ->> 'user_name', new.email),
    avatar_url = coalesce(new.raw_user_meta_data ->> 'avatar_url', NULL)
  where auth_id = new.id;
  return new;
end;
$$;