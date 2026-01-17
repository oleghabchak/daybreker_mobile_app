alter table "public"."mesocycle_template.exercises" drop constraint "mesocycle.exercises_mesocycle_block_id_fkey";

alter table "public"."mesocycle.templates" enable row level security;

alter table "public"."mesocycle_template.exercises" add constraint "mesocycle_template.exercises_mesocycle_block_id_fkey" FOREIGN KEY (mesocycle_block_id) REFERENCES "mesocycle.templates"(id) ON DELETE CASCADE not valid;

alter table "public"."mesocycle_template.exercises" validate constraint "mesocycle_template.exercises_mesocycle_block_id_fkey";

create policy "Authenticated users can insert non-app templates"
on "public"."mesocycle.templates"
as permissive
for insert
to authenticated
with check (((user_id = auth.uid()) AND ((is_app_template IS FALSE) OR (is_app_template IS NULL))));


create policy "Users can delete their own templates"
on "public"."mesocycle.templates"
as permissive
for delete
to authenticated
using ((user_id = auth.uid()));


create policy "Users can update their own templates"
on "public"."mesocycle.templates"
as permissive
for update
to authenticated
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));


create policy "Users can view their own or public templates"
on "public"."mesocycle.templates"
as permissive
for select
to authenticated
using (((user_id = auth.uid()) OR (is_app_template = true)));



