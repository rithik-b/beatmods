
create type "public"."contributor_type" as ("id" uuid, "name" text, "user_name" text, "avatar_url" text);

CREATE OR REPLACE FUNCTION public.get_mods_listing()
 RETURNS TABLE(id text, name text, slug text, category text, contributors contributor_type[], supported_game_versions text[], latest_mod_version text)
 LANGUAGE plpgsql
AS $function$
begin
    return query 
        SELECT
  m.id,
  m.name,
  m.slug,
  m.category,
(
    select
      array_agg(distinct_contributors)
    from
      (
        select distinct
          on (gu.id) (gu.id, gu.name, gu.user_name, gu.avatar_url)::contributor_type as distinct_contributors
        from
          mod_contributors mc
          join github_users gu on mc.user_id = gu.id
        where
          mc.mod_id = m.id
      ) as sub
  ) as contributors,  array_agg(DISTINCT gv.version) AS supported_game_versions,
  (SELECT mv.version FROM mod_versions mv WHERE mv.mod_id = m.id ORDER BY mv.version DESC LIMIT 1) AS latest_mod_version
FROM
  mods m
  LEFT JOIN mod_versions mv ON m.id = mv.mod_id
  LEFT JOIN mod_version_supported_game_versions mvs ON mv.id = mvs.mod_version_id
  LEFT JOIN game_versions gv ON mvs.game_version_id = gv.id
GROUP BY
  m.id;
end; $function$
;


