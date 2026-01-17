create table "public"."mesocycle_notes" (
    "mesocycle_id" uuid not null,
    "profile_note_id" uuid not null
);


alter table "public"."mesocycle_notes" enable row level security;

create table "public"."profile_notes" (
    "id" uuid not null default gen_random_uuid(),
    "note" text not null,
    "created_at" timestamp with time zone not null default now(),
    "last_modified" timestamp with time zone not null default now()
);


alter table "public"."profile_notes" enable row level security;

CREATE INDEX idx_mesocycle_notes_mesocycle_id ON public.mesocycle_notes USING btree (mesocycle_id);

CREATE INDEX idx_mesocycle_notes_profile_note_id ON public.mesocycle_notes USING btree (profile_note_id);

CREATE UNIQUE INDEX mesocycle_notes_pkey ON public.mesocycle_notes USING btree (mesocycle_id, profile_note_id);

CREATE UNIQUE INDEX profile_notes_pkey ON public.profile_notes USING btree (id);

alter table "public"."mesocycle_notes" add constraint "mesocycle_notes_pkey" PRIMARY KEY using index "mesocycle_notes_pkey";

alter table "public"."profile_notes" add constraint "profile_notes_pkey" PRIMARY KEY using index "profile_notes_pkey";

alter table "public"."mesocycle_notes" add constraint "mesocycle_notes_mesocycle_id_fkey" FOREIGN KEY (mesocycle_id) REFERENCES mesocycle(id) ON DELETE CASCADE not valid;

alter table "public"."mesocycle_notes" validate constraint "mesocycle_notes_mesocycle_id_fkey";

alter table "public"."mesocycle_notes" add constraint "mesocycle_notes_profile_note_id_fkey" FOREIGN KEY (profile_note_id) REFERENCES profile_notes(id) ON DELETE CASCADE not valid;

alter table "public"."mesocycle_notes" validate constraint "mesocycle_notes_profile_note_id_fkey";

grant delete on table "public"."mesocycle_notes" to "anon";

grant insert on table "public"."mesocycle_notes" to "anon";

grant references on table "public"."mesocycle_notes" to "anon";

grant select on table "public"."mesocycle_notes" to "anon";

grant trigger on table "public"."mesocycle_notes" to "anon";

grant truncate on table "public"."mesocycle_notes" to "anon";

grant update on table "public"."mesocycle_notes" to "anon";

grant delete on table "public"."mesocycle_notes" to "authenticated";

grant insert on table "public"."mesocycle_notes" to "authenticated";

grant references on table "public"."mesocycle_notes" to "authenticated";

grant select on table "public"."mesocycle_notes" to "authenticated";

grant trigger on table "public"."mesocycle_notes" to "authenticated";

grant truncate on table "public"."mesocycle_notes" to "authenticated";

grant update on table "public"."mesocycle_notes" to "authenticated";

grant delete on table "public"."mesocycle_notes" to "service_role";

grant insert on table "public"."mesocycle_notes" to "service_role";

grant references on table "public"."mesocycle_notes" to "service_role";

grant select on table "public"."mesocycle_notes" to "service_role";

grant trigger on table "public"."mesocycle_notes" to "service_role";

grant truncate on table "public"."mesocycle_notes" to "service_role";

grant update on table "public"."mesocycle_notes" to "service_role";

grant delete on table "public"."profile_notes" to "anon";

grant insert on table "public"."profile_notes" to "anon";

grant references on table "public"."profile_notes" to "anon";

grant select on table "public"."profile_notes" to "anon";

grant trigger on table "public"."profile_notes" to "anon";

grant truncate on table "public"."profile_notes" to "anon";

grant update on table "public"."profile_notes" to "anon";

grant delete on table "public"."profile_notes" to "authenticated";

grant insert on table "public"."profile_notes" to "authenticated";

grant references on table "public"."profile_notes" to "authenticated";

grant select on table "public"."profile_notes" to "authenticated";

grant trigger on table "public"."profile_notes" to "authenticated";

grant truncate on table "public"."profile_notes" to "authenticated";

grant update on table "public"."profile_notes" to "authenticated";

grant delete on table "public"."profile_notes" to "service_role";

grant insert on table "public"."profile_notes" to "service_role";

grant references on table "public"."profile_notes" to "service_role";

grant select on table "public"."profile_notes" to "service_role";

grant trigger on table "public"."profile_notes" to "service_role";

grant truncate on table "public"."profile_notes" to "service_role";

grant update on table "public"."profile_notes" to "service_role";

create policy "Users can delete mesocycle note links for their own mesocycles"
on "public"."mesocycle_notes"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM mesocycle m
  WHERE ((m.id = mesocycle_notes.mesocycle_id) AND (m.user_id = auth.uid())))));


create policy "Users can insert mesocycle note links for their own mesocycles"
on "public"."mesocycle_notes"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM mesocycle m
  WHERE ((m.id = mesocycle_notes.mesocycle_id) AND (m.user_id = auth.uid())))));


create policy "Users can view mesocycle note links for their own mesocycles"
on "public"."mesocycle_notes"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM mesocycle m
  WHERE ((m.id = mesocycle_notes.mesocycle_id) AND (m.user_id = auth.uid())))));


create policy "Users can delete profile notes"
on "public"."profile_notes"
as permissive
for delete
to authenticated
using (true);


create policy "Users can insert profile notes"
on "public"."profile_notes"
as permissive
for insert
to authenticated
with check (true);


create policy "Users can update profile notes"
on "public"."profile_notes"
as permissive
for update
to authenticated
using (true)
with check (true);


create policy "Users can view all profile notes"
on "public"."profile_notes"
as permissive
for select
to authenticated
using (true);



