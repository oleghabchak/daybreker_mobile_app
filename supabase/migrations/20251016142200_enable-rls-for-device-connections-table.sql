alter table "public"."device_connections" enable row level security;

create policy "Admins and users can manage their device_connections"
on "public"."device_connections"
as permissive
for all
to authenticated
using (((user_id = auth.uid()) OR is_admin()))
with check (((user_id = auth.uid()) OR is_admin()));


create policy "Service role can manage device connections"
on "public"."device_connections"
as permissive
for all
to service_role
using (true)
with check (true);



