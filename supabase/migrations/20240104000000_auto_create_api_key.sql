-- Migration: Auto-create initial API key for new users
-- This trigger automatically generates a default API key when a user signs up

-- Function to generate a random API key
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS TEXT AS $$
DECLARE
  random_bytes BYTEA;
  api_key TEXT;
BEGIN
  -- Generate 32 random bytes and convert to hex
  random_bytes := gen_random_bytes(32);
  api_key := 'toon_' || encode(random_bytes, 'hex');
  RETURN api_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to hash API key (SHA-256)
CREATE OR REPLACE FUNCTION public.hash_api_key(key TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(key, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create initial API key for new user
CREATE OR REPLACE FUNCTION public.create_initial_api_key()
RETURNS TRIGGER AS $$
DECLARE
  new_api_key TEXT;
  key_hash TEXT;
  key_prefix TEXT;
BEGIN
  -- Generate new API key
  new_api_key := public.generate_api_key();
  key_hash := public.hash_api_key(new_api_key);
  key_prefix := substring(new_api_key from 1 for 12);

  -- Insert the API key
  INSERT INTO public.api_keys (user_id, key_hash, key_prefix, name, is_active)
  VALUES (NEW.id, key_hash, key_prefix, 'Default API Key', true);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on user_profiles table
-- This fires after the user profile is created (which happens via the handle_new_user trigger)
DROP TRIGGER IF EXISTS on_user_profile_created ON public.user_profiles;
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_initial_api_key();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.generate_api_key() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.hash_api_key(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_initial_api_key() TO authenticated, service_role;
