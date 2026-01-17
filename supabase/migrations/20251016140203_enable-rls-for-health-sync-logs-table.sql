alter table "public"."health_sync_logs" enable row level security;

create policy "Admins and users can CRUD their health sync logs"
on "public"."health_sync_logs"
as permissive
for all
to authenticated
using (((user_id = auth.uid()) OR is_admin()))
with check (((user_id = auth.uid()) OR is_admin()));


create policy "Service role can manage health sync logs"
on "public"."health_sync_logs"
as permissive
for all
to service_role
using (true)
with check (true);



