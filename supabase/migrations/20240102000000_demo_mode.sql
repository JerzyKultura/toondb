-- Temporary: Allow public access for demo/testing
-- This allows the app to work without authentication during development
-- TODO: Remove these policies and enable proper authentication

-- Temporarily allow public access to tables (for demo mode)
CREATE POLICY "Temporary public access for demo" ON public.toon_tables
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Temporarily allow public access to files (for demo mode)
CREATE POLICY "Temporary public file access for demo" ON public.toon_files
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Temporarily allow public access to query history (for demo mode)
CREATE POLICY "Temporary public query access for demo" ON public.query_history
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Note: These policies bypass security and should be removed once proper authentication is implemented

