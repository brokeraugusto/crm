
-- Criar enum para os tipos de roles
CREATE TYPE app_role AS ENUM ('admin', 'gerente', 'corretor', 'assistente');

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  empresa TEXT,
  telefone TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de roles de usuários
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Criar tabela de recursos e permissões por role
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, resource, action)
);

-- Criar tabela para armazenar chaves de API de usuários
CREATE TABLE IF NOT EXISTS public.user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  drive_api_key TEXT,
  drive_client_id TEXT,
  drive_client_secret TEXT,
  calendar_api_key TEXT,
  calendar_client_id TEXT,
  calendar_client_secret TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Função para atribuir role de 'corretor' por padrão a novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar perfil para o novo usuário
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  
  -- Atribuir role padrão 'corretor' para novos usuários
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'corretor');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar função em novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para verificar se um usuário tem uma role específica
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role app_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = $1
      AND user_roles.role = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar permissão
CREATE OR REPLACE FUNCTION public.has_permission(user_id UUID, resource TEXT, action TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_admin BOOLEAN;
  has_perm BOOLEAN;
BEGIN
  -- Verificar se é admin (admin tem todas as permissões)
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = $1 AND user_roles.role = 'admin'
  ) INTO has_admin;
  
  IF has_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar permissões específicas
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = $1
      AND rp.resource = $2
      AND rp.action = $3
  ) INTO has_perm;
  
  RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adicionar permissões padrão para as roles
INSERT INTO public.role_permissions (role, resource, action) VALUES
-- Admin tem todas as permissões
('admin', '*', '*'),

-- Permissões de Gerente
('gerente', 'leads', 'create'),
('gerente', 'leads', 'read'),
('gerente', 'leads', 'update'),
('gerente', 'leads', 'delete'),
('gerente', 'leads', 'assign'),

('gerente', 'imoveis', 'create'),
('gerente', 'imoveis', 'read'),
('gerente', 'imoveis', 'update'),
('gerente', 'imoveis', 'delete'),

('gerente', 'documentos', 'create'),
('gerente', 'documentos', 'read'),
('gerente', 'documentos', 'update'),
('gerente', 'documentos', 'delete'),

('gerente', 'relatorios', 'read'),
('gerente', 'dashboard', 'read'),

-- Permissões de Corretor
('corretor', 'leads', 'create'),
('corretor', 'leads', 'read'),
('corretor', 'leads', 'update'),

('corretor', 'imoveis', 'read'),
('corretor', 'imoveis', 'create'),
('corretor', 'imoveis', 'update'),

('corretor', 'documentos', 'create'),
('corretor', 'documentos', 'read'),

-- Permissões de Assistente
('assistente', 'leads', 'read'),
('assistente', 'imoveis', 'read'),
('assistente', 'documentos', 'read')
ON CONFLICT (role, resource, action) DO NOTHING;

-- Alterar todas as tabelas para aplicar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuários podem visualizar seus próprios perfis"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Usuários podem editar seus próprios perfis"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Políticas para user_roles
CREATE POLICY "Admins podem gerenciar todas as roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Usuários podem ver suas próprias roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Políticas para role_permissions
CREATE POLICY "Todos podem ver permissões"
ON public.role_permissions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Apenas admins podem gerenciar permissões"
ON public.role_permissions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para user_api_keys
CREATE POLICY "Usuários podem gerenciar suas próprias chaves de API"
ON public.user_api_keys FOR ALL
USING (auth.uid() = user_id);
