import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Configura o Supabase com permissão de ADMIN (Service Role)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    // 1. Recebe os dados da Kirvano
    const payload = await req.json();

    console.log("Webhook Kirvano Recebido:", payload);

    // 2. Extrai os dados importantes
    // A Kirvano geralmente envia: { event: 'sale.approved', data: { customer: { email: ... } } }
    // Ou estrutura direta dependendo da versão. Vamos tentar pegar de formas variadas para garantir.
    
    const event = payload.event; // Ex: 'sale.approved'
    
    // Tenta achar o status e o email em locais diferentes do JSON para ser à prova de falhas
    const status = payload.status || payload.transaction_status || (event === 'sale.approved' ? 'approved' : '');
    const emailCliente = payload.customer?.email || payload.data?.customer?.email || payload.email;

    // 3. Verifica se foi APROVADO (Venda realizada)
    if (status === 'approved' || status === 'paid' || event === 'sale.approved') {
      
      if (!emailCliente) {
        return NextResponse.json({ message: 'Email não encontrado no payload' }, { status: 400 });
      }

      // 4. Atualiza o plano do atleta para PREMIUM
      const { data, error } = await supabaseAdmin
        .from('atletas')
        .update({ plano: 'premium' })
        .eq('email', emailCliente) // Busca pelo email cadastrado
        .select();

      if (error) {
        console.error("Erro ao atualizar banco:", error);
        return NextResponse.json({ message: 'Erro ao atualizar banco' }, { status: 500 });
      }

      console.log(`Sucesso! Atleta ${emailCliente} agora é Premium.`);
      return NextResponse.json({ message: 'Recebido e processado' }, { status: 200 });
    }

    // 5. Verifica Reembolso/Cancelamento (Volta para Free)
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