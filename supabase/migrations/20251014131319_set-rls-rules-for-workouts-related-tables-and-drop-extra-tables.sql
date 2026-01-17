drop policy "wex_owner" on "public"."workout_exercises";

drop policy "wset_owner" on "public"."workout_sets";

drop policy "w_owner" on "public"."workouts";

drop policy "workouts_public_select" on "public"."workouts";

revoke delete on table "public"."workout_exercises.template" from "anon";

revoke insert on table "public"."workout_exercises.template" from "anon";

revoke references on table "public"."workout_exercises.template" from "anon";

revoke select on table "public"."workout_exercises.template" from "anon";

revoke trigger on table "public"."workout_exercises.template" from "anon";

revoke truncate on table "public"."workout_exercises.template" from "anon";

revoke update on table "public"."workout_exercises.template" from "anon";

revoke delete on table "public"."workout_exercises.template" from "authenticated";

revoke insert on table "public"."workout_exercises.template" from "authenticated";

revoke references on table "public"."workout_exercises.template" from "authenticated";

revoke select on table "public"."workout_exercises.template" from "authenticated";

revoke trigger on table "public"."workout_exercises.template" from "authenticated";

revoke truncate on table "public"."workout_exercises.template" from "authenticated";

revoke update on table "public"."workout_exercises.template" from "authenticated";

revoke delete on table "public"."workout_exercises.template" from "service_role";

revoke insert on table "public"."workout_exercises.template" from "service_role";

revoke references on table "public"."workout_exercises.template" from "service_role";

revoke select on table "public"."workout_exercises.template" from "service_role";

revoke trigger on table "public"."workout_exercises.template" from "service_role";

revoke truncate on table "public"."workout_exercises.template" from "service_role";

revoke update on table "public"."workout_exercises.template" from "service_role";

revoke delete on table "public"."workouts.templates" from "anon";

revoke insert on table "public"."workouts.templates" from "anon";

revoke references on table "public"."workouts.templates" from "anon";

revoke select on table "public"."workouts.templates" from "anon";

revoke trigger on table "public"."workouts.templates" from "anon";

revoke truncate on table "public"."workouts.templates" from "anon";

revoke update on table "public"."workouts.templates" from "anon";

revoke delete on table "public"."workouts.templates" from "authenticated";

revoke insert on table "public"."workouts.templates" from "authenticated";

revoke references on table "public"."workouts.templates" from "authenticated";

revoke select on table "public"."workouts.templates" from "authenticated";

revoke trigger on table "public"."workouts.templates" from "authenticated";

revoke truncate on table "public"."workouts.templates" from "authenticated";

revoke update on table "public"."workouts.templates" from "authenticated";

revoke delete on table "public"."workouts.templates" from "service_role";

revoke insert on table "public"."workouts.templates" from "service_role";

revoke references on table "public"."workouts.templates" from "service_role";

revoke select on table "public"."workouts.templates" from "service_role";

revoke trigger on table "public"."workouts.templates" from "service_role";

revoke truncate on table "public"."workouts.templates" from "service_role";

revoke update on table "public"."workouts.templates" from "service_role";

alter table "public"."workout_exercises.template" drop constraint "workout_exercises.template_workout_id_fkey";

alter table "public"."workout_exercises.template" drop constraint "workout_exercises_effort_check";

alter table "public"."workout_exercises.template" drop constraint "workout_exercises_joint_pain_check";

alter table "public"."workout_exercises.template" drop constraint "workout_exercises_order_index_check";

alter table "public"."workout_exercises.template" drop constraint "workout_exercises_pump_check";

alter table "public"."workout_exercises.template" drop constraint "workout_exercises_soreness_from_last_check";

alter table "public"."workout_exercises.template" drop constraint "workout_exercises_superset_group_check";

alter table "public"."workouts.templates" drop constraint "workouts.templates_mesocycle_block_id_fkey";

alter table "public"."workouts.templates" drop constraint "workouts_pre_workout_fatigue_check";

alter table "public"."workout_exercises.template" drop constraint "workout_exercises.template_pkey";

alter table "public"."workouts.templates" drop constraint "workouts.templates_pkey";

drop index if exists "public"."workout_exercises.template_exercise_id_created_at_idx";

drop index if exists "public"."workout_exercises.template_pkey";

drop index if exists "public"."workout_exercises.template_recovery_gate_stimulus_score_idx";

drop index if exists "public"."workout_exercises.template_workout_id_order_index_idx";

drop index if exists "public"."workouts.templates_pkey";

drop table "public"."workout_exercises.template";

drop table "public"."workouts.templates";

alter table "public"."terra_data_payloads" enable row level security;

alter table "public"."workout_exercises" alter column "exercise_id" set data type text using "exercise_id"::text;

alter table "public"."workout_exercises" enable row level security;

alter table "public"."workout_sets" enable row level security;

alter table "public"."workout_exercises" add constraint "workout_exercises_exercise_id_fkey" FOREIGN KEY (exercise_id) REFERENCES exercise_library(exercise_uid) ON DELETE CASCADE not valid;

alter table "public"."workout_exercises" validate constraint "workout_exercises_exercise_id_fkey";

create policy "Workout creators can CRUD their exercises"
on "public"."workout_exercises"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM workouts w
  WHERE ((w.id = workout_exercises.workout_id) AND ((w.user_id = auth.uid()) OR is_admin())))))
with check ((EXISTS ( SELECT 1
   FROM workouts w
  WHERE ((w.id = workout_exercises.workout_id) AND ((w.user_id = auth.uid()) OR is_admin())))));


create policy "Workout exercise creators can CRUD their sets"
on "public"."workout_sets"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM (workout_exercises we
     JOIN workouts w ON ((w.id = we.workout_id)))
  WHERE ((we.id = workout_sets.workout_exercise_id) AND ((w.user_id = auth.uid()) OR is_admin())))))
with check ((EXISTS ( SELECT 1
   FROM (workout_exercises we
     JOIN workouts w ON ((w.id = we.workout_id)))
  WHERE ((we.id = workout_sets.workout_exercise_id) AND ((w.user_id = auth.uid()) OR is_admin())))));


create policy "Admins and users can CRUD their workouts"
on "public"."workouts"
as permissive
for all
to authenticated
using (((user_id = auth.uid()) OR is_admin()))
with check (((user_id = auth.uid()) OR is_admin()));


create policy "Everyone can retrieve public workouts"
on "public"."workouts"
as permissive
for select
to authenticated
using ((is_public = true));



