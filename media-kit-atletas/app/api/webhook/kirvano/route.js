import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// --- CONFIGURAÇÃO DE AMBIENTE (SÓ PODE TER UMA VEZ) ---
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        console.log("🔔 Webhook Kirvano recebido!");

        // 1. Validar Método
        if (req.method !== 'POST') {
            return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
        }

        // 2. Pegar Body (Seguro para Edge)
        const text = await req.text();
        let payload;
        try {
            payload = JSON.parse(text);
        } catch (err) {
            return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
        }

        console.log("📦 Payload:", JSON.stringify(payload, null, 2));

        // 3. Extrair Email e Status
        const customerEmail = payload.customer?.email;
        const purchaseStatus = payload.order_status; // Ajuste conforme documentação da Kirvano

        if (!customerEmail) {
            console.log("❌ Email não encontrado no payload");
            return NextResponse.json({ message: 'Email missing' }, { status: 200 });
        }

        // 4. Lógica de Aprovação (Se for Paid/Approved)
        // Verifique na Kirvano qual o status exato (ex: 'paid', 'approved', 'completed')
        if (purchaseStatus === 'paid' || purchaseStatus === 'approved') {
            
            // Conectar Supabase (Edge)
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );

            // Buscar usuário pelo email (na tabela auth ou public?)
            // Como não temos acesso direto à tabela auth.users via API client side padrão,
            // vamos buscar na tabela 'atletas' pelo campo contact->email ou criar um mecanismo.
            
            // ESTRATÉGIA: Buscar na tabela 'atletas' onde o email de contato bate
            // OU: O ideal é que o email da compra seja o mesmo do login.
            
            // Tenta atualizar plano para 'premium' onde o email bate
            // Atenção: Isso assume que o email de contato no JSON 'atletas' é o mesmo da compra.
            
            // Vamos tentar buscar na tabela 'atletas' usando um filtro JSONB se possível, ou select simples se tiver coluna email.
            // Se 'contato' for JSONB: .contains('contato', { email: customerEmail })
            
            const { data, error } = await supabase
                .from('atletas')
                .update({ plano: 'premium' })
                .eq('contato->>email', customerEmail) // Sintaxe para JSONB no Supabase
                .select();

            if (error) {
                console.error("❌ Erro ao atualizar Supabase:", error);
                return NextResponse.json({ message: 'Db error' }, { status: 500 });
            }

            console.log("✅ Plano atualizado para Premium:", customerEmail);
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('❌ Erro no Webhook:', error);
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}