import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Apenas troca o código pela sessão
    // O Trigger do banco já criou o perfil nesse momento!
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redireciona para o painel
  return NextResponse.redirect(`${requestUrl.origin}/painel`);
}