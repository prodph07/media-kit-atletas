import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ message: 'Erro de configuração no servidor' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    console.log("Webhook Kirvano Recebido:", payload);

    // --- CORREÇÃO AQUI: Converter tudo para minúsculo para comparar ---
    const event = (payload.event || '').toLowerCase(); 
    const status = (payload.status || payload.transaction_status || '').toLowerCase();
    
    // Pega o email (tenta em vários lugares do JSON)
    const emailCliente = payload.customer?.email || payload.data?.customer?.email || payload.email;

    console.log(`Processando: Evento=${event}, Status=${status}, Email=${emailCliente}`);

    // VERIFICA APROVAÇÃO (Aceita 'sale_approved', 'approved', 'paid')
    if (status === 'approved' || status === 'paid' || event === 'sale_approved') {
      
      if (!emailCliente) {
        return NextResponse.json({ message: 'Email não encontrado' }, { status: 400 });
      }

      // Atualiza para PREMIUM
      const { data, error } = await supabaseAdmin
        .from('atletas')
        .update({ plano: 'premium' })
        .eq('email', emailCliente) // O email tem que bater exato
        .select();

      if (error) {
        console.error("Erro banco:", error);
        return NextResponse.json({ message: 'Erro ao atualizar banco' }, { status: 500 });
      }

      // Se não encontrou o usuário (data vazio), avisa no log
      if (data && data.length === 0) {
        console.log("Email não encontrado no banco:", emailCliente);
        return NextResponse.json({ message: 'Usuário não encontrado no banco' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Premium Ativado com Sucesso' }, { status: 200 });
    }

    // VERIFICA REEMBOLSO (Aceita 'sale_refunded', 'refunded')
    if (status === 'refunded' || status === 'chargedback' || event === 'sale_refunded') {
       await supabaseAdmin
        .from('atletas')
        .update({ plano: 'free' })
        .eq('email', emailCliente);
       
       return NextResponse.json({ message: 'Plano cancelado' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Ignorado', received_status: status, received_event: event }, { status: 200 });

  } catch (err) {
    console.error("Erro:", err);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}