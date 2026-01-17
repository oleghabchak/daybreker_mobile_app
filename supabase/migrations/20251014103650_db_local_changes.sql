drop policy if exists "Authenticated users can insert non-app templates" on "public"."mesocycle.templates";

drop policy if exists "Users can delete their own templates" on "public"."mesocycle.templates";

drop policy if exists "Users can update their own templates" on "public"."mesocycle.templates";

alter table "public"."mesocycle_template.exercises" drop constraint if exists "mesocycle.exercises_exercise_id_fkey";

alter table "public"."mesocycle_template.exercises" enable row level security;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'mesocycle_template.exercises_exercise_id_fkey'
    ) THEN
        ALTER TABLE "public"."mesocycle_template.exercises"
        ADD CONSTRAINT "mesocycle_template.exercises_exercise_id_fkey"
        FOREIGN KEY (exercise_id)
        REFERENCES exercise_library(exercise_uid)
        ON DELETE CASCADE
        NOT VALID;
    END IF;
END$$;

alter table "public"."mesocycle_template.exercises" validate constraint "mesocycle_template.exercises_exercise_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$SELECT EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
)$function$
;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'mesocycle.templates'
          AND policyname = 'Authenticated users and admins can insert non-app templates'
    ) THEN
        CREATE POLICY "Authenticated users and admins can insert non-app templates"
        ON "public"."mesocycle.templates"
        AS PERMISSIVE
        FOR INSERT
        TO authenticated
        WITH CHECK (
          ((user_id = auth.uid()) AND (is_app_template IS FALSE))
          OR is_admin()
        );
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'mesocycle.templates'
          AND policyname = 'Users and admins can delete templates'
    ) THEN
        CREATE POLICY "Users and admins can delete templates"
        ON "public"."mesocycle.templates"
        AS PERMISSIVE
        FOR DELETE
        TO authenticated
        USING (
          (user_id = auth.uid()) OR is_admin()
        );
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'mesocycle.templates'
          AND policyname = 'Users and admins can update templates'
    ) THEN
        CREATE POLICY "Users and admins can update templates"
        ON "public"."mesocycle.templates"
        AS PERMISSIVE
        FOR UPDATE
        TO authenticated
        USING (
          (user_id = auth.uid()) OR is_admin()
        )
        WITH CHECK (
          (user_id = auth.uid()) OR is_admin()
        );
    END IF;
END$$;




