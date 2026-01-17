## Uncompleted TODOs

- Add `first_name` and `last_name` to `profiles` table (migration)
- Backfill `first_name`/`last_name` from existing `full_name` and add fallback logic
- Update app to read/save `first_name`/`last_name` and use `first_name` on Home

Notes:
- Until the migration is complete, the app composes `full_name` from first/last in the Profile screen and displays `full_name` on Home.

