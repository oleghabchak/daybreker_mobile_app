drop trigger if exists "trg_pt_audit" on "public"."mesocycle_templates";

drop trigger if exists "trg_pt_touch" on "public"."mesocycle_templates";

drop policy "pt_owner_write" on "public"."mesocycle_templates";

drop policy "pt_public_read" on "public"."mesocycle_templates";

revoke delete on table "public"."mesocycle_templates" from "anon";

revoke insert on table "public"."mesocycle_templates" from "anon";

revoke references on table "public"."mesocycle_templates" from "anon";

revoke select on table "public"."mesocycle_templates" from "anon";

revoke trigger on table "public"."mesocycle_templates" from "anon";

revoke truncate on table "public"."mesocycle_templates" from "anon";

revoke update on table "public"."mesocycle_templates" from "anon";

revoke delete on table "public"."mesocycle_templates" from "authenticated";

revoke insert on table "public"."mesocycle_templates" from "authenticated";

revoke references on table "public"."mesocycle_templates" from "authenticated";

revoke select on table "public"."mesocycle_templates" from "authenticated";

revoke trigger on table "public"."mesocycle_templates" from "authenticated";

revoke truncate on table "public"."mesocycle_templates" from "authenticated";

revoke update on table "public"."mesocycle_templates" from "authenticated";

revoke delete on table "public"."mesocycle_templates" from "service_role";

revoke insert on table "public"."mesocycle_templates" from "service_role";

revoke references on table "public"."mesocycle_templates" from "service_role";

revoke select on table "public"."mesocycle_templates" from "service_role";

revoke trigger on table "public"."mesocycle_templates" from "service_role";

revoke truncate on table "public"."mesocycle_templates" from "service_role";

revoke update on table "public"."mesocycle_templates" from "service_role";

alter table "public"."mesocycle_templates" drop constraint "program_templates_created_by_user_id_fkey";

alter table "public"."mesocycle_templates" drop constraint "program_templates_num_weeks_check";

alter table "public"."mesocycle_templates" drop constraint "program_templates_pkey";

drop index if exists "public"."idx_pt_creator";

drop index if exists "public"."program_templates_pkey";

drop table "public"."mesocycle_templates";


