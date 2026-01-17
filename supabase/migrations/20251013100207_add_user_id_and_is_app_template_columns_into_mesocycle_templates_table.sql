alter table "public"."mesocycle.templates" add column "is_app_template" boolean not null default false;

alter table "public"."mesocycle.templates" add column "user_id" uuid;

alter table "public"."mesocycle.templates" add constraint "mesocycle.templates_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."mesocycle.templates" validate constraint "mesocycle.templates_user_id_fkey";


