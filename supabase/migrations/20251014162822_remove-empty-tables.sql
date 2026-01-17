-- Drop policy and constraints if table exists
do $$ 
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'admin_users') then
    drop policy if exists "admin_users_admin" on "public"."admin_users";
    alter table "public"."admin_users" drop constraint if exists "admin_users_granted_by_fkey";
    alter table "public"."admin_users" drop constraint if exists "admin_users_user_id_fkey";
    alter table "public"."admin_users" drop constraint if exists "admin_users_pkey";
  end if;
  
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'exercises_draft') then
    alter table "public"."exercises_draft" drop constraint if exists "exercises_draft_pkey";
  end if;
end $$;

-- Drop indexes if exist
drop index if exists "public"."admin_users_pkey";
drop index if exists "public"."exercises_draft_pkey";

-- Drop tables if exist (this will automatically revoke all permissions)
drop table if exists "public"."admin_users";
drop table if exists "public"."exercises_draft";


