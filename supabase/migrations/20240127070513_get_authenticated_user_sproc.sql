set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_current_user()
 RETURNS SETOF github_users
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
    return query select * from public.github_users where id = auth.uid() LIMIT 1;
end;
$function$
;


