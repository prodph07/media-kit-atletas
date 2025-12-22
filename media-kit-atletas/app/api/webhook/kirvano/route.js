import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// --- A CORREÇÃO ESTÁ AQUI EMBAIXO ---
export const runtime = 'edge'; 
// ------------------------------------

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    // Pegando as chaves do ambiente (no Edge Runtime)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ message: 'Erro de configuração no servidor' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    console.log("Webhook Kirvano Recebido:", payload);

    const event = payload.event; 
    const status = payload.status || payload.transaction_status || (event === 'sale.approved' ? 'approved' : '');
    const emailCliente = payload.customer?.email || payload.data?.customer?.email || payload.email;

    // Verifica Aprovação
    if (status === 'approved' || status === 'paid' || event === 'sale.approved') {
      
      if (!emailCliente) {
        return NextResponse.json({ message: 'Email não encontrado' }, { status: 400 });
      }

      const { error } = await supabaseAdmin
        .from('atletas')
        .update({ plano: 'premium' })
        .eq('email', emailCliente)
        .select();

      if (error) {
        console.error("Erro banco:", error);
        return NextResponse.json({ message: 'Erro banco' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Premium Ativado' }, { status: 200 });
    }

    // Verifica Cancelamento
    if (status === 'refunded' || status === 'chargedback' || event === 'sale.refunded') {
       await supabaseAdmin
        .from('atletas')
        .update({ plano: 'free' })
        .eq('email', emailCliente);
       
       return NextResponse.json({ message: 'Plano cancelado' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Ignorado' }, { status: 200 });

  } catch (err) {
    console.error("Erro:", err);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}