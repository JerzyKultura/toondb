-- Temporarily remove foreign key constraint for demo mode
-- This allows creating tables without requiring auth.users entries

-- Drop the existing foreign key constraint on toon_tables
ALTER TABLE public.toon_tables
  DROP CONSTRAINT IF EXISTS toon_tables_user_id_fkey;

-- Drop the existing foreign key constraint on toon_files
ALTER TABLE public.toon_files
  DROP CONSTRAINT IF EXISTS toon_files_user_id_fkey;

-- Drop the existing foreign key constraint on query_history
ALTER TABLE public.query_history
  DROP CONSTRAINT IF EXISTS query_history_user_id_fkey;

-- Drop the existing foreign key constraint on saved_queries
ALTER TABLE public.saved_queries
  DROP CONSTRAINT IF EXISTS saved_queries_user_id_fkey;

-- Drop the existing foreign key constraint on api_keys
ALTER TABLE public.api_keys
  DROP CONSTRAINT IF EXISTS api_keys_user_id_fkey;

-- Drop the existing foreign key constraint on audit_logs
ALTER TABLE public.audit_logs
  DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

-- Drop the existing foreign key constraint on usage_metrics
ALTER TABLE public.usage_metrics
  DROP CONSTRAINT IF EXISTS usage_metrics_user_id_fkey;

-- Note: When implementing proper authentication, these constraints should be re-added
-- For production, run:
-- ALTER TABLE public.toon_tables ADD CONSTRAINT toon_tables_user_id_fkey 
--   FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

