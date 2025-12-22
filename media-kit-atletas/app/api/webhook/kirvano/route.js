import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Força essa rota a ser dinâmica (não tenta gerar estático no build)
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    // 1. Verifica se as chaves existem antes de tentar conectar
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("ERRO CRÍTICO: Chaves do Supabase não configuradas no ambiente.");
      return NextResponse.json({ message: 'Erro de configuração no servidor' }, { status: 500 });
    }

    // 2. Conecta no Supabase SOMENTE quando o webhook for chamado
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // 3. Recebe os dados da Kirvano
    const payload = await req.json();
    console.log("Webhook Kirvano Recebido:", payload);

    const event = payload.event; 
    const status = payload.status || payload.transaction_status || (event === 'sale.approved' ? 'approved' : '');
    const emailCliente = payload.customer?.email || payload.data?.customer?.email || payload.email;

    // 4. Verifica aprovação
    if (status === 'approved' || status === 'paid' || event === 'sale.approved') {
      
      if (!emailCliente) {
        return NextResponse.json({ message: 'Email não encontrado no payload' }, { status: 400 });
      }

      // Atualiza para PREMIUM
      const { error } = await supabaseAdmin
        .from('atletas')
        .update({ plano: 'premium' })
        .eq('email', emailCliente)
        .select();

      if (error) {
        console.error("Erro ao atualizar banco:", error);
        return NextResponse.json({ message: 'Erro ao atualizar banco' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Sucesso! Atleta virou Premium.' }, { status: 200 });
    }

    // 5. Verifica Reembolso
    if (status === 'refunded' || status === 'chargedback' || event === 'sale.refunded') {
       await supabaseAdmin
        .from('atletas')
        .update({ plano: 'free' })
        .eq('email', emailCliente);
       
       return NextResponse.json({ message: 'Plano cancelado' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Evento ignorado' }, { status: 200 });

  } catch (err) {
    console.error("Erro interno no Webhook:", err);
    return NextResponse.json({ message: 'Erro interno no servidor' }, { status: 500 });
  }
}