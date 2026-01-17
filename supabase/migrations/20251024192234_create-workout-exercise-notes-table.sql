create table "public"."workout_exercise_notes" (
    "workout_exercise_id" uuid not null,
    "profile_note_id" uuid not null
);


alter table "public"."workout_exercise_notes" enable row level security;

CREATE INDEX idx_workout_exercise_notes_profile_note_id ON public.workout_exercise_notes USING btree (profile_note_id);

CREATE INDEX idx_workout_exercise_notes_workout_exercise_id ON public.workout_exercise_notes USING btree (workout_exercise_id);

CREATE UNIQUE INDEX workout_exercise_notes_pkey ON public.workout_exercise_notes USING btree (workout_exercise_id, profile_note_id);

alter table "public"."workout_exercise_notes" add constraint "workout_exercise_notes_pkey" PRIMARY KEY using index "workout_exercise_notes_pkey";

alter table "public"."workout_exercise_notes" add constraint "workout_exercise_notes_profile_note_id_fkey" FOREIGN KEY (profile_note_id) REFERENCES profile_notes(id) ON DELETE CASCADE not valid;

alter table "public"."workout_exercise_notes" validate constraint "workout_exercise_notes_profile_note_id_fkey";

alter table "public"."workout_exercise_notes" add constraint "workout_exercise_notes_workout_exercise_id_fkey" FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id) ON DELETE CASCADE not valid;

alter table "public"."workout_exercise_notes" validate constraint "workout_exercise_notes_workout_exercise_id_fkey";

grant delete on table "public"."workout_exercise_notes" to "anon";

grant insert on table "public"."workout_exercise_notes" to "anon";

grant references on table "public"."workout_exercise_notes" to "anon";

grant select on table "public"."workout_exercise_notes" to "anon";

grant trigger on table "public"."workout_exercise_notes" to "anon";

grant truncate on table "public"."workout_exercise_notes" to "anon";

grant update on table "public"."workout_exercise_notes" to "anon";

grant delete on table "public"."workout_exercise_notes" to "authenticated";

grant insert on table "public"."workout_exercise_notes" to "authenticated";

grant references on table "public"."workout_exercise_notes" to "authenticated";

grant select on table "public"."workout_exercise_notes" to "authenticated";

grant trigger on table "public"."workout_exercise_notes" to "authenticated";

grant truncate on table "public"."workout_exercise_notes" to "authenticated";

grant update on table "public"."workout_exercise_notes" to "authenticated";

grant delete on table "public"."workout_exercise_notes" to "service_role";

grant insert on table "public"."workout_exercise_notes" to "service_role";

grant references on table "public"."workout_exercise_notes" to "service_role";

grant select on table "public"."workout_exercise_notes" to "service_role";

grant trigger on table "public"."workout_exercise_notes" to "service_role";

grant truncate on table "public"."workout_exercise_notes" to "service_role";

grant update on table "public"."workout_exercise_notes" to "service_role";

create policy "Users can delete workout exercise note links for their own work"
on "public"."workout_exercise_notes"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM (workout_exercises we
     JOIN workouts w ON ((we.workout_id = w.id)))
  WHERE ((we.id = workout_exercise_notes.workout_exercise_id) AND (w.user_id = auth.uid())))));


create policy "Users can insert workout exercise note links for their own work"
on "public"."workout_exercise_notes"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM (workout_exercises we
     JOIN workouts w ON ((we.workout_id = w.id)))
  WHERE ((we.id = workout_exercise_notes.workout_exercise_id) AND (w.user_id = auth.uid())))));


create policy "Users can view workout exercise note links for their own workou"
on "public"."workout_exercise_notes"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM (workout_exercises we
     JOIN workouts w ON ((we.workout_id = w.id)))
  WHERE ((we.id = workout_exercise_notes.workout_exercise_id) AND (w.user_id = auth.uid())))));



