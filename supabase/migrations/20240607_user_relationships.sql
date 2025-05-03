
-- Create the user_relationships table to manage hierarchical relationships between users
CREATE TABLE public.user_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subordinate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(manager_id, subordinate_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_relationships ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to manage all relationships
CREATE POLICY "Admins can manage all relationships" 
  ON public.user_relationships 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create policy to allow users to view their own relationships
CREATE POLICY "Users can view their own relationships" 
  ON public.user_relationships 
  FOR SELECT 
  TO authenticated 
  USING (
    manager_id = auth.uid() OR subordinate_id = auth.uid()
  );

-- Create RLS policies for user access (protecting one's own data)
CREATE POLICY "Users can only access their own data or subordinate data" 
  ON public.leads 
  FOR SELECT 
  TO authenticated 
  USING (
    user_id = auth.uid() OR  -- User's own data
    (
      SELECT EXISTS (
        SELECT 1 FROM user_relationships
        WHERE manager_id = auth.uid() AND subordinate_id = leads.user_id
      )
    ) OR  -- Manager can access subordinate's data
    (
      SELECT EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )  -- Admin can access all data
  );

-- Similar policies for other tables to enforce hierarchical access
CREATE POLICY "Users can only access their own data or subordinate data" 
  ON public.atividades
  FOR SELECT 
  TO authenticated 
  USING (
    user_id = auth.uid() OR  -- User's own data
    (
      SELECT EXISTS (
        SELECT 1 FROM user_relationships
        WHERE manager_id = auth.uid() AND subordinate_id = atividades.user_id
      )
    ) OR  -- Manager can access subordinate's data
    (
      SELECT EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )  -- Admin can access all data
  );

-- Update similar policies for other entities based on the same hierarchy principle
