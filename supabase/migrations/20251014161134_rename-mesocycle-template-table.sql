drop trigger if exists "trg_pbe_audit" on "public"."mesocycle_template.exercises";

drop trigger if exists "trg_pbe_touch" on "public"."mesocycle_template.exercises";

drop trigger if exists "trg_pbe_validate" on "public"."mesocycle_template.exercises";

drop policy "Authenticated users and admins can insert non-app templates" on "public"."mesocycle.templates";

drop policy "Users and admins can delete templates" on "public"."mesocycle.templates";

drop policy "Users and admins can update templates" on "public"."mesocycle.templates";

drop policy "Users can view their own or public templates" on "public"."mesocycle.templates";

drop policy "Mesocycle template creators can CRUD their exercises" on "public"."mesocycle_template.exercises";

revoke delete on table "public"."mesocycle.templates" from "anon";

revoke insert on table "public"."mesocycle.templates" from "anon";

revoke references on table "public"."mesocycle.templates" from "anon";

revoke select on table "public"."mesocycle.templates" from "anon";

revoke trigger on table "public"."mesocycle.templates" from "anon";

revoke truncate on table "public"."mesocycle.templates" from "anon";

revoke update on table "public"."mesocycle.templates" from "anon";

revoke delete on table "public"."mesocycle.templates" from "authenticated";

revoke insert on table "public"."mesocycle.templates" from "authenticated";

revoke references on table "public"."mesocycle.templates" from "authenticated";

revoke select on table "public"."mesocycle.templates" from "authenticated";

revoke trigger on table "public"."mesocycle.templates" from "authenticated";

revoke truncate on table "public"."mesocycle.templates" from "authenticated";

revoke update on table "public"."mesocycle.templates" from "authenticated";

revoke delete on table "public"."mesocycle.templates" from "service_role";

revoke insert on table "public"."mesocycle.templates" from "service_role";

revoke references on table "public"."mesocycle.templates" from "service_role";

revoke select on table "public"."mesocycle.templates" from "service_role";

revoke trigger on table "public"."mesocycle.templates" from "service_role";

revoke truncate on table "public"."mesocycle.templates" from "service_role";

revoke update on table "public"."mesocycle.templates" from "service_role";

revoke delete on table "public"."mesocycle_template.exercises" from "anon";

revoke insert on table "public"."mesocycle_template.exercises" from "anon";

revoke references on table "public"."mesocycle_template.exercises" from "anon";

revoke select on table "public"."mesocycle_template.exercises" from "anon";

revoke trigger on table "public"."mesocycle_template.exercises" from "anon";

revoke truncate on table "public"."mesocycle_template.exercises" from "anon";

revoke update on table "public"."mesocycle_template.exercises" from "anon";

revoke delete on table "public"."mesocycle_template.exercises" from "authenticated";

revoke insert on table "public"."mesocycle_template.exercises" from "authenticated";

revoke references on table "public"."mesocycle_template.exercises" from "authenticated";

revoke select on table "public"."mesocycle_template.exercises" from "authenticated";

revoke trigger on table "public"."mesocycle_template.exercises" from "authenticated";

revoke truncate on table "public"."mesocycle_template.exercises" from "authenticated";

revoke update on table "public"."mesocycle_template.exercises" from "authenticated";

revoke delete on table "public"."mesocycle_template.exercises" from "service_role";

revoke insert on table "public"."mesocycle_template.exercises" from "service_role";

revoke references on table "public"."mesocycle_template.exercises" from "service_role";

revoke select on table "public"."mesocycle_template.exercises" from "service_role";

revoke trigger on table "public"."mesocycle_template.exercises" from "service_role";

revoke truncate on table "public"."mesocycle_template.exercises" from "service_role";

revoke update on table "public"."mesocycle_template.exercises" from "service_role";

alter table "public"."mesocycle.templates" drop constraint "mesocycle.templates_user_id_fkey";

alter table "public"."mesocycle.templates" drop constraint "program_blocks_num_weeks_check";

alter table "public"."mesocycle_template.exercises" drop constraint "mesocycle_template.exercises_exercise_id_fkey";

alter table "public"."mesocycle_template.exercises" drop constraint "mesocycle_template.exercises_mesocycle_block_id_fkey";

alter table "public"."mesocycle_template.exercises" drop constraint "program_block_exercises_block_id_exercise_id_key";

alter table "public"."mesocycle.templates" drop constraint "mesocycle.templates_pkey";

alter table "public"."mesocycle_template.exercises" drop constraint "program_block_exercises_pkey";

drop index if exists "public"."idx_pbe_block";

drop index if exists "public"."mesocycle.templates_pkey";

drop index if exists "public"."program_block_exercises_block_id_exercise_id_key";

drop index if exists "public"."program_block_exercises_pkey";

drop table "public"."mesocycle.templates";

drop table "public"."mesocycle_template.exercises";

create table "public"."mesocycle_template_exercises" (
    "id" uuid not null default gen_random_uuid(),
    "mesocycle_block_id" uuid not null,
    "exercise_id" text not null,
    "created_at" timestamp with time zone not null default now(),
    "last_modified" timestamp with time zone not null default now(),
    "day_of_week" numeric,
    "exercise_name" text
);


alter table "public"."mesocycle_template_exercises" enable row level security;

create table "public"."mesocycle_templates" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "start_date" date not null,
    "num_weeks" smallint not null,
    "goal" mesocycle_goal_enum not null,
    "status" mesocycle_status_enum not null default 'planning'::mesocycle_status_enum,
    "deload_week" smallint generated always as (num_weeks) stored,
    "created_at" timestamp with time zone not null default now(),
    "last_modified" timestamp with time zone not null default now(),
    "days_per_week" numeric,
    "muscle_emphasis" text[],
    "length_weeks" numeric,
    "minutes_per_session" numeric,
    "weight_now" numeric,
    "joint_pain_now" text[],
    "split_type" text,
    "exercise_variation" numeric,
    "is_app_template" boolean not null default false,
    "user_id" uuid
);


alter table "public"."mesocycle_templates" enable row level security;

CREATE INDEX idx_pbe_block ON public.mesocycle_template_exercises USING btree (mesocycle_block_id);

CREATE UNIQUE INDEX "mesocycle.templates_pkey" ON public.mesocycle_templates USING btree (id);

CREATE UNIQUE INDEX program_block_exercises_block_id_exercise_id_key ON public.mesocycle_template_exercises USING btree (mesocycle_block_id, exercise_id);

CREATE UNIQUE INDEX program_block_exercises_pkey ON public.mesocycle_template_exercises USING btree (id);

alter table "public"."mesocycle_template_exercises" add constraint "program_block_exercises_pkey" PRIMARY KEY using index "program_block_exercises_pkey";

alter table "public"."mesocycle_templates" add constraint "mesocycle.templates_pkey" PRIMARY KEY using index "mesocycle.templates_pkey";

alter table "public"."mesocycle_template_exercises" add constraint "mesocycle_template.exercises_exercise_id_fkey" FOREIGN KEY (exercise_id) REFERENCES exercise_library(exercise_uid) ON DELETE CASCADE not valid;

alter table "public"."mesocycle_template_exercises" validate constraint "mesocycle_template.exercises_exercise_id_fkey";

alter table "public"."mesocycle_template_exercises" add constraint "mesocycle_template.exercises_mesocycle_block_id_fkey" FOREIGN KEY (mesocycle_block_id) REFERENCES mesocycle_templates(id) ON DELETE CASCADE not valid;

alter table "public"."mesocycle_template_exercises" validate constraint "mesocycle_template.exercises_mesocycle_block_id_fkey";

alter table "public"."mesocycle_template_exercises" add constraint "program_block_exercises_block_id_exercise_id_key" UNIQUE using index "program_block_exercises_block_id_exercise_id_key";

alter table "public"."mesocycle_templates" add constraint "mesocycle.templates_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."mesocycle_templates" validate constraint "mesocycle.templates_user_id_fkey";

alter table "public"."mesocycle_templates" add constraint "program_blocks_num_weeks_check" CHECK (((num_weeks >= 4) AND (num_weeks <= 8))) not valid;

alter table "public"."mesocycle_templates" validate constraint "program_blocks_num_weeks_check";

grant delete on table "public"."mesocycle_template_exercises" to "anon";

grant insert on table "public"."mesocycle_template_exercises" to "anon";

grant references on table "public"."mesocycle_template_exercises" to "anon";

grant select on table "public"."mesocycle_template_exercises" to "anon";

grant trigger on table "public"."mesocycle_template_exercises" to "anon";

grant truncate on table "public"."mesocycle_template_exercises" to "anon";

grant update on table "public"."mesocycle_template_exercises" to "anon";

grant delete on table "public"."mesocycle_template_exercises" to "authenticated";

grant insert on table "public"."mesocycle_template_exercises" to "authenticated";

grant references on table "public"."mesocycle_template_exercises" to "authenticated";

grant select on table "public"."mesocycle_template_exercises" to "authenticated";

grant trigger on table "public"."mesocycle_template_exercises" to "authenticated";

grant truncate on table "public"."mesocycle_template_exercises" to "authenticated";

grant update on table "public"."mesocycle_template_exercises" to "authenticated";

grant delete on table "public"."mesocycle_template_exercises" to "service_role";

grant insert on table "public"."mesocycle_template_exercises" to "service_role";

grant references on table "public"."mesocycle_template_exercises" to "service_role";

grant select on table "public"."mesocycle_template_exercises" to "service_role";

grant trigger on table "public"."mesocycle_template_exercises" to "service_role";

grant truncate on table "public"."mesocycle_template_exercises" to "service_role";

grant update on table "public"."mesocycle_template_exercises" to "service_role";

grant delete on table "public"."mesocycle_templates" to "anon";

grant insert on table "public"."mesocycle_templates" to "anon";

grant references on table "public"."mesocycle_templates" to "anon";

grant select on table "public"."mesocycle_templates" to "anon";

grant trigger on table "public"."mesocycle_templates" to "anon";

grant truncate on table "public"."mesocycle_templates" to "anon";

grant update on table "public"."mesocycle_templates" to "anon";

grant delete on table "public"."mesocycle_templates" to "authenticated";

grant insert on table "public"."mesocycle_templates" to "authenticated";

grant references on table "public"."mesocycle_templates" to "authenticated";

grant select on table "public"."mesocycle_templates" to "authenticated";

grant trigger on table "public"."mesocycle_templates" to "authenticated";

grant truncate on table "public"."mesocycle_templates" to "authenticated";

grant update on table "public"."mesocycle_templates" to "authenticated";

grant delete on table "public"."mesocycle_templates" to "service_role";

grant insert on table "public"."mesocycle_templates" to "service_role";

grant references on table "public"."mesocycle_templates" to "service_role";

grant select on table "public"."mesocycle_templates" to "service_role";

grant trigger on table "public"."mesocycle_templates" to "service_role";

grant truncate on table "public"."mesocycle_templates" to "service_role";

grant update on table "public"."mesocycle_templates" to "service_role";

create policy "Mesocycle template creators can CRUD their exercises"
on "public"."mesocycle_template_exercises"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM mesocycle_templates mt
  WHERE (mt.id = mesocycle_template_exercises.mesocycle_block_id))))
with check ((EXISTS ( SELECT 1
   FROM mesocycle_templates mt
  WHERE (mt.id = mesocycle_template_exercises.mesocycle_block_id))));


create policy "Authenticated users and admins can insert non-app templates"
on "public"."mesocycle_templates"
as permissive
for insert
to authenticated
with check ((((user_id = auth.uid()) AND (is_app_template IS FALSE)) OR is_admin()));


create policy "Users and admins can delete templates"
on "public"."mesocycle_templates"
as permissive
for delete
to authenticated
using (((user_id = auth.uid()) OR is_admin()));


create policy "Users and admins can update templates"
on "public"."mesocycle_templates"
as permissive
for update
to authenticated
using (((user_id = auth.uid()) OR is_admin()))
with check (((user_id = auth.uid()) OR is_admin()));


create policy "Users can view their own or public templates"
on "public"."mesocycle_templates"
as permissive
for select
to authenticated
using (((user_id = auth.uid()) OR (is_app_template = true)));


CREATE TRIGGER trg_pbe_audit AFTER INSERT OR DELETE OR UPDATE ON public.mesocycle_template_exercises FOR EACH ROW EXECUTE FUNCTION util_audit_log();

CREATE TRIGGER trg_pbe_touch BEFORE UPDATE ON public.mesocycle_template_exercises FOR EACH ROW EXECUTE FUNCTION util_touch_last_modified();

CREATE TRIGGER trg_pbe_validate BEFORE INSERT OR UPDATE ON public.mesocycle_template_exercises FOR EACH ROW EXECUTE FUNCTION validate_block_week_plans();
ALTER TABLE "public"."mesocycle_template_exercises" DISABLE TRIGGER "trg_pbe_validate";


