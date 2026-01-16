-- 1. Tabela de Fãs (Usuários Comuns)
create table public.fans (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  apelido text not null,
  foto_url text null,
  xp bigint default 0,
  level int default 1,
  stats jsonb default '{}'::jsonb, -- Contadores: Palpites certos, erros, perfects, etc.
  created_at timestamp with time zone default now(),
  
  constraint fans_pkey primary key (id),
  constraint fans_user_id_key unique (user_id),
  constraint fans_apelido_key unique (apelido)
);

-- RLS para Fans
alter table public.fans enable row level security;

create policy "Fans podem ver todos os fans" 
on public.fans for select 
to authenticated, anon
using (true);

create policy "Fans podem editar seu proprio perfil" 
on public.fans for update 
to authenticated 
using (auth.uid() = user_id);

create policy "Fans podem inserir seu perfil" 
on public.fans for insert 
to authenticated 
with check (auth.uid() = user_id);

-- 2. Tabela de Palpites em Eventos
create table public.event_predictions (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id uuid not null references public.eventos (id) on delete cascade,
  fight_id uuid not null references public.eventos_lutas (id) on delete cascade,
  
  selected_winner_id bigint null references public.atletas (id), -- Quem vence? (Alterado para BIGINT)
  method text null, -- 'KO', 'SUB', 'DEC'
  round int null, -- 1, 2, 3, 5
  
  status text default 'pending', -- 'pending', 'correct', 'incorrect', 'partial' (se acertou só vencedor)
  points_earned int default 0,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  constraint event_predictions_pkey primary key (id),
  -- Garante apenas 1 palpite por luta por usuário
  constraint one_prediction_per_fight unique (user_id, fight_id) 
);

-- RLS para Palpites
alter table public.event_predictions enable row level security;

-- Todos podem ver palpites (para ranking/estatísticas), mas talvez só DEPOIS do lock time. 
-- Por simplicidade inicial, todos veem.
create policy "Todos podem ver palpites" 
on public.event_predictions for select 
to authenticated, anon 
using (true);

create policy "Usuarios criam seus palpites" 
on public.event_predictions for insert 
to authenticated 
with check (auth.uid() = user_id);

create policy "Usuarios editam seus palpites (validação de tempo será no backend/client security)" 
on public.event_predictions for update 
to authenticated 
using (auth.uid() = user_id);
