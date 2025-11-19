-- Create a secure function to look up users by email
-- This function can only be called with service_role and is used for portfolio sharing
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(user_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Query auth.users table to find user by email
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;

  RETURN user_uuid;
END;
$$;

-- Grant execute permission to authenticated users (will be called server-side with service role)
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(text) TO authenticated, service_role;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_user_id_by_email IS 'Looks up a user ID by email address. Returns NULL if user not found. Should only be called server-side with proper authorization checks.';
