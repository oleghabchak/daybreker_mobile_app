alter table "public"."terra_misc_payloads" enable row level security;

alter table "public"."terra_users" alter column "user_id" set data type character varying using "user_id"::character varying;

alter table "public"."terra_users" enable row level security;

create policy "Service role can manage all data payloads"
on "public"."terra_data_payloads"
as permissive
for all
to service_role
using (true)
with check (true);


create policy "Users can delete only their own data payloads"
on "public"."terra_data_payloads"
as permissive
for delete
to authenticated
using (((user_id)::text = (auth.uid())::text));


create policy "Users can update only their own data payloads"
on "public"."terra_data_payloads"
as permissive
for update
to authenticated
using (((user_id)::text = (auth.uid())::text))
with check (((user_id)::text = (auth.uid())::text));


create policy "Users can view only their own data payloads"
on "public"."terra_data_payloads"
as permissive
for select
to authenticated
using (((user_id)::text = (auth.uid())::text));


create policy "Service role can manage Terra payloads"
on "public"."terra_misc_payloads"
as permissive
for all
to service_role
using (true)
with check (true);


create policy "Users can delete only their own payloads"
on "public"."terra_misc_payloads"
as permissive
for delete
to authenticated
using (((user_id)::text = (auth.uid())::text));


create policy "Users can update only their own payloads"
on "public"."terra_misc_payloads"
as permissive
for update
to authenticated
using (((user_id)::text = (auth.uid())::text))
with check (((user_id)::text = (auth.uid())::text));


create policy "Users can view only their own Terra payloads"
on "public"."terra_misc_payloads"
as permissive
for select
to authenticated
using (((user_id)::text = (auth.uid())::text));


create policy "Service role can manage Terra mapping"
on "public"."terra_users"
as permissive
for all
to service_role
using (true)
with check (true);


create policy "Users can view only their own Terra mapping"
on "public"."terra_users"
as permissive
for select
to authenticated
using (((user_id)::text = (auth.uid())::text));



