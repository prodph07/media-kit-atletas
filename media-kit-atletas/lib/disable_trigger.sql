-- REMOVE GATILHO AUTOMÁTICO DE ATLETAS
-- O problema é que existe um gatilho criando atletas automaticamente ao logar.
-- Execute este script no SQL Editor do Supabase para removê-lo.

-- Tenta remover o gatilho padrão se ele tiver nome comum
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Se o nome for diferente, você precisará verificar em "Database > Triggers" no painel do Supabase.
