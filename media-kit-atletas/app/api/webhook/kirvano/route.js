export const runtime = 'edge';

// ... resto do seu código ...
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ message: 'Erro de configuração' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    const payload = await req.json();
    
    // LOG para debug
    console.log("Webhook Recebido:", JSON.stringify(payload));

    const event = (payload.event || '').toLowerCase(); 
    const status = (payload.status || payload.transaction_status || '').toLowerCase();
    
    // DADOS DO CLIENTE
    const emailCliente = payload.customer?.email || payload.data?.customer?.email || payload.email;
    
    // CPF (Vem da Kirvano como customer.document)
    let cpfCliente = payload.customer?.document || payload.data?.customer?.document || '';
    // Limpa o CPF (deixa só números)
    cpfCliente = cpfCliente.replace(/\D/g, '');

    console.log(`Processando: Email=${emailCliente}, CPF=${cpfCliente}`);

    // --- LÓGICA DE APROVAÇÃO ---
    if (status === 'approved' || status === 'paid' || event === 'sale_approved') {
      
      if (!emailCliente && !cpfCliente) {
        return NextResponse.json({ message: 'Dados do cliente não encontrados' }, { status: 400 });
      }

      // BUSCA INTELIGENTE: Procura por Email OU CPF
      // A sintaxe do Supabase para OR é: .or(`coluna1.eq.valor,coluna2.eq.valor`)
      let query = supabaseAdmin.from('atletas').update({ plano: 'premium' });

      if (emailCliente && cpfCliente) {
         // Se tem os dois, tenta bater um OU outro
         query = query.or(`email.eq.${emailCliente},cpf.eq.${cpfCliente}`);
      } else if (emailCliente) {
         query = query.eq('email', emailCliente);
      } else if (cpfCliente) {
         query = query.eq('cpf', cpfCliente);
      }

      const { data, error } = await query.select();

      if (error) {
        console.error("Erro banco:", error);
        return NextResponse.json({ message: 'Erro ao atualizar banco' }, { status: 500 });
      }

      if (data && data.length > 0) {
          return NextResponse.json({ message: 'Premium Ativado', user: data[0].nome }, { status: 200 });
      } else {
          console.log("Nenhum usuário encontrado com esse Email ou CPF");
          return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
      }
    }

    // --- LÓGICA DE REEMBOLSO ---
    if (status === 'refunded' || status === 'chargedback' || event === 'sale_refunded') {
       // Mesma lógica de busca para remover
       let query = supabaseAdmin.from('atletas').update({ plano: 'free' });
       
       if (emailCliente && cpfCliente) {
         query = query.or(`email.eq.${emailCliente},cpf.eq.${cpfCliente}`);
       } else if (emailCliente) {
         query = query.eq('email', emailCliente);
       }

       await query;
       return NextResponse.json({ message: 'Plano cancelado' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Ignorado' }, { status: 200 });

  } catch (err) {
    console.error("Erro:", err);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}