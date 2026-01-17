drop policy "ds_owner" on "public"."data_sources";

drop policy "Users and admins can update mesocycle template's exercises" on "public"."mesocycle_template.exercises";

alter table "public"."release_notes" enable row level security;

create policy "Admins and users can CRUD their data sources"
on "public"."data_sources"
as permissive
for all
to authenticated
using (((user_id = auth.uid()) OR is_admin()))
with check (((user_id = auth.uid()) OR is_admin()));


create policy "Mesocycle template creators can CRUD their exercises"
on "public"."mesocycle_template.exercises"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM "mesocycle.templates" mt
  WHERE (mt.id = "mesocycle_template.exercises".mesocycle_block_id))))
with check ((EXISTS ( SELECT 1
   FROM "mesocycle.templates" mt
  WHERE (mt.id = "mesocycle_template.exercises".mesocycle_block_id))));


create policy "Public can read release notes"
on "public"."release_notes"
as permissive
for select
to public
using (true);



