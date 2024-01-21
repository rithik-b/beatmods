-- inserts a row into public.github_users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.github_users (id, name, user_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'user_name', new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;

-- updates a row in public.github_users
create or replace function public.handle_update_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.github_users
    set id = new.id, name = new.raw_user_meta_data ->> 'name', user_name = new.raw_user_meta_data ->> 'user_name', avatar_url = new.raw_user_meta_data ->> 'avatar_url'
  where id = new.id;
  return new;
end;
$$;

-- trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

  -- trigger the function every time a user is updated
create or replace trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_update_user();
