-- Add RLS policy for admins to view all artifacts
CREATE POLICY "Admins can view all artifacts"
ON artifacts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);