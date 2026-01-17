create policy "Service role can manage release notes"
on "public"."release_notes"
as permissive
for all
to service_role
using (true)
with check (true);



