create extension if not exists "pg_trgm" with schema "public" version '1.6';

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.github_users (id, name, user_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', NULL),
    coalesce(new.raw_user_meta_data ->> 'user_name', new.email),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', NULL));
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_update_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$begin
  update public.github_users
    set id = new.id,
    name = coalesce(new.raw_user_meta_data ->> 'name', NULL),user_name = coalesce(new.raw_user_meta_data ->> 'user_name', new.email),
    avatar_url = coalesce(new.raw_user_meta_data ->> 'avatar_url', NULL)
  where id = new.id;
  return new;
end;
$function$
;


