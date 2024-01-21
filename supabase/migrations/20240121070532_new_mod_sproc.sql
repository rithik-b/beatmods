set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.new_mod(id text, name text, description text, category text, more_info_url text, slug text, user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$begin
insert into mods(id, name, description, category, more_info_url, slug) values (id, name, description, category, more_info_url, slug);
insert into mod_contributors(mod_id, user_id) values (id, user_id);
end;$function$
;


