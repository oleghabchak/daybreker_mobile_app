drop policy "pbe_owner" on "public"."mesocycle_template.exercises";

create policy "Users and admins can update mesocycle template's exercises"
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



