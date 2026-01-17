drop trigger if exists "trg_data_sources_audit" on "public"."data_sources";

drop trigger if exists "trg_ex_subs_audit" on "public"."exercise_substitutions";

drop trigger if exists "trg_health_metrics_audit" on "public"."health_metrics";

drop trigger if exists "trg_hr_audit" on "public"."heart_rate_samples";

drop trigger if exists "trg_program_blocks_audit" on "public"."mesocycle";

drop trigger if exists "trg_sleep_audit" on "public"."sleep_sessions";

drop trigger if exists "trg_custom_exercises_audit" on "public"."user_custom_exercises";

drop trigger if exists "trg_follows_audit" on "public"."user_follows";

drop trigger if exists "trg_uwp_audit" on "public"."user_warmup_preferences";

drop trigger if exists "trg_ws_audit" on "public"."warmup_schemes";

drop trigger if exists "trg_wex_audit" on "public"."workout_exercises";

drop trigger if exists "trg_wsets_audit" on "public"."workout_sets";

drop trigger if exists "trg_workouts_audit" on "public"."workouts";

revoke delete on table "public"."audit_log" from "anon";

revoke insert on table "public"."audit_log" from "anon";

revoke references on table "public"."audit_log" from "anon";

revoke select on table "public"."audit_log" from "anon";

revoke trigger on table "public"."audit_log" from "anon";

revoke truncate on table "public"."audit_log" from "anon";

revoke update on table "public"."audit_log" from "anon";

revoke delete on table "public"."audit_log" from "authenticated";

revoke insert on table "public"."audit_log" from "authenticated";

revoke references on table "public"."audit_log" from "authenticated";

revoke select on table "public"."audit_log" from "authenticated";

revoke trigger on table "public"."audit_log" from "authenticated";

revoke truncate on table "public"."audit_log" from "authenticated";

revoke update on table "public"."audit_log" from "authenticated";

revoke delete on table "public"."audit_log" from "service_role";

revoke insert on table "public"."audit_log" from "service_role";

revoke references on table "public"."audit_log" from "service_role";

revoke select on table "public"."audit_log" from "service_role";

revoke trigger on table "public"."audit_log" from "service_role";

revoke truncate on table "public"."audit_log" from "service_role";

revoke update on table "public"."audit_log" from "service_role";

revoke delete on table "public"."data_sources" from "anon";

revoke insert on table "public"."data_sources" from "anon";

revoke references on table "public"."data_sources" from "anon";

revoke select on table "public"."data_sources" from "anon";

revoke trigger on table "public"."data_sources" from "anon";

revoke truncate on table "public"."data_sources" from "anon";

revoke update on table "public"."data_sources" from "anon";

revoke delete on table "public"."data_sources" from "authenticated";

revoke insert on table "public"."data_sources" from "authenticated";

revoke references on table "public"."data_sources" from "authenticated";

revoke select on table "public"."data_sources" from "authenticated";

revoke trigger on table "public"."data_sources" from "authenticated";

revoke truncate on table "public"."data_sources" from "authenticated";

revoke update on table "public"."data_sources" from "authenticated";

revoke delete on table "public"."data_sources" from "service_role";

revoke insert on table "public"."data_sources" from "service_role";

revoke references on table "public"."data_sources" from "service_role";

revoke select on table "public"."data_sources" from "service_role";

revoke trigger on table "public"."data_sources" from "service_role";

revoke truncate on table "public"."data_sources" from "service_role";

revoke update on table "public"."data_sources" from "service_role";

revoke delete on table "public"."exercise_library" from "anon";

revoke insert on table "public"."exercise_library" from "anon";

revoke references on table "public"."exercise_library" from "anon";

revoke select on table "public"."exercise_library" from "anon";

revoke trigger on table "public"."exercise_library" from "anon";

revoke truncate on table "public"."exercise_library" from "anon";

revoke update on table "public"."exercise_library" from "anon";

revoke delete on table "public"."exercise_library" from "authenticated";

revoke insert on table "public"."exercise_library" from "authenticated";

revoke references on table "public"."exercise_library" from "authenticated";

revoke select on table "public"."exercise_library" from "authenticated";

revoke trigger on table "public"."exercise_library" from "authenticated";

revoke truncate on table "public"."exercise_library" from "authenticated";

revoke update on table "public"."exercise_library" from "authenticated";

revoke delete on table "public"."exercise_library" from "service_role";

revoke insert on table "public"."exercise_library" from "service_role";

revoke references on table "public"."exercise_library" from "service_role";

revoke select on table "public"."exercise_library" from "service_role";

revoke trigger on table "public"."exercise_library" from "service_role";

revoke truncate on table "public"."exercise_library" from "service_role";

revoke update on table "public"."exercise_library" from "service_role";

revoke delete on table "public"."exercise_substitutions" from "anon";

revoke insert on table "public"."exercise_substitutions" from "anon";

revoke references on table "public"."exercise_substitutions" from "anon";

revoke select on table "public"."exercise_substitutions" from "anon";

revoke trigger on table "public"."exercise_substitutions" from "anon";

revoke truncate on table "public"."exercise_substitutions" from "anon";

revoke update on table "public"."exercise_substitutions" from "anon";

revoke delete on table "public"."exercise_substitutions" from "authenticated";

revoke insert on table "public"."exercise_substitutions" from "authenticated";

revoke references on table "public"."exercise_substitutions" from "authenticated";

revoke select on table "public"."exercise_substitutions" from "authenticated";

revoke trigger on table "public"."exercise_substitutions" from "authenticated";

revoke truncate on table "public"."exercise_substitutions" from "authenticated";

revoke update on table "public"."exercise_substitutions" from "authenticated";

revoke delete on table "public"."exercise_substitutions" from "service_role";

revoke insert on table "public"."exercise_substitutions" from "service_role";

revoke references on table "public"."exercise_substitutions" from "service_role";

revoke select on table "public"."exercise_substitutions" from "service_role";

revoke trigger on table "public"."exercise_substitutions" from "service_role";

revoke truncate on table "public"."exercise_substitutions" from "service_role";

revoke update on table "public"."exercise_substitutions" from "service_role";

revoke delete on table "public"."health_metrics" from "anon";

revoke insert on table "public"."health_metrics" from "anon";

revoke references on table "public"."health_metrics" from "anon";

revoke select on table "public"."health_metrics" from "anon";

revoke trigger on table "public"."health_metrics" from "anon";

revoke truncate on table "public"."health_metrics" from "anon";

revoke update on table "public"."health_metrics" from "anon";

revoke delete on table "public"."health_metrics" from "authenticated";

revoke insert on table "public"."health_metrics" from "authenticated";

revoke references on table "public"."health_metrics" from "authenticated";

revoke select on table "public"."health_metrics" from "authenticated";

revoke trigger on table "public"."health_metrics" from "authenticated";

revoke truncate on table "public"."health_metrics" from "authenticated";

revoke update on table "public"."health_metrics" from "authenticated";

revoke delete on table "public"."health_metrics" from "service_role";

revoke insert on table "public"."health_metrics" from "service_role";

revoke references on table "public"."health_metrics" from "service_role";

revoke select on table "public"."health_metrics" from "service_role";

revoke trigger on table "public"."health_metrics" from "service_role";

revoke truncate on table "public"."health_metrics" from "service_role";

revoke update on table "public"."health_metrics" from "service_role";

revoke delete on table "public"."heart_rate_samples" from "anon";

revoke insert on table "public"."heart_rate_samples" from "anon";

revoke references on table "public"."heart_rate_samples" from "anon";

revoke select on table "public"."heart_rate_samples" from "anon";

revoke trigger on table "public"."heart_rate_samples" from "anon";

revoke truncate on table "public"."heart_rate_samples" from "anon";

revoke update on table "public"."heart_rate_samples" from "anon";

revoke delete on table "public"."heart_rate_samples" from "authenticated";

revoke insert on table "public"."heart_rate_samples" from "authenticated";

revoke references on table "public"."heart_rate_samples" from "authenticated";

revoke select on table "public"."heart_rate_samples" from "authenticated";

revoke trigger on table "public"."heart_rate_samples" from "authenticated";

revoke truncate on table "public"."heart_rate_samples" from "authenticated";

revoke update on table "public"."heart_rate_samples" from "authenticated";

revoke delete on table "public"."heart_rate_samples" from "service_role";

revoke insert on table "public"."heart_rate_samples" from "service_role";

revoke references on table "public"."heart_rate_samples" from "service_role";

revoke select on table "public"."heart_rate_samples" from "service_role";

revoke trigger on table "public"."heart_rate_samples" from "service_role";

revoke truncate on table "public"."heart_rate_samples" from "service_role";

revoke update on table "public"."heart_rate_samples" from "service_role";

revoke delete on table "public"."mesocycle" from "anon";

revoke insert on table "public"."mesocycle" from "anon";

revoke references on table "public"."mesocycle" from "anon";

revoke select on table "public"."mesocycle" from "anon";

revoke trigger on table "public"."mesocycle" from "anon";

revoke truncate on table "public"."mesocycle" from "anon";

revoke update on table "public"."mesocycle" from "anon";

revoke delete on table "public"."mesocycle" from "authenticated";

revoke insert on table "public"."mesocycle" from "authenticated";

revoke references on table "public"."mesocycle" from "authenticated";

revoke select on table "public"."mesocycle" from "authenticated";

revoke trigger on table "public"."mesocycle" from "authenticated";

revoke truncate on table "public"."mesocycle" from "authenticated";

revoke update on table "public"."mesocycle" from "authenticated";

revoke delete on table "public"."mesocycle" from "service_role";

revoke insert on table "public"."mesocycle" from "service_role";

revoke references on table "public"."mesocycle" from "service_role";

revoke select on table "public"."mesocycle" from "service_role";

revoke trigger on table "public"."mesocycle" from "service_role";

revoke truncate on table "public"."mesocycle" from "service_role";

revoke update on table "public"."mesocycle" from "service_role";

revoke delete on table "public"."mesocycle_template_exercises" from "anon";

revoke insert on table "public"."mesocycle_template_exercises" from "anon";

revoke references on table "public"."mesocycle_template_exercises" from "anon";

revoke select on table "public"."mesocycle_template_exercises" from "anon";

revoke trigger on table "public"."mesocycle_template_exercises" from "anon";

revoke truncate on table "public"."mesocycle_template_exercises" from "anon";

revoke update on table "public"."mesocycle_template_exercises" from "anon";

revoke delete on table "public"."mesocycle_template_exercises" from "authenticated";

revoke insert on table "public"."mesocycle_template_exercises" from "authenticated";

revoke references on table "public"."mesocycle_template_exercises" from "authenticated";

revoke select on table "public"."mesocycle_template_exercises" from "authenticated";

revoke trigger on table "public"."mesocycle_template_exercises" from "authenticated";

revoke truncate on table "public"."mesocycle_template_exercises" from "authenticated";

revoke update on table "public"."mesocycle_template_exercises" from "authenticated";

revoke delete on table "public"."mesocycle_template_exercises" from "service_role";

revoke insert on table "public"."mesocycle_template_exercises" from "service_role";

revoke references on table "public"."mesocycle_template_exercises" from "service_role";

revoke select on table "public"."mesocycle_template_exercises" from "service_role";

revoke trigger on table "public"."mesocycle_template_exercises" from "service_role";

revoke truncate on table "public"."mesocycle_template_exercises" from "service_role";

revoke update on table "public"."mesocycle_template_exercises" from "service_role";

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

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "anon";

revoke select on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."profiles" from "authenticated";

revoke insert on table "public"."profiles" from "authenticated";

revoke references on table "public"."profiles" from "authenticated";

revoke select on table "public"."profiles" from "authenticated";

revoke trigger on table "public"."profiles" from "authenticated";

revoke truncate on table "public"."profiles" from "authenticated";

revoke update on table "public"."profiles" from "authenticated";

revoke delete on table "public"."profiles" from "service_role";

revoke insert on table "public"."profiles" from "service_role";

revoke references on table "public"."profiles" from "service_role";

revoke select on table "public"."profiles" from "service_role";

revoke trigger on table "public"."profiles" from "service_role";

revoke truncate on table "public"."profiles" from "service_role";

revoke update on table "public"."profiles" from "service_role";

revoke delete on table "public"."release_notes" from "anon";

revoke insert on table "public"."release_notes" from "anon";

revoke references on table "public"."release_notes" from "anon";

revoke select on table "public"."release_notes" from "anon";

revoke trigger on table "public"."release_notes" from "anon";

revoke truncate on table "public"."release_notes" from "anon";

revoke update on table "public"."release_notes" from "anon";

revoke delete on table "public"."release_notes" from "authenticated";

revoke insert on table "public"."release_notes" from "authenticated";

revoke references on table "public"."release_notes" from "authenticated";

revoke select on table "public"."release_notes" from "authenticated";

revoke trigger on table "public"."release_notes" from "authenticated";

revoke truncate on table "public"."release_notes" from "authenticated";

revoke update on table "public"."release_notes" from "authenticated";

revoke delete on table "public"."release_notes" from "service_role";

revoke insert on table "public"."release_notes" from "service_role";

revoke references on table "public"."release_notes" from "service_role";

revoke select on table "public"."release_notes" from "service_role";

revoke trigger on table "public"."release_notes" from "service_role";

revoke truncate on table "public"."release_notes" from "service_role";

revoke update on table "public"."release_notes" from "service_role";

revoke delete on table "public"."sleep_sessions" from "anon";

revoke insert on table "public"."sleep_sessions" from "anon";

revoke references on table "public"."sleep_sessions" from "anon";

revoke select on table "public"."sleep_sessions" from "anon";

revoke trigger on table "public"."sleep_sessions" from "anon";

revoke truncate on table "public"."sleep_sessions" from "anon";

revoke update on table "public"."sleep_sessions" from "anon";

revoke delete on table "public"."sleep_sessions" from "authenticated";

revoke insert on table "public"."sleep_sessions" from "authenticated";

revoke references on table "public"."sleep_sessions" from "authenticated";

revoke select on table "public"."sleep_sessions" from "authenticated";

revoke trigger on table "public"."sleep_sessions" from "authenticated";

revoke truncate on table "public"."sleep_sessions" from "authenticated";

revoke update on table "public"."sleep_sessions" from "authenticated";

revoke delete on table "public"."sleep_sessions" from "service_role";

revoke insert on table "public"."sleep_sessions" from "service_role";

revoke references on table "public"."sleep_sessions" from "service_role";

revoke select on table "public"."sleep_sessions" from "service_role";

revoke trigger on table "public"."sleep_sessions" from "service_role";

revoke truncate on table "public"."sleep_sessions" from "service_role";

revoke update on table "public"."sleep_sessions" from "service_role";

revoke delete on table "public"."sync_conflicts" from "anon";

revoke insert on table "public"."sync_conflicts" from "anon";

revoke references on table "public"."sync_conflicts" from "anon";

revoke select on table "public"."sync_conflicts" from "anon";

revoke trigger on table "public"."sync_conflicts" from "anon";

revoke truncate on table "public"."sync_conflicts" from "anon";

revoke update on table "public"."sync_conflicts" from "anon";

revoke delete on table "public"."sync_conflicts" from "authenticated";

revoke insert on table "public"."sync_conflicts" from "authenticated";

revoke references on table "public"."sync_conflicts" from "authenticated";

revoke select on table "public"."sync_conflicts" from "authenticated";

revoke trigger on table "public"."sync_conflicts" from "authenticated";

revoke truncate on table "public"."sync_conflicts" from "authenticated";

revoke update on table "public"."sync_conflicts" from "authenticated";

revoke delete on table "public"."sync_conflicts" from "service_role";

revoke insert on table "public"."sync_conflicts" from "service_role";

revoke references on table "public"."sync_conflicts" from "service_role";

revoke select on table "public"."sync_conflicts" from "service_role";

revoke trigger on table "public"."sync_conflicts" from "service_role";

revoke truncate on table "public"."sync_conflicts" from "service_role";

revoke update on table "public"."sync_conflicts" from "service_role";

revoke delete on table "public"."terra_data_payloads" from "anon";

revoke insert on table "public"."terra_data_payloads" from "anon";

revoke references on table "public"."terra_data_payloads" from "anon";

revoke select on table "public"."terra_data_payloads" from "anon";

revoke trigger on table "public"."terra_data_payloads" from "anon";

revoke truncate on table "public"."terra_data_payloads" from "anon";

revoke update on table "public"."terra_data_payloads" from "anon";

revoke delete on table "public"."terra_data_payloads" from "authenticated";

revoke insert on table "public"."terra_data_payloads" from "authenticated";

revoke references on table "public"."terra_data_payloads" from "authenticated";

revoke select on table "public"."terra_data_payloads" from "authenticated";

revoke trigger on table "public"."terra_data_payloads" from "authenticated";

revoke truncate on table "public"."terra_data_payloads" from "authenticated";

revoke update on table "public"."terra_data_payloads" from "authenticated";

revoke delete on table "public"."terra_data_payloads" from "service_role";

revoke insert on table "public"."terra_data_payloads" from "service_role";

revoke references on table "public"."terra_data_payloads" from "service_role";

revoke select on table "public"."terra_data_payloads" from "service_role";

revoke trigger on table "public"."terra_data_payloads" from "service_role";

revoke truncate on table "public"."terra_data_payloads" from "service_role";

revoke update on table "public"."terra_data_payloads" from "service_role";

revoke delete on table "public"."terra_misc_payloads" from "anon";

revoke insert on table "public"."terra_misc_payloads" from "anon";

revoke references on table "public"."terra_misc_payloads" from "anon";

revoke select on table "public"."terra_misc_payloads" from "anon";

revoke trigger on table "public"."terra_misc_payloads" from "anon";

revoke truncate on table "public"."terra_misc_payloads" from "anon";

revoke update on table "public"."terra_misc_payloads" from "anon";

revoke delete on table "public"."terra_misc_payloads" from "authenticated";

revoke insert on table "public"."terra_misc_payloads" from "authenticated";

revoke references on table "public"."terra_misc_payloads" from "authenticated";

revoke select on table "public"."terra_misc_payloads" from "authenticated";

revoke trigger on table "public"."terra_misc_payloads" from "authenticated";

revoke truncate on table "public"."terra_misc_payloads" from "authenticated";

revoke update on table "public"."terra_misc_payloads" from "authenticated";

revoke delete on table "public"."terra_misc_payloads" from "service_role";

revoke insert on table "public"."terra_misc_payloads" from "service_role";

revoke references on table "public"."terra_misc_payloads" from "service_role";

revoke select on table "public"."terra_misc_payloads" from "service_role";

revoke trigger on table "public"."terra_misc_payloads" from "service_role";

revoke truncate on table "public"."terra_misc_payloads" from "service_role";

revoke update on table "public"."terra_misc_payloads" from "service_role";

revoke delete on table "public"."terra_users" from "anon";

revoke insert on table "public"."terra_users" from "anon";

revoke references on table "public"."terra_users" from "anon";

revoke select on table "public"."terra_users" from "anon";

revoke trigger on table "public"."terra_users" from "anon";

revoke truncate on table "public"."terra_users" from "anon";

revoke update on table "public"."terra_users" from "anon";

revoke delete on table "public"."terra_users" from "authenticated";

revoke insert on table "public"."terra_users" from "authenticated";

revoke references on table "public"."terra_users" from "authenticated";

revoke select on table "public"."terra_users" from "authenticated";

revoke trigger on table "public"."terra_users" from "authenticated";

revoke truncate on table "public"."terra_users" from "authenticated";

revoke update on table "public"."terra_users" from "authenticated";

revoke delete on table "public"."terra_users" from "service_role";

revoke insert on table "public"."terra_users" from "service_role";

revoke references on table "public"."terra_users" from "service_role";

revoke select on table "public"."terra_users" from "service_role";

revoke trigger on table "public"."terra_users" from "service_role";

revoke truncate on table "public"."terra_users" from "service_role";

revoke update on table "public"."terra_users" from "service_role";

revoke delete on table "public"."training_profile_configuration" from "anon";

revoke insert on table "public"."training_profile_configuration" from "anon";

revoke references on table "public"."training_profile_configuration" from "anon";

revoke select on table "public"."training_profile_configuration" from "anon";

revoke trigger on table "public"."training_profile_configuration" from "anon";

revoke truncate on table "public"."training_profile_configuration" from "anon";

revoke update on table "public"."training_profile_configuration" from "anon";

revoke delete on table "public"."training_profile_configuration" from "authenticated";

revoke insert on table "public"."training_profile_configuration" from "authenticated";

revoke references on table "public"."training_profile_configuration" from "authenticated";

revoke select on table "public"."training_profile_configuration" from "authenticated";

revoke trigger on table "public"."training_profile_configuration" from "authenticated";

revoke truncate on table "public"."training_profile_configuration" from "authenticated";

revoke update on table "public"."training_profile_configuration" from "authenticated";

revoke delete on table "public"."training_profile_configuration" from "service_role";

revoke insert on table "public"."training_profile_configuration" from "service_role";

revoke references on table "public"."training_profile_configuration" from "service_role";

revoke select on table "public"."training_profile_configuration" from "service_role";

revoke trigger on table "public"."training_profile_configuration" from "service_role";

revoke truncate on table "public"."training_profile_configuration" from "service_role";

revoke update on table "public"."training_profile_configuration" from "service_role";

revoke delete on table "public"."user_custom_exercises" from "anon";

revoke insert on table "public"."user_custom_exercises" from "anon";

revoke references on table "public"."user_custom_exercises" from "anon";

revoke select on table "public"."user_custom_exercises" from "anon";

revoke trigger on table "public"."user_custom_exercises" from "anon";

revoke truncate on table "public"."user_custom_exercises" from "anon";

revoke update on table "public"."user_custom_exercises" from "anon";

revoke delete on table "public"."user_custom_exercises" from "authenticated";

revoke insert on table "public"."user_custom_exercises" from "authenticated";

revoke references on table "public"."user_custom_exercises" from "authenticated";

revoke select on table "public"."user_custom_exercises" from "authenticated";

revoke trigger on table "public"."user_custom_exercises" from "authenticated";

revoke truncate on table "public"."user_custom_exercises" from "authenticated";

revoke update on table "public"."user_custom_exercises" from "authenticated";

revoke delete on table "public"."user_custom_exercises" from "service_role";

revoke insert on table "public"."user_custom_exercises" from "service_role";

revoke references on table "public"."user_custom_exercises" from "service_role";

revoke select on table "public"."user_custom_exercises" from "service_role";

revoke trigger on table "public"."user_custom_exercises" from "service_role";

revoke truncate on table "public"."user_custom_exercises" from "service_role";

revoke update on table "public"."user_custom_exercises" from "service_role";

revoke delete on table "public"."user_follows" from "anon";

revoke insert on table "public"."user_follows" from "anon";

revoke references on table "public"."user_follows" from "anon";

revoke select on table "public"."user_follows" from "anon";

revoke trigger on table "public"."user_follows" from "anon";

revoke truncate on table "public"."user_follows" from "anon";

revoke update on table "public"."user_follows" from "anon";

revoke delete on table "public"."user_follows" from "authenticated";

revoke insert on table "public"."user_follows" from "authenticated";

revoke references on table "public"."user_follows" from "authenticated";

revoke select on table "public"."user_follows" from "authenticated";

revoke trigger on table "public"."user_follows" from "authenticated";

revoke truncate on table "public"."user_follows" from "authenticated";

revoke update on table "public"."user_follows" from "authenticated";

revoke delete on table "public"."user_follows" from "service_role";

revoke insert on table "public"."user_follows" from "service_role";

revoke references on table "public"."user_follows" from "service_role";

revoke select on table "public"."user_follows" from "service_role";

revoke trigger on table "public"."user_follows" from "service_role";

revoke truncate on table "public"."user_follows" from "service_role";

revoke update on table "public"."user_follows" from "service_role";

revoke delete on table "public"."user_warmup_preferences" from "anon";

revoke insert on table "public"."user_warmup_preferences" from "anon";

revoke references on table "public"."user_warmup_preferences" from "anon";

revoke select on table "public"."user_warmup_preferences" from "anon";

revoke trigger on table "public"."user_warmup_preferences" from "anon";

revoke truncate on table "public"."user_warmup_preferences" from "anon";

revoke update on table "public"."user_warmup_preferences" from "anon";

revoke delete on table "public"."user_warmup_preferences" from "authenticated";

revoke insert on table "public"."user_warmup_preferences" from "authenticated";

revoke references on table "public"."user_warmup_preferences" from "authenticated";

revoke select on table "public"."user_warmup_preferences" from "authenticated";

revoke trigger on table "public"."user_warmup_preferences" from "authenticated";

revoke truncate on table "public"."user_warmup_preferences" from "authenticated";

revoke update on table "public"."user_warmup_preferences" from "authenticated";

revoke delete on table "public"."user_warmup_preferences" from "service_role";

revoke insert on table "public"."user_warmup_preferences" from "service_role";

revoke references on table "public"."user_warmup_preferences" from "service_role";

revoke select on table "public"."user_warmup_preferences" from "service_role";

revoke trigger on table "public"."user_warmup_preferences" from "service_role";

revoke truncate on table "public"."user_warmup_preferences" from "service_role";

revoke update on table "public"."user_warmup_preferences" from "service_role";

revoke delete on table "public"."warmup_schemes" from "anon";

revoke insert on table "public"."warmup_schemes" from "anon";

revoke references on table "public"."warmup_schemes" from "anon";

revoke select on table "public"."warmup_schemes" from "anon";

revoke trigger on table "public"."warmup_schemes" from "anon";

revoke truncate on table "public"."warmup_schemes" from "anon";

revoke update on table "public"."warmup_schemes" from "anon";

revoke delete on table "public"."warmup_schemes" from "authenticated";

revoke insert on table "public"."warmup_schemes" from "authenticated";

revoke references on table "public"."warmup_schemes" from "authenticated";

revoke select on table "public"."warmup_schemes" from "authenticated";

revoke trigger on table "public"."warmup_schemes" from "authenticated";

revoke truncate on table "public"."warmup_schemes" from "authenticated";

revoke update on table "public"."warmup_schemes" from "authenticated";

revoke delete on table "public"."warmup_schemes" from "service_role";

revoke insert on table "public"."warmup_schemes" from "service_role";

revoke references on table "public"."warmup_schemes" from "service_role";

revoke select on table "public"."warmup_schemes" from "service_role";

revoke trigger on table "public"."warmup_schemes" from "service_role";

revoke truncate on table "public"."warmup_schemes" from "service_role";

revoke update on table "public"."warmup_schemes" from "service_role";

revoke delete on table "public"."workout_exercises" from "anon";

revoke insert on table "public"."workout_exercises" from "anon";

revoke references on table "public"."workout_exercises" from "anon";

revoke select on table "public"."workout_exercises" from "anon";

revoke trigger on table "public"."workout_exercises" from "anon";

revoke truncate on table "public"."workout_exercises" from "anon";

revoke update on table "public"."workout_exercises" from "anon";

revoke delete on table "public"."workout_exercises" from "authenticated";

revoke insert on table "public"."workout_exercises" from "authenticated";

revoke references on table "public"."workout_exercises" from "authenticated";

revoke select on table "public"."workout_exercises" from "authenticated";

revoke trigger on table "public"."workout_exercises" from "authenticated";

revoke truncate on table "public"."workout_exercises" from "authenticated";

revoke update on table "public"."workout_exercises" from "authenticated";

revoke delete on table "public"."workout_exercises" from "service_role";

revoke insert on table "public"."workout_exercises" from "service_role";

revoke references on table "public"."workout_exercises" from "service_role";

revoke select on table "public"."workout_exercises" from "service_role";

revoke trigger on table "public"."workout_exercises" from "service_role";

revoke truncate on table "public"."workout_exercises" from "service_role";

revoke update on table "public"."workout_exercises" from "service_role";

revoke delete on table "public"."workout_sets" from "anon";

revoke insert on table "public"."workout_sets" from "anon";

revoke references on table "public"."workout_sets" from "anon";

revoke select on table "public"."workout_sets" from "anon";

revoke trigger on table "public"."workout_sets" from "anon";

revoke truncate on table "public"."workout_sets" from "anon";

revoke update on table "public"."workout_sets" from "anon";

revoke delete on table "public"."workout_sets" from "authenticated";

revoke insert on table "public"."workout_sets" from "authenticated";

revoke references on table "public"."workout_sets" from "authenticated";

revoke select on table "public"."workout_sets" from "authenticated";

revoke trigger on table "public"."workout_sets" from "authenticated";

revoke truncate on table "public"."workout_sets" from "authenticated";

revoke update on table "public"."workout_sets" from "authenticated";

revoke delete on table "public"."workout_sets" from "service_role";

revoke insert on table "public"."workout_sets" from "service_role";

revoke references on table "public"."workout_sets" from "service_role";

revoke select on table "public"."workout_sets" from "service_role";

revoke trigger on table "public"."workout_sets" from "service_role";

revoke truncate on table "public"."workout_sets" from "service_role";

revoke update on table "public"."workout_sets" from "service_role";

revoke delete on table "public"."workouts" from "anon";

revoke insert on table "public"."workouts" from "anon";

revoke references on table "public"."workouts" from "anon";

revoke select on table "public"."workouts" from "anon";

revoke trigger on table "public"."workouts" from "anon";

revoke truncate on table "public"."workouts" from "anon";

revoke update on table "public"."workouts" from "anon";

revoke delete on table "public"."workouts" from "authenticated";

revoke insert on table "public"."workouts" from "authenticated";

revoke references on table "public"."workouts" from "authenticated";

revoke select on table "public"."workouts" from "authenticated";

revoke trigger on table "public"."workouts" from "authenticated";

revoke truncate on table "public"."workouts" from "authenticated";

revoke update on table "public"."workouts" from "authenticated";

revoke delete on table "public"."workouts" from "service_role";

revoke insert on table "public"."workouts" from "service_role";

revoke references on table "public"."workouts" from "service_role";

revoke select on table "public"."workouts" from "service_role";

revoke trigger on table "public"."workouts" from "service_role";

revoke truncate on table "public"."workouts" from "service_role";

revoke update on table "public"."workouts" from "service_role";

create table "public"."health_sync_logs" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "sync_type" text not null,
    "success" boolean not null,
    "data_points" integer default 0,
    "errors" text[],
    "sync_date" timestamp with time zone not null,
    "metadata" jsonb,
    "created_at" timestamp with time zone default now()
);


alter table "public"."workout_sets" add column "is_user_value" boolean not null default false;

CREATE UNIQUE INDEX health_sync_logs_pkey ON public.health_sync_logs USING btree (id);

alter table "public"."health_sync_logs" add constraint "health_sync_logs_pkey" PRIMARY KEY using index "health_sync_logs_pkey";

alter table "public"."health_sync_logs" add constraint "health_sync_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."health_sync_logs" validate constraint "health_sync_logs_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.calculate_next_workout_targets(p_user_id uuid, p_exercise_id uuid, p_block_week integer)
 RETURNS TABLE(suggested_weight numeric, target_rir numeric, target_sets smallint, reasoning text)
 LANGUAGE plpgsql
AS $function$
declare
  v_inc numeric := 2.5;
  v_last_weight numeric;
  v_last_rir numeric;
  v_set_cap smallint := 6;
  v_pref_min smallint;
  v_pref_max smallint;
  v_recovery_gate_avg numeric;
begin
  select coalesce(default_weight_increment_kg,2.5),
         set_cap,
         preferred_rep_range_min, preferred_rep_range_max
  into v_inc, v_set_cap, v_pref_min, v_pref_max
  from exercises where id = p_exercise_id;

  select ws.weight_kg, ws.achieved_rir_raw
  into v_last_weight, v_last_rir
  from workout_sets ws
  join workout_exercises we on we.id = ws.workout_exercise_id
  join workouts w on w.id = we.workout_id
  where w.user_id = p_user_id and we.exercise_id = p_exercise_id and ws.is_effective_set = true
  order by w.started_at desc, we.order_index asc, ws.set_number desc
  limit 1;

  select avg(we.recovery_gate)::numeric
  into v_recovery_gate_avg
  from workout_exercises we
  join workouts w on w.id = we.workout_id
  where w.user_id = p_user_id and we.exercise_id = p_exercise_id;

  target_sets := least(3 + greatest(p_block_week - 1, 0), v_set_cap);
  target_rir := greatest(0, 3 - greatest(p_block_week - 1, 0));

  if v_recovery_gate_avg is not null and v_recovery_gate_avg >= 5 then
    target_rir := least(target_rir + 1, 4);
    target_sets := greatest(2, target_sets - 1);
  end if;

  if v_last_weight is null then
    suggested_weight := null;
    reasoning := 'No prior data; use onboarding estimate. Sets ramp by week, RIR tapers.';
  else
    if coalesce(v_last_rir, 3) <= 1 then
      suggested_weight := v_last_weight + v_inc;
      reasoning := format('Progressed: last RIR=%.1f, +%.2fkg.', v_last_rir, v_inc);
    else
      suggested_weight := v_last_weight;
      reasoning := format('Hold: last RIR=%.1f not near failure.', v_last_rir);
    end if;
  end if;

  return;
end; $function$
;

CREATE OR REPLACE FUNCTION public.check_deload_triggers(p_user_id uuid, p_exercise_id uuid)
 RETURNS TABLE(should_deload boolean, reason text)
 LANGUAGE plpgsql
AS $function$
declare
  v_gate_avg numeric;
  v_trend text;
  v_e1rm numeric;
  v_n int;
begin
  select avg(we.recovery_gate)::numeric into v_gate_avg
  from workout_exercises we
  join workouts w on w.id = we.workout_id
  where w.user_id = p_user_id and we.exercise_id = p_exercise_id;

  select trend_direction, avg_e1rm, sessions_count into v_trend, v_e1rm, v_n
  from get_exercise_trend(p_user_id, p_exercise_id, 14);

  if coalesce(v_gate_avg,0) >= 5 then
    return query select true, format('High recovery gate (%.2f) suggests fatigue/joint issues.', v_gate_avg);
    return;
  end if;

  if v_trend = 'declining' and coalesce(v_n,0) >= 3 then
    return query select true, 'Performance trend declining over recent sessions.';
    return;
  end if;

  return query select false, 'No deload trigger.';
end; $function$
;

CREATE OR REPLACE FUNCTION public.debug_user_data(user_id_param uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'mesocycles', (
            SELECT jsonb_agg(m.*)
            FROM mesocycle m
            WHERE m.user_id = user_id_param
        ),
        'mesocycle_exercises', (
            SELECT jsonb_agg(me.*)
            FROM mesocycle m
            INNER JOIN "mesocycle.exercises" me ON m.id = me.mesocycle_block_id
            WHERE m.user_id = user_id_param
        ),
        'workouts', (
            SELECT jsonb_agg(w.*)
            FROM mesocycle m
            INNER JOIN workouts w ON m.id = w.mesocycle_block_id
            WHERE m.user_id = user_id_param
        ),
        'workout_exercises', (
            SELECT jsonb_agg(we.*)
            FROM mesocycle m
            INNER JOIN workouts w ON m.id = w.mesocycle_block_id
            INNER JOIN workout_exercises we ON w.id = we.workout_id
            WHERE m.user_id = user_id_param
        ),
        'workout_sets', (
            SELECT jsonb_agg(ws.*)
            FROM mesocycle m
            INNER JOIN workouts w ON m.id = w.mesocycle_block_id
            INNER JOIN workout_exercises we ON w.id = we.workout_id
            INNER JOIN workout_sets ws ON we.id = ws.workout_exercise_id
            WHERE m.user_id = user_id_param
        )
    ) INTO result;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_user_account(user_id_to_delete uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    deletion_results JSONB := '[]'::JSONB;
    table_name TEXT;
    tables_to_clean TEXT[] := ARRAY[
        'user_profiles',
        'user_conditions',
        'user_medications',
        'medication_doses',
        'user_metrics',
        'user_priorities',
        'health_scores',
        'onboarding_progress',
        'screen_analytics',
        'device_connections',
        'sync_conflicts',
        'mesocycle',
        'workouts',
        'workout_exercises',
        'workout_sets',
        'training_profile_configuration',
        'custom_exercises',
        'data_retention_requests'
    ];
    rows_deleted INTEGER;
    error_count INTEGER := 0;
    success_count INTEGER := 0;
BEGIN
    -- Verify the user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id_to_delete) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found',
            'user_id', user_id_to_delete
        );
    END IF;

    -- Delete from all custom tables
    FOREACH table_name IN ARRAY tables_to_clean
    LOOP
        BEGIN
            EXECUTE format('DELETE FROM %I WHERE user_id = $1', table_name) 
            USING user_id_to_delete;
            
            GET DIAGNOSTICS rows_deleted = ROW_COUNT;
            
            deletion_results := deletion_results || jsonb_build_object(
                'table', table_name,
                'success', true,
                'rows_deleted', rows_deleted
            );
            
            success_count := success_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            deletion_results := deletion_results || jsonb_build_object(
                'table', table_name,
                'success', false,
                'error', SQLERRM
            );
            
            error_count := error_count + 1;
        END;
    END LOOP;

    -- Delete from audit_log (this table might have different column names)
    BEGIN
        DELETE FROM audit_log WHERE user_id = user_id_to_delete;
        GET DIAGNOSTICS rows_deleted = ROW_COUNT;
        
        deletion_results := deletion_results || jsonb_build_object(
            'table', 'audit_log',
            'success', true,
            'rows_deleted', rows_deleted
        );
        
        success_count := success_count + 1;
        
    EXCEPTION WHEN OTHERS THEN
        deletion_results := deletion_results || jsonb_build_object(
            'table', 'audit_log',
            'success', false,
            'error', SQLERRM
        );
        
        error_count := error_count + 1;
    END;

    -- Hard delete the user from auth.users (requires admin privileges)
    BEGIN
        DELETE FROM auth.users WHERE id = user_id_to_delete;
        
        IF FOUND THEN
            RETURN jsonb_build_object(
                'success', true,
                'message', 'User account deleted successfully',
                'user_id', user_id_to_delete,
                'tables_processed', success_count + error_count,
                'tables_successful', success_count,
                'tables_failed', error_count,
                'deletion_results', deletion_results
            );
        ELSE
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Failed to delete user from auth.users',
                'user_id', user_id_to_delete,
                'deletion_results', deletion_results
            );
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Failed to delete user from auth.users: ' || SQLERRM,
            'user_id', user_id_to_delete,
            'deletion_results', deletion_results
        );
    END;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.find_functions_with_text(search_text text)
 RETURNS TABLE(schema_name text, function_name text, definition text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT n.nspname::TEXT, p.proname::TEXT, pg_get_functiondef(p.oid)::TEXT
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.prosrc ILIKE '%' || search_text || '%'
    AND n.nspname NOT IN ('pg_catalog', 'information_schema')
    ORDER BY n.nspname, p.proname;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_comprehensive_mesocycle_data(user_id_param uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$DECLARE
    result JSONB;
BEGIN
    WITH comprehensive_data AS (
        SELECT 
            m.id as mesocycle_id,
            m.name as mesocycle_name,
            m.goal,
            m.status,
            m.start_date,
            m.num_weeks,
            m.days_per_week,
            m.muscle_emphasis,
            m.split_type,
            me.id as mesocycle_exercise_id,
            me.exercise_id,
            me.week_plans,
            el.exercise_canonical_id,
            el.exercise_display_name_en,
            el.exercise_name_aliases,
            el.exercise_status,
            el.exercise_keywords,
            el.exercise_tags,
            el.exercise_primary_movement_pattern,
            el.exercise_mechanics_type,
            el.exercise_kinematic_context,
            w.id as workout_id,
            w.started_at as workout_started_at,
            w.completed_at as workout_completed_at,
            w.notes as workout_notes,
            we.id as workout_exercise_id,
            we.exercise_id as workout_exercise_exercise_id,
            we.order_index,
            we.superset_group,
            we.soreness_from_last,
            we.pump,
            we.effort,
            we.joint_pain,
            we.recovery_gate,
            we.stimulus_score,
            ws.id as workout_set_id,
            ws.set_number,
            ws.target_reps,
            ws.actual_reps,
            ws.weight_kg,
            ws.target_rir_raw,
            ws.achieved_rir_raw,
            ws.e1rm,
            ws.total_volume
        FROM 
            mesocycle m
        LEFT JOIN 
            "mesocycle.exercises" me ON m.id = me.mesocycle_block_id
        LEFT JOIN 
            exercise_library el ON me.exercise_id::text = el.exercise_uid
        LEFT JOIN 
            workouts w ON m.id = w.mesocycle_block_id
        LEFT JOIN 
            workout_exercises we ON w.id = we.workout_id
        LEFT JOIN 
            workout_sets ws ON we.id = ws.workout_exercise_id
        WHERE 
            m.user_id = user_id_param
        ORDER BY 
            m.start_date DESC,
            w.started_at,
            we.order_index,
            ws.set_number
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'mesocycle_id', mesocycle_id,
            'mesocycle_name', mesocycle_name,
            'goal', goal,
            'status', status,
            'start_date', start_date,
            'num_weeks', num_weeks,
            'days_per_week', days_per_week,
            'muscle_emphasis', muscle_emphasis,
            'split_type', split_type,
            'mesocycle_exercise_id', mesocycle_exercise_id,
            'exercise_id', exercise_id,
            'exercise', jsonb_build_object(
                'canonical_id', exercise_canonical_id,
                'display_name_en', exercise_display_name_en,
                'aliases', exercise_name_aliases,
                'status', exercise_status,
                'keywords', exercise_keywords,
                'tags', exercise_tags,
                'primary_movement_pattern', exercise_primary_movement_pattern,
                'mechanics_type', exercise_mechanics_type,
                'kinematic_context', exercise_kinematic_context
            ),
            'week_plans', week_plans,
            'workout_id', workout_id,
            'workout_started_at', workout_started_at,
            'workout_completed_at', workout_completed_at,
            'workout_notes', workout_notes,
            'workout_exercise_id', workout_exercise_id,
            'workout_exercise_exercise_id', workout_exercise_exercise_id,
            'order_index', order_index,
            'superset_group', superset_group,
            'soreness_from_last', soreness_from_last,
            'pump', pump,
            'effort', effort,
            'joint_pain', joint_pain,
            'recovery_gate', recovery_gate,
            'stimulus_score', stimulus_score,
            'workout_set_id', workout_set_id,
            'set_number', set_number,
            'target_reps', target_reps,
            'actual_reps', actual_reps,
            'weight_kg', weight_kg,
            'target_rir_raw', target_rir_raw,
            'achieved_rir_raw', achieved_rir_raw,
            'e1rm', e1rm,
            'total_volume', total_volume
        )
    ) INTO result
    FROM comprehensive_data;
    
    RETURN COALESCE(result, '[]'::jsonb);
END;$function$
;

CREATE OR REPLACE FUNCTION public.get_exercise_library_simple()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'exercise_uid', el.exercise_uid,
            'exercise_display_name_en', el.exercise_display_name_en,
            'exercise_muscle_groups_simple', el.exercise_muscle_groups_simple
        )
        ORDER BY el.exercise_display_name_en
    ) INTO result
    FROM exercise_library el
    WHERE el.exercise_status = 'active';

    RETURN COALESCE(result, '[]'::jsonb);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_exercise_trend(p_user_id uuid, p_exercise_id uuid, p_days_back integer DEFAULT 14)
 RETURNS TABLE(trend_direction text, avg_e1rm numeric, sessions_count integer)
 LANGUAGE sql
AS $function$
  with per_session as (
    select
      w.user_id,
      we.exercise_id,
      w.started_at as session_date,
      max(ws.e1rm) as session_best_e1rm
    from workout_sets ws
    join workout_exercises we on we.id = ws.workout_exercise_id
    join workouts w on w.id = we.workout_id
    where w.user_id = p_user_id and we.exercise_id = p_exercise_id
      and ws.is_effective_set = true
    group by w.user_id, we.exercise_id, w.started_at
  ),
  recent as (
    select avg(session_best_e1rm) as a, count(*) as n
    from per_session
    where session_date >= now() - make_interval(days => p_days_back)
  ),
  prior as (
    select avg(session_best_e1rm) as a
    from per_session
    where session_date <  now() - make_interval(days => p_days_back)
      and session_date >= now() - make_interval(days => p_days_back*2)
  )
  select
    case
      when r.a is null then 'insufficient_data'
      when p.a is null then 'maintaining'
      when r.a > p.a then 'improving'
      when r.a < p.a then 'declining'
      else 'maintaining'
    end as trend_direction,
    r.a as avg_e1rm,
    r.n as sessions_count
  from recent r left join prior p on true
$function$
;

CREATE OR REPLACE FUNCTION public.get_mesocycle_details(mesocycle_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$DECLARE
    result JSONB;
BEGIN
    WITH workout_sets_agg AS (
        SELECT
            workout_exercise_id,
            jsonb_agg(to_jsonb(ws.*) ORDER BY ws.set_number) as sets_data
        FROM workout_sets ws
        GROUP BY workout_exercise_id
    ),
    workout_exercises_agg AS (
        SELECT
            w.id as workout_id,
            jsonb_agg(
                to_jsonb(we.*) || jsonb_build_object(
                    'exercise', COALESCE(to_jsonb(el.*), '{}'::jsonb),
                    'sets', COALESCE(wsa.sets_data, '[]'::jsonb)
                )
                ORDER BY we.order_index
            ) as exercises_data
        FROM workouts w
        LEFT JOIN workout_exercises we ON we.workout_id = w.id
        LEFT JOIN exercise_library el ON we.exercise_id::text = el.exercise_uid
        LEFT JOIN workout_sets_agg wsa ON wsa.workout_exercise_id = we.id
        WHERE w.mesocycle_block_id = mesocycle_id
        GROUP BY w.id
    ),
    workouts_agg AS (
        SELECT
            w.mesocycle_block_id,
            jsonb_agg(
                to_jsonb(w.*) || jsonb_build_object('exercises', COALESCE(wea.exercises_data, '[]'::jsonb))
                ORDER BY w.started_at DESC
            ) as workouts_data
        FROM workouts w
        LEFT JOIN workout_exercises_agg wea ON wea.workout_id = w.id
        WHERE w.mesocycle_block_id = mesocycle_id
        GROUP BY w.mesocycle_block_id
    )
    SELECT jsonb_agg(
        to_jsonb(m.*) || jsonb_build_object('workouts', COALESCE(wa.workouts_data, '[]'::jsonb))
        ORDER BY m.start_date DESC
    ) INTO result
    FROM mesocycle m
    LEFT JOIN workouts_agg wa ON wa.mesocycle_block_id = m.id
    WHERE m.id = mesocycle_id;

    RETURN result;
END;$function$
;

CREATE OR REPLACE FUNCTION public.get_mesocycle_exercises_only(user_id_param uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'mesocycle_id', m.id,
            'mesocycle_name', m.name,
            'goal', m.goal,
            'status', m.status,
            'start_date', m.start_date,
            'num_weeks', m.num_weeks,
            'days_per_week', m.days_per_week,
            'muscle_emphasis', m.muscle_emphasis,
            'split_type', m.split_type,
            'mesocycle_exercise_id', me.id,
            'exercise_id', me.exercise_id,
            'exercise', jsonb_build_object(
                'canonical_id', el.exercise_canonical_id,
                'display_name_en', el.exercise_display_name_en,
                'aliases', el.exercise_name_aliases,
                'status', el.exercise_status,
                'keywords', el.exercise_keywords,
                'tags', el.exercise_tags,
                'primary_movement_pattern', el.exercise_primary_movement_pattern,
                'mechanics_type', el.exercise_mechanics_type,
                'kinematic_context', el.exercise_kinematic_context
            ),
            'week_plans', me.week_plans,
            'workout_id', NULL,
            'workout_started_at', NULL,
            'workout_completed_at', NULL,
            'workout_notes', NULL,
            'workout_exercise_id', NULL,
            'workout_exercise_exercise_id', NULL,
            'order_index', NULL,
            'superset_group', NULL,
            'soreness_from_last', NULL,
            'pump', NULL,
            'effort', NULL,
            'joint_pain', NULL,
            'recovery_gate', NULL,
            'stimulus_score', NULL,
            'workout_set_id', NULL,
            'set_number', NULL,
            'target_reps', NULL,
            'actual_reps', NULL,
            'weight_kg', NULL,
            'target_rir_raw', NULL,
            'achieved_rir_raw', NULL,
            'e1rm', NULL,
            'total_volume', NULL
        )
    ) INTO result
    FROM 
        mesocycle m
    LEFT JOIN 
        "mesocycle.exercises" me ON m.id = me.mesocycle_block_id
    LEFT JOIN 
        exercise_library el ON me.exercise_id::text = el.exercise_uid
    WHERE 
        m.user_id = user_id_param
        AND me.id IS NOT NULL
    ORDER BY 
        m.start_date DESC,
        me.id;
    
    RETURN COALESCE(result, '[]'::jsonb);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_mesocycle_templates_and_exercises()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    templates_result JSONB;
    exercises_result JSONB;
    final_result JSONB;
BEGIN
    -- Get mesocycle templates
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', mt.id,
            'name', mt.name,
            'start_date', mt.start_date,
            'num_weeks', mt.num_weeks,
            'goal', mt.goal,
            'status', mt.status,
            'deload_week', mt.deload_week,
            'created_at', mt.created_at,
            'last_modified', mt.last_modified,
            'days_per_week', mt.days_per_week,
            'muscle_emphasis', mt.muscle_emphasis,
            'length_weeks', mt.length_weeks,
            'minutes_per_session', mt.minutes_per_session,
            'weight_now', mt.weight_now,
            'joint_pain_now', mt.joint_pain_now,
            'split_type', mt.split_type,
            'exercise_variation', mt.exercise_variation
        )
        ORDER BY mt.created_at DESC
    ) INTO templates_result
    FROM mesocycle.templates mt;

    -- Get exercise library data
    SELECT jsonb_agg(
        jsonb_build_object(
            'exercise_uid', el.exercise_uid,
            'exercise_canonical_id', el.exercise_canonical_id,
            'exercise_display_name_en', el.exercise_display_name_en,
            'exercise_name_aliases', el.exercise_name_aliases,
            'exercise_status', el.exercise_status,
            'exercise_keywords', el.exercise_keywords,
            'exercise_tags', el.exercise_tags,
            'exercise_primary_movement_pattern', el.exercise_primary_movement_pattern,
            'exercise_mechanics_type', el.exercise_mechanics_type,
            'exercise_kinematic_context', el.exercise_kinematic_context,
            'exercise_muscle_groups_simple', el.exercise_muscle_groups_simple,
            'created_at', el.created_at,
            'updated_at', el.updated_at
        )
        ORDER BY el.exercise_display_name_en
    ) INTO exercises_result
    FROM exercise_library el
    WHERE el.exercise_status = 'active';

    -- Combine both results
    SELECT jsonb_build_object(
        'mesocycle_templates', COALESCE(templates_result, '[]'::jsonb),
        'exercise_library', COALESCE(exercises_result, '[]'::jsonb),
        'total_templates', jsonb_array_length(COALESCE(templates_result, '[]'::jsonb)),
        'total_exercises', jsonb_array_length(COALESCE(exercises_result, '[]'::jsonb))
    ) INTO final_result;

    RETURN final_result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_mesocycle_templates_only()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    result JSONB;
BEGIN
    -- Ensure the table exists first
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mesocycle' AND table_name = 'templates') THEN
        CREATE SCHEMA IF NOT EXISTS mesocycle;
        
        CREATE TABLE mesocycle.templates (
            id uuid NOT NULL DEFAULT gen_random_uuid(),
            name text NOT NULL,
            start_date date NOT NULL,
            num_weeks smallint NOT NULL,
            goal public.mesocycle_goal_enum NOT NULL,
            status public.mesocycle_status_enum NOT NULL DEFAULT 'planning'::mesocycle_status_enum,
            deload_week smallint GENERATED ALWAYS AS (num_weeks) STORED NULL,
            created_at timestamp with time zone NOT NULL DEFAULT now(),
            last_modified timestamp with time zone NOT NULL DEFAULT now(),
            days_per_week numeric NULL,
            muscle_emphasis text[] NULL,
            length_weeks numeric NULL,
            minutes_per_session numeric NULL,
            weight_now numeric NULL,
            joint_pain_now text[] NULL,
            split_type text NULL,
            exercise_variation numeric NULL,
            CONSTRAINT mesocycle_templates_pkey PRIMARY KEY (id),
            CONSTRAINT program_blocks_num_weeks_check CHECK (
                (num_weeks >= 4) AND (num_weeks <= 8)
            )
        ) TABLESPACE pg_default;
    END IF;

    SELECT jsonb_agg(
        jsonb_build_object(
            'id', mt.id,
            'name', mt.name,
            'start_date', mt.start_date,
            'num_weeks', mt.num_weeks,
            'goal', mt.goal,
            'status', mt.status,
            'deload_week', mt.deload_week,
            'created_at', mt.created_at,
            'last_modified', mt.last_modified,
            'days_per_week', mt.days_per_week,
            'muscle_emphasis', mt.muscle_emphasis,
            'length_weeks', mt.length_weeks,
            'minutes_per_session', mt.minutes_per_session,
            'weight_now', mt.weight_now,
            'joint_pain_now', mt.joint_pain_now,
            'split_type', mt.split_type,
            'exercise_variation', mt.exercise_variation
        )
        ORDER BY mt.created_at DESC
    ) INTO result
    FROM mesocycle.templates mt;

    RETURN COALESCE(result, '[]'::jsonb);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_mesocycle_templates_with_exercises()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    result JSONB;
BEGIN
    -- First, ensure the mesocycle.templates table exists
    -- If it doesn't exist, create it based on the provided schema
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mesocycle' AND table_name = 'templates') THEN
        -- Create the mesocycle schema if it doesn't exist
        CREATE SCHEMA IF NOT EXISTS mesocycle;
        
        -- Create the mesocycle.templates table
        CREATE TABLE mesocycle.templates (
            id uuid NOT NULL DEFAULT gen_random_uuid(),
            name text NOT NULL,
            start_date date NOT NULL,
            num_weeks smallint NOT NULL,
            goal public.mesocycle_goal_enum NOT NULL,
            status public.mesocycle_status_enum NOT NULL DEFAULT 'planning'::mesocycle_status_enum,
            deload_week smallint GENERATED ALWAYS AS (num_weeks) STORED NULL,
            created_at timestamp with time zone NOT NULL DEFAULT now(),
            last_modified timestamp with time zone NOT NULL DEFAULT now(),
            days_per_week numeric NULL,
            muscle_emphasis text[] NULL,
            length_weeks numeric NULL,
            minutes_per_session numeric NULL,
            weight_now numeric NULL,
            joint_pain_now text[] NULL,
            split_type text NULL,
            exercise_variation numeric NULL,
            CONSTRAINT mesocycle_templates_pkey PRIMARY KEY (id),
            CONSTRAINT program_blocks_num_weeks_check CHECK (
                (num_weeks >= 4) AND (num_weeks <= 8)
            )
        ) TABLESPACE pg_default;
        
        -- Create indexes for performance
        CREATE INDEX idx_mesocycle_templates_goal ON mesocycle.templates(goal);
        CREATE INDEX idx_mesocycle_templates_status ON mesocycle.templates(status);
        CREATE INDEX idx_mesocycle_templates_num_weeks ON mesocycle.templates(num_weeks);
    END IF;

    -- Fetch mesocycle templates with exercise library data
    SELECT jsonb_agg(
        jsonb_build_object(
            'template_id', mt.id,
            'template_name', mt.name,
            'start_date', mt.start_date,
            'num_weeks', mt.num_weeks,
            'goal', mt.goal,
            'status', mt.status,
            'deload_week', mt.deload_week,
            'created_at', mt.created_at,
            'last_modified', mt.last_modified,
            'days_per_week', mt.days_per_week,
            'muscle_emphasis', mt.muscle_emphasis,
            'length_weeks', mt.length_weeks,
            'minutes_per_session', mt.minutes_per_session,
            'weight_now', mt.weight_now,
            'joint_pain_now', mt.joint_pain_now,
            'split_type', mt.split_type,
            'exercise_variation', mt.exercise_variation,
            'exercise_library', exercise_data
        )
        ORDER BY mt.created_at DESC
    ) INTO result
    FROM mesocycle.templates mt
    LEFT JOIN LATERAL (
        SELECT jsonb_agg(
            jsonb_build_object(
                'exercise_uid', el.exercise_uid,
                'exercise_canonical_id', el.exercise_canonical_id,
                'exercise_display_name_en', el.exercise_display_name_en,
                'exercise_name_aliases', el.exercise_name_aliases,
                'exercise_status', el.exercise_status,
                'exercise_keywords', el.exercise_keywords,
                'exercise_tags', el.exercise_tags,
                'exercise_primary_movement_pattern', el.exercise_primary_movement_pattern,
                'exercise_mechanics_type', el.exercise_mechanics_type,
                'exercise_kinematic_context', el.exercise_kinematic_context,
                'exercise_muscle_groups_simple', el.exercise_muscle_groups_simple
            )
            ORDER BY el.exercise_display_name_en
        ) as exercise_data
        FROM exercise_library el
        WHERE el.exercise_status = 'active'
    ) exercises ON true;

    RETURN COALESCE(result, '[]'::jsonb);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_mesocycles_summary(user_id_param uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$DECLARE
    result JSONB;
BEGIN
    WITH mesocycle_workout_counts AS (
        SELECT
            m.id as mesocycle_id,
            COUNT(w.id) as total_workouts
        FROM mesocycle m
        LEFT JOIN workouts w ON w.mesocycle_block_id = m.id
        GROUP BY m.id
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', m.id,
            'name', m.name,
            'num_weeks', m.num_weeks,
            'total_workouts', COALESCE(mwc.total_workouts, 0)
        )
        ORDER BY m.start_date DESC
    ) INTO result
    FROM mesocycle m
    LEFT JOIN mesocycle_workout_counts mwc ON mwc.mesocycle_id = m.id
    WHERE m.user_id = user_id_param;

    RETURN COALESCE(result, '[]'::jsonb);
END;$function$
;

CREATE OR REPLACE FUNCTION public.get_mesocycles_with_sets(user_id_param uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'mesocycle_id', m.id,
            'mesocycle_name', m.name,
            'goal', m.goal,
            'status', m.status,
            'start_date', m.start_date,
            'num_weeks', m.num_weeks,
            'days_per_week', m.days_per_week,
            'muscle_emphasis', m.muscle_emphasis,
            'split_type', m.split_type,
            'workouts', workout_data
        )
        ORDER BY m.start_date DESC
    ) INTO result
    FROM mesocycle m
    LEFT JOIN LATERAL (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', w.id,
                'started_at', w.started_at,
                'completed_at', w.completed_at,
                'notes', w.notes,
                'exercises', exercise_data,
                'workout_day', w.workout_day,
                'workout_week', w.workout_week
            )
            ORDER BY w.started_at DESC
        ) as workout_data
        FROM workouts w
        LEFT JOIN LATERAL (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'exercise_id', we.exercise_id,
                    'exercise', jsonb_build_object(
                        'canonical_id', el.exercise_canonical_id,
                        'display_name_en', el.exercise_display_name_en,
                        'aliases', el.exercise_name_aliases,
                        'status', el.exercise_status,
                        'keywords', el.exercise_keywords,
                        'tags', el.exercise_tags,
                        'primary_movement_pattern', el.exercise_primary_movement_pattern,
                        'mechanics_type', el.exercise_mechanics_type,
                        'kinematic_context', el.exercise_kinematic_context,
                        'muscle_groups', el.exercise_muscle_groups_simple
                    ),
                    'workout_exercise_id', we.id,
                    'order_index', we.order_index,
                    'superset_group', we.superset_group,
                    'soreness_from_last', we.soreness_from_last,
                    'pump', we.pump,
                    'effort', we.effort,
                    'joint_pain', we.joint_pain,
                    'recovery_gate', we.recovery_gate,
                    'stimulus_score', we.stimulus_score,
                    'sets', set_data
                )
                ORDER BY we.order_index
            ) as exercise_data
            FROM workout_exercises we
            LEFT JOIN exercise_library el ON we.exercise_id::text = el.exercise_uid
            LEFT JOIN LATERAL (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'workout_set_id', ws.id,
                        'set_number', ws.set_number,
                        'target_reps', ws.target_reps,
                        'actual_reps', ws.actual_reps,
                        'weight_kg', ws.weight_kg,
                        'target_rir_raw', ws.target_rir_raw,
                        'achieved_rir_raw', ws.achieved_rir_raw,
                        'e1rm', ws.e1rm,
                        'total_volume', ws.total_volume,
                        'status',ws.status
                    )
                    ORDER BY ws.set_number
                ) as set_data
                FROM workout_sets ws
                WHERE ws.workout_exercise_id = we.id
            ) sets ON true
            WHERE we.workout_id = w.id
        ) exercises ON true
        WHERE w.mesocycle_block_id = m.id
    ) workouts ON true
    WHERE m.user_id = user_id_param;
    
    RETURN COALESCE(result, '[]'::jsonb);
END;$function$
;

CREATE OR REPLACE FUNCTION public.get_mesocycles_with_sets_new(user_id_param uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', m.id,
            'name', m.name,
            'goal', m.goal,
            'status', m.status,
            'start_date', m.start_date,
            'num_weeks', m.num_weeks,
            'days_per_week', m.days_per_week,
            'muscle_emphasis', m.muscle_emphasis,
            'split_type', m.split_type,
            'workouts', workout_data
        )
        ORDER BY m.start_date DESC
    ) INTO result
    FROM mesocycle m
    LEFT JOIN LATERAL (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', w.id,
                'started_at', w.started_at,
                'completed_at', w.completed_at,
                'notes', w.notes,
                'exercises', exercise_data,
                'workout_day', w.workout_day,
                'workout_week', w.workout_week
            )
            ORDER BY w.started_at DESC
        ) as workout_data
        FROM workouts w
        LEFT JOIN LATERAL (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'exercise_id', we.exercise_id,
                    'exercise', jsonb_build_object(
                        'exercise_canonical_id', el.exercise_canonical_id,
                        'exercise_display_name_en', el.exercise_display_name_en,
                        'exercise_name_aliases', el.exercise_name_aliases,
                        'exercise_status', el.exercise_status,
                        'exercise_keywords', el.exercise_keywords,
                        'exercise_tags', el.exercise_tags,
                        'exercise_primary_movement_pattern', el.exercise_primary_movement_pattern,
                        'exercise_mechanics_type', el.exercise_mechanics_type,
                        'exercise_kinematic_context', el.exercise_kinematic_context,
                        'exercise_muscle_groups_simple', el.exercise_muscle_groups_simple
                    ),
                    'workout_exercise_id', we.id,
                    'order_index', we.order_index,
                    'superset_group', we.superset_group,
                    'soreness_from_last', we.soreness_from_last,
                    'pump', we.pump,
                    'effort', we.effort,
                    'joint_pain', we.joint_pain,
                    'recovery_gate', we.recovery_gate,
                    'stimulus_score', we.stimulus_score,
                    'sets', set_data
                )
                ORDER BY we.order_index
            ) as exercise_data
            FROM workout_exercises we
            LEFT JOIN exercise_library el ON we.exercise_id::text = el.exercise_uid
            LEFT JOIN LATERAL (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', ws.id,
                        'set_number', ws.set_number,
                        'target_reps', ws.target_reps,
                        'actual_reps', ws.actual_reps,
                        'weight_kg', ws.weight_kg,
                        'target_rir_raw', ws.target_rir_raw,
                        'achieved_rir_raw', ws.achieved_rir_raw,
                        'e1rm', ws.e1rm,
                        'total_volume', ws.total_volume,
                        'status',ws.status
                    )
                    ORDER BY ws.set_number
                ) as set_data
                FROM workout_sets ws
                WHERE ws.workout_exercise_id = we.id
            ) sets ON true
            WHERE we.workout_id = w.id
        ) exercises ON true
        WHERE w.mesocycle_block_id = m.id
    ) workouts ON true
    WHERE m.user_id = user_id_param;
    
    RETURN COALESCE(result, '[]'::jsonb);
END;$function$
;

CREATE OR REPLACE FUNCTION public.get_workouts_with_exercises_and_sets_by_week(mesocycle_id_param uuid, workout_week_param integer)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$DECLARE
    result JSONB;
BEGIN
    WITH workouts AS (
        SELECT *
        FROM workouts
        WHERE mesocycle_block_id = mesocycle_id_param
          AND workout_week = workout_week_param
    ),
    workout_exercises_with_details AS (
        SELECT
            we.*,
            to_jsonb(e.*) as exercise
        FROM workout_exercises we
        INNER JOIN exercise_library e ON e.exercise_uid = we.exercise_id::text
        WHERE we.workout_id IN (SELECT id FROM workouts)
    ),
    workout_sets_by_exercise AS (
        SELECT
            workout_exercise_id,
            jsonb_agg(to_jsonb(ws.*) ORDER BY ws.set_number) as sets
        FROM workout_sets ws
        WHERE ws.workout_exercise_id IN (SELECT id FROM workout_exercises_with_details)
        GROUP BY workout_exercise_id
    ),
    exercises_with_sets AS (
        SELECT
            wed.*,
            COALESCE(wsbe.sets, '[]'::jsonb) as sets
        FROM workout_exercises_with_details wed
        LEFT JOIN workout_sets_by_exercise wsbe ON wsbe.workout_exercise_id = wed.id
    ),
    workouts_with_exercises AS (
        SELECT
            w.*,
            COALESCE(
                jsonb_agg(to_jsonb(ews.*) ORDER BY ews.order_index) FILTER (WHERE ews.id IS NOT NULL),
                '[]'::jsonb
            ) as exercises
        FROM workouts w
        LEFT JOIN exercises_with_sets ews ON ews.workout_id = w.id
        GROUP BY w.id, w.user_id, w.mesocycle_block_id, w.started_at, w.completed_at,
                 w.abandoned_at, w.abandon_reason, w.pre_workout_fatigue, w.location,
                 w.is_public, w.notes, w.created_at, w.last_modified, w.workout_day, w.workout_week
    )
    SELECT jsonb_agg(to_jsonb(wwe.*) ORDER BY wwe.workout_day) INTO result
    FROM workouts_with_exercises wwe;

    RETURN COALESCE(result, '[]'::jsonb);
END;$function$
;

CREATE OR REPLACE FUNCTION public.handle_calibration_set_progression()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    next_set_record RECORD;
    current_set_type TEXT;
    current_set_number INTEGER;
    current_weight DECIMAL(8,2);
    current_reps INTEGER;
BEGIN
    -- Only proceed if status changed to 'done'
    IF NEW.status != 'done' OR OLD.status = 'done' THEN
        RETURN NEW;
    END IF;
    
    -- Get current set details
    current_set_type := NEW.set_type;
    current_set_number := NEW.set_number;
    current_weight := NEW.weight_kg;
    current_reps := NEW.actual_reps;
    
    -- Handle calibration set (set 1) completion
    IF current_set_type = 'calibration' AND current_set_number = 1 THEN
        -- Find the next set (set 2) for the same exercise
        SELECT * INTO next_set_record
        FROM workout_sets 
        WHERE workout_exercise_id = NEW.workout_exercise_id 
          AND set_number = 2
          AND set_type = 'working'
        LIMIT 1;
        
        -- If next set exists and has no weight/reps set, copy from calibration set
        IF next_set_record.id IS NOT NULL AND 
           (next_set_record.weight_kg IS NULL OR next_set_record.weight_kg = 0) AND
           (next_set_record.actual_reps IS NULL OR next_set_record.actual_reps = 0) THEN
            
            UPDATE workout_sets 
            SET 
                weight_kg = current_weight,
                actual_reps = current_reps,
                last_modified = NOW()
            WHERE id = next_set_record.id;
            
            RAISE NOTICE 'Copied calibration set data to set 2: weight=%, reps=%', current_weight, current_reps;
        END IF;
        
    -- Handle validation set (set 2) completion  
    ELSIF current_set_type = 'validation' AND current_set_number = 2 THEN
        -- Find the next set (set 3) for the same exercise
        SELECT * INTO next_set_record
        FROM workout_sets 
        WHERE workout_exercise_id = NEW.workout_exercise_id 
          AND set_number = 3
          AND set_type = 'working'
        LIMIT 1;
        
        -- If next set exists and has no weight/reps set, apply progression
        IF next_set_record.id IS NOT NULL AND 
           (next_set_record.weight_kg IS NULL OR next_set_record.weight_kg = 0) AND
           (next_set_record.actual_reps IS NULL OR next_set_record.actual_reps = 0) THEN
            
            -- Apply progression: weight + 5kg, reps + 2
            UPDATE workout_sets 
            SET 
                weight_kg = COALESCE(current_weight, 0) + 5,
                actual_reps = COALESCE(current_reps, 0) + 2,
                last_modified = NOW()
            WHERE id = next_set_record.id;
            
            RAISE NOTICE 'Applied validation set progression to set 3: weight=%, reps=%', 
                COALESCE(current_weight, 0) + 5, COALESCE(current_reps, 0) + 2;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_delete_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
    DELETE FROM public.profiles WHERE user_id = OLD.id;
    RAISE LOG 'Profile deleted for user: %', OLD.id;
    RETURN OLD;
END;$function$
;

CREATE OR REPLACE FUNCTION public.handle_deleted_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    user_record RECORD;
BEGIN
    -- Store the OLD record for debugging
    user_record := OLD;
    
    -- Log deletion for debugging
    RAISE LOG 'Deleting user with ID: %', OLD.id;
    
    -- Delete from profiles using the correct ID reference
    DELETE FROM public.profiles WHERE user_id = OLD.id;
    
    -- Log success
    RAISE LOG 'Successfully deleted profile for user ID: %', OLD.id;
    
    RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$BEGIN
    -- Log the record structure for debugging
    RAISE LOG 'NEW record: %', NEW;
    
    -- First check if a profile already exists to avoid duplicates
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = NEW.id) THEN
        INSERT INTO public.profiles (
            user_id, 
            email, 
            timezone,
            onboarding_completed,
            research_consent,
            created_at,
            is_admin,
            last_modified
        )
        VALUES (
            NEW.id,  -- Use NEW.id which is the primary key in auth.users
            COALESCE(NEW.email, ''), -- Ensure email has a fallback value
            00,
            FALSE,
            FALSE,
            NOW(),
            FALSE,
             NOW()
        );
    END IF;
    
    RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.handle_simple_calibration()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only process calibration sets that were just completed
  IF NEW.is_calibration = TRUE 
     AND NEW.actual_reps IS NOT NULL 
     AND NEW.weight_kg IS NOT NULL
     AND (OLD IS NULL OR OLD.actual_reps IS NULL OR OLD.weight_kg IS NULL) THEN
    
    -- Update Set 2 with same weight and reps from Set 1
    UPDATE workout_sets 
    SET 
      weight_kg = NEW.weight_kg,
      target_reps = NEW.actual_reps,
      last_modified = NOW()
    WHERE workout_exercise_id = NEW.workout_exercise_id 
      AND set_number = 2;
    
    -- Log what happened
    RAISE NOTICE 'Calibration: Updated Set 2 with weight % kg and % reps for exercise %', 
                 NEW.weight_kg, NEW.actual_reps, NEW.workout_exercise_id;
    
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$SELECT EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
)$function$
;

CREATE OR REPLACE FUNCTION public.progressive_overload_algo_v3()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    next_set_record RECORD;
    current_set_type TEXT;
    current_set_number INTEGER;
    current_weight DECIMAL(8,2);
    current_reps INTEGER;
    current_workout_week INTEGER;
    current_workout_day INTEGER;
    current_exercise_id TEXT;
    current_mesocycle_id TEXT;
    week2_set_record RECORD;
    week3_set_record RECORD;
    exercise_mechanics_type TEXT;
    target_reps_min INTEGER;
    target_reps_max INTEGER;
    weekly_progression_rate DECIMAL(5,3);
    mesocycle_weeks INTEGER;
    completed_current_week_sets INTEGER;
    total_current_week_sets INTEGER;
    next_week INTEGER;
BEGIN
    -- Only proceed if status changed to 'done'
    IF NEW.status != 'done' OR OLD.status = 'done' THEN
        RETURN NEW;
    END IF;
    
    -- Get current set details
    current_set_type := NEW.set_type;
    current_set_number := NEW.set_number;
    current_weight := NEW.weight_kg;
    current_reps := NEW.actual_reps;
    
    -- Get workout and exercise context
    SELECT w.workout_week, w.workout_day, we.exercise_id::text, w.mesocycle_block_id::text, el.exercise_mechanics_type
    INTO current_workout_week, current_workout_day, current_exercise_id, current_mesocycle_id, exercise_mechanics_type
    FROM workout_sets ws
    JOIN workout_exercises we ON ws.workout_exercise_id = we.id
    JOIN workouts w ON we.workout_id = w.id
    JOIN exercise_library el ON we.exercise_id::text = el.exercise_uid
    WHERE ws.id = NEW.id;
    
    -- Set target reps based on exercise mechanics type
    IF exercise_mechanics_type = 'compound' THEN
        target_reps_min := 8;
        target_reps_max := 12;
    ELSIF exercise_mechanics_type = 'isolation' THEN
        target_reps_min := 12;
        target_reps_max := 20;
    ELSE
        -- Default to compound if mechanics type is unknown
        target_reps_min := 8;
        target_reps_max := 12;
    END IF;
    
    -- Handle calibration set (set 1) completion
    IF current_set_type = 'calibration' AND current_set_number = 1 THEN
        -- Find the next set (set 2) for the same exercise
        SELECT * INTO next_set_record
        FROM workout_sets 
        WHERE workout_exercise_id = NEW.workout_exercise_id 
          AND set_number = 2
          AND set_type = 'validation'
        LIMIT 1;
        
        -- If next set exists and has no weight/reps set, calculate working weight from calibration
        IF next_set_record.id IS NOT NULL AND 
           (next_set_record.weight_kg IS NULL OR next_set_record.weight_kg = 0) AND
           (next_set_record.actual_reps IS NULL OR next_set_record.actual_reps = 0) THEN
            
            -- Calculate working weight based on calibration reps
            DECLARE
                working_weight DECIMAL(8,2);
                validation_reps INTEGER;
            BEGIN
                IF current_reps >= 11 AND current_reps <= 12 THEN
                    working_weight := current_weight * 0.88;
                ELSIF current_reps = 10 THEN
                    working_weight := current_weight * 0.85;
                ELSIF current_reps >= 8 AND current_reps <= 9 THEN
                    working_weight := current_weight * 0.82;
                ELSE
                    -- Fallback to original weight if reps are outside expected range
                    working_weight := current_weight;
                END IF;
                
                -- Set target reps for validation set based on exercise mechanics
                IF exercise_mechanics_type = 'compound' THEN
                    validation_reps := 10;
                ELSIF exercise_mechanics_type = 'isolation' THEN
                    validation_reps := 15;
                ELSE
                    validation_reps := 10; -- Default to compound
                END IF;
                
                UPDATE workout_sets 
                SET 
                    weight_kg = working_weight,
                    actual_reps = validation_reps,
                    last_modified = NOW()
                WHERE id = next_set_record.id;
                
                RAISE NOTICE 'Calculated validation set weight from calibration: original_weight=%, calibration_reps=%, working_weight=%, validation_reps=%', 
                    current_weight, current_reps, working_weight, validation_reps;
            END;
        END IF;
        
    -- Handle validation set (set 2) completion  
    ELSIF current_set_type = 'validation' AND current_set_number = 2 THEN
        -- Find the next set (set 3) for the same exercise
        SELECT * INTO next_set_record
        FROM workout_sets 
        WHERE workout_exercise_id = NEW.workout_exercise_id 
          AND set_number = 3
          AND set_type = 'working'
        LIMIT 1;
        
        -- If next set exists and has no weight/reps set, calculate working weight based on validation performance
        IF next_set_record.id IS NOT NULL AND 
           (next_set_record.weight_kg IS NULL OR next_set_record.weight_kg = 0) AND
           (next_set_record.actual_reps IS NULL OR next_set_record.actual_reps = 0) THEN
            
            -- Calculate working weight based on validation set performance
            DECLARE
                working_weight DECIMAL(8,2);
                working_reps INTEGER;
            BEGIN
                -- Set target reps for working set based on exercise mechanics
                IF exercise_mechanics_type = 'compound' THEN
                    working_reps := 10;
                ELSIF exercise_mechanics_type = 'isolation' THEN
                    working_reps := 15;
                ELSE
                    working_reps := 10; -- Default to compound
                END IF;
                
                -- Calculate working weight based on validation reps vs target range
                IF current_reps > target_reps_max THEN
                    -- Reps above range: increase weight by 3%
                    working_weight := current_weight * 1.03;
                ELSIF current_reps >= target_reps_min AND current_reps <= target_reps_max THEN
                    -- Reps in range: keep same weight
                    working_weight := current_weight;
                ELSE
                    -- Reps below range: decrease weight by 3%
                    working_weight := current_weight * 0.97;
                END IF;
                
                UPDATE workout_sets 
                SET 
                    weight_kg = working_weight,
                    actual_reps = working_reps,
                    last_modified = NOW()
                WHERE id = next_set_record.id;
                
                RAISE NOTICE 'Calculated working set from validation: validation_weight=%, validation_reps=%, target_range=% to %, working_weight=%, working_reps=%', 
                    current_weight, current_reps, target_reps_min, target_reps_max, working_weight, working_reps;
            END;
        END IF;
        
    -- Handle working set 3 completion in week 1 - copy to all sets in week 2
    ELSIF current_set_type = 'working' AND current_set_number = 3 AND current_workout_week = 1 THEN
        -- Find all sets for the same exercise in week 2
        FOR week2_set_record IN
            SELECT ws.*
            FROM workout_sets ws
            JOIN workout_exercises we ON ws.workout_exercise_id = we.id
            JOIN workouts w ON we.workout_id = w.id
            WHERE w.mesocycle_block_id::text = current_mesocycle_id
              AND w.workout_week = 2
              AND w.workout_day = current_workout_day
              AND we.exercise_id::text = current_exercise_id
              AND ws.set_type = 'working'
        LOOP
            -- Update week 2 sets with the same weight and reps as week 1 set 3
            UPDATE workout_sets 
            SET 
                weight_kg = current_weight,
                actual_reps = current_reps,
                last_modified = NOW()
            WHERE id = week2_set_record.id;
            
            RAISE NOTICE 'Copied week 1 set 3 data to week 2 set %: weight=%, reps=%', 
                week2_set_record.set_number, current_weight, current_reps;
        END LOOP;
        
    -- Handle completion of all working sets in any week - copy to next week with progression
    ELSIF current_set_type = 'working' AND current_workout_week >= 2 THEN
        -- Check if this is the last/complete set for this exercise in current week
        SELECT COUNT(*) INTO total_current_week_sets
        FROM workout_sets ws
        JOIN workout_exercises we ON ws.workout_exercise_id = we.id
        JOIN workouts w ON we.workout_id = w.id
        WHERE w.mesocycle_block_id::text = current_mesocycle_id
          AND w.workout_week = current_workout_week
          AND w.workout_day = current_workout_day
          AND we.exercise_id::text = current_exercise_id
          AND ws.set_type = 'working';
        
        -- Check how many working sets are completed
        SELECT COUNT(*) INTO completed_current_week_sets
        FROM workout_sets ws
        JOIN workout_exercises we ON ws.workout_exercise_id = we.id
        JOIN workouts w ON we.workout_id = w.id
        WHERE w.mesocycle_block_id::text = current_mesocycle_id
          AND w.workout_week = current_workout_week
          AND w.workout_day = current_workout_day
          AND we.exercise_id::text = current_exercise_id
          AND ws.set_type = 'working'
          AND ws.status = 'done';
        
        -- Get weighted average for week 2 sets (using last set completed)
        DECLARE
            weighted_weight DECIMAL(8,2);
            weighted_reps INTEGER;
        BEGIN
            weighted_weight := current_weight;
            weighted_reps := current_reps;
            
            -- Get mesocycle length
            SELECT mc.num_weeks 
            INTO mesocycle_weeks
            FROM mesocycle mc
            WHERE mc.id::text = current_mesocycle_id;
            
            -- If mesocycle length can't be determined, default to 6 weeks (moderate)
            IF mesocycle_weeks IS NULL OR mesocycle_weeks < 4 THEN
                mesocycle_weeks := 6;
            END IF;
            
            -- Determine weekly progression rate based on mesocycle length and exercise mechanics
            IF mesocycle_weeks <= 4 THEN
                -- Aggressive progression for 4-week mesocycle
                IF exercise_mechanics_type = 'compound' THEN
                    weekly_progression_rate := 0.030; -- 3.0% per week
                ELSE
                    weekly_progression_rate := 0.025; -- 2.5% per week
                END IF;
            ELSIF mesocycle_weeks <= 6 THEN
                -- Moderate progression for 5-6 week mesocycle
                IF exercise_mechanics_type = 'compound' THEN
                    weekly_progression_rate := 0.025; -- 2.5% per week
                ELSE
                    weekly_progression_rate := 0.020; -- 2.0% per week
                END IF;
            ELSE
                -- Conservative progression for 7-8 week mesocycle
                IF exercise_mechanics_type = 'compound' THEN
                    weekly_progression_rate := 0.020; -- 2.0% per week
                ELSE
                    weekly_progression_rate := 0.015; -- 1.5% per week
                END IF;
            END IF;
            
            -- Calculate next week number
            next_week := current_workout_week + 1;
            
            -- Only proceed if all working sets of current week are completed
            IF (completed_current_week_sets = total_current_week_sets) AND total_current_week_sets > 0 THEN
                -- Calculate progression-adjusted weight for next week
                DECLARE
                    next_week_weight DECIMAL(8,2);
                    next_week_reps INTEGER;
                    next_week_record RECORD;
                BEGIN
                    next_week_weight := weighted_weight * (1 + weekly_progression_rate);
                    
                    -- Keep same reps as current week (rep progression handled separately if needed)
                    next_week_reps := weighted_reps;
                    
                    -- Find all sets for the same exercise in next week
                    FOR next_week_record IN
                        SELECT ws.*
                        FROM workout_sets ws
                        JOIN workout_exercises we ON ws.workout_exercise_id = we.id
                        JOIN workouts w ON we.workout_id = w.id
                        WHERE w.mesocycle_block_id::text = current_mesocycle_id
                          AND w.workout_week = next_week
                          AND w.workout_day = current_workout_day
                          AND we.exercise_id::text = current_exercise_id
                          AND ws.set_type ='working'
                    LOOP
                        -- Update next week sets with progressive overload applied
                        UPDATE workout_sets 
                        SET 
                            weight_kg = next_week_weight,
                            actual_reps = next_week_reps,
                            last_modified = NOW()
                        WHERE id = next_week_record.id;
                        
                        RAISE NOTICE 'Applied weekly progression to week % set %: original_weight=%, progression_rate=%, next_weight=%, reps=%', 
                            next_week, next_week_record.set_number, weighted_weight, weekly_progression_rate, next_week_weight, next_week_reps;
                    END LOOP;
                    
                    RAISE NOTICE 'Week % to Week % progression completed: mechanics=%, mesocycle_weeks=%, rate=%', 
                        current_workout_week, next_week, exercise_mechanics_type, mesocycle_weeks, weekly_progression_rate;
                END;
            END IF;
        END;
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.setup_calibration_sets(p_workout_exercise_id uuid, p_total_sets integer DEFAULT 3)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Create Set 1: Calibration set
  INSERT INTO workout_sets (
    workout_exercise_id,
    set_number,
    set_type,
    is_calibration,
    target_reps,
    status
  ) VALUES (
    p_workout_exercise_id,
    1,
    'calibration',
    TRUE,
    10,  -- Target 10 reps for calibration
    'not_started'
  );
  
  -- Create remaining sets: Working sets
  FOR i IN 2..p_total_sets LOOP
    INSERT INTO workout_sets (
      workout_exercise_id,
      set_number,
      set_type,
      is_calibration,
      status
    ) VALUES (
      p_workout_exercise_id,
      i,
      'working',
      TRUE,  -- Still part of calibration process
      'not_started'
    );
  END LOOP;
  
  RAISE NOTICE 'Created % calibration sets for workout exercise %', p_total_sets, p_workout_exercise_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_training_config_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_modified = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.util_actor_id()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Return the current user ID from the JWT token
    -- This is equivalent to auth.uid() but with a more descriptive name
    RETURN auth.uid();
END;
$function$
;

CREATE OR REPLACE FUNCTION public.util_audit_log()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
  _actor uuid := util_actor_id();
  _pk uuid;
begin
  if TG_OP='INSERT' then
    begin _pk := NEW.id; exception when others then _pk := null; end;
    insert into audit_log(table_name,operation,actor_id,row_pk,new_data)
    values (TG_TABLE_NAME,TG_OP,_actor,_pk,to_jsonb(NEW));
    return NEW;
  elsif TG_OP='UPDATE' then
    begin _pk := NEW.id; exception when others then _pk := null; end;
    insert into audit_log(table_name,operation,actor_id,row_pk,old_data,new_data)
    values (TG_TABLE_NAME,TG_OP,_actor,_pk,to_jsonb(OLD),to_jsonb(NEW));
    return NEW;
  else
    begin _pk := OLD.id; exception when others then _pk := null; end;
    insert into audit_log(table_name,operation,actor_id,row_pk,old_data)
    values (TG_TABLE_NAME,TG_OP,_actor,_pk,to_jsonb(OLD));
    return OLD;
  end if;
end; $function$
;

CREATE OR REPLACE FUNCTION public.util_touch_last_modified()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.last_modified := now();
  return new;
end; $function$
;

CREATE OR REPLACE FUNCTION public.validate_block_week_plans()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
  weeks int;
  last_key text;
  wk jsonb;
  rir int;
  sets int;
begin
  select num_weeks into weeks from program_blocks where id = coalesce(NEW.block_id, OLD.block_id) for update;
  last_key := 'week' || weeks::text;
  wk := NEW.week_plans -> last_key;
  if wk is null then
    raise exception 'week_plans must include key %', last_key;
  end if;
  rir := (wk ->> 'target_rir')::int;
  sets := (wk ->> 'target_sets')::int;
  if rir is null or sets is null then
    raise exception 'Final week must include target_rir and target_sets';
  end if;
  if not (rir >= 3 or sets <= 2) then
    raise exception 'Final week must represent deload (target_rir >= 3 OR target_sets <= 2)';
  end if;
  return NEW;
end; $function$
;

CREATE TRIGGER trg_data_sources_audit AFTER INSERT OR DELETE OR UPDATE ON public.data_sources FOR EACH ROW EXECUTE FUNCTION util_audit_log();
ALTER TABLE "public"."data_sources" DISABLE TRIGGER "trg_data_sources_audit";

CREATE TRIGGER trg_ex_subs_audit AFTER INSERT OR DELETE OR UPDATE ON public.exercise_substitutions FOR EACH ROW EXECUTE FUNCTION util_audit_log();
ALTER TABLE "public"."exercise_substitutions" DISABLE TRIGGER "trg_ex_subs_audit";

CREATE TRIGGER trg_health_metrics_audit AFTER INSERT OR DELETE OR UPDATE ON public.health_metrics FOR EACH ROW EXECUTE FUNCTION util_audit_log();
ALTER TABLE "public"."health_metrics" DISABLE TRIGGER "trg_health_metrics_audit";

CREATE TRIGGER trg_hr_audit AFTER INSERT OR DELETE OR UPDATE ON public.heart_rate_samples FOR EACH ROW EXECUTE FUNCTION util_audit_log();
ALTER TABLE "public"."heart_rate_samples" DISABLE TRIGGER "trg_hr_audit";

CREATE TRIGGER trg_program_blocks_audit AFTER INSERT OR DELETE OR UPDATE ON public.mesocycle FOR EACH ROW EXECUTE FUNCTION util_audit_log();
ALTER TABLE "public"."mesocycle" DISABLE TRIGGER "trg_program_blocks_audit";

CREATE TRIGGER trg_sleep_audit AFTER INSERT OR DELETE OR UPDATE ON public.sleep_sessions FOR EACH ROW EXECUTE FUNCTION util_audit_log();
ALTER TABLE "public"."sleep_sessions" DISABLE TRIGGER "trg_sleep_audit";

CREATE TRIGGER trg_custom_exercises_audit AFTER INSERT OR DELETE OR UPDATE ON public.user_custom_exercises FOR EACH ROW EXECUTE FUNCTION util_audit_log();
ALTER TABLE "public"."user_custom_exercises" DISABLE TRIGGER "trg_custom_exercises_audit";

CREATE TRIGGER trg_follows_audit AFTER INSERT OR DELETE OR UPDATE ON public.user_follows FOR EACH ROW EXECUTE FUNCTION util_audit_log();
ALTER TABLE "public"."user_follows" DISABLE TRIGGER "trg_follows_audit";

CREATE TRIGGER trg_uwp_audit AFTER INSERT OR DELETE OR UPDATE ON public.user_warmup_preferences FOR EACH ROW EXECUTE FUNCTION util_audit_log();
ALTER TABLE "public"."user_warmup_preferences" DISABLE TRIGGER "trg_uwp_audit";

CREATE TRIGGER trg_ws_audit AFTER INSERT OR DELETE OR UPDATE ON public.warmup_schemes FOR EACH ROW EXECUTE FUNCTION util_audit_log();
ALTER TABLE "public"."warmup_schemes" DISABLE TRIGGER "trg_ws_audit";

CREATE TRIGGER trg_wex_audit AFTER INSERT OR DELETE OR UPDATE ON public.workout_exercises FOR EACH ROW EXECUTE FUNCTION util_audit_log();
ALTER TABLE "public"."workout_exercises" DISABLE TRIGGER "trg_wex_audit";

CREATE TRIGGER trg_wsets_audit AFTER INSERT OR DELETE OR UPDATE ON public.workout_sets FOR EACH ROW EXECUTE FUNCTION util_audit_log();
ALTER TABLE "public"."workout_sets" DISABLE TRIGGER "trg_wsets_audit";

CREATE TRIGGER trg_workouts_audit AFTER INSERT OR DELETE OR UPDATE ON public.workouts FOR EACH ROW EXECUTE FUNCTION util_audit_log();
ALTER TABLE "public"."workouts" DISABLE TRIGGER "trg_workouts_audit";



