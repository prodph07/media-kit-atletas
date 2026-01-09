import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        if (req.method !== 'POST') return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
        
        const text = await req.text();
        let payload;
        try { payload = JSON.parse(text); } 
        catch (err) { return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 }); }

        // DADOS VINDOS DA KIRVANO
        const emailCompra = payload.customer?.email;
        const cpfCompra = payload.customer?.document?.replace(/\D/g, ''); // Remove pontos e traços
        const purchaseStatus = payload.order_status; 

        // Status de Sucesso (Ajuste conforme Kirvano, geralmente 'paid' ou 'approved')
        if (['paid', 'approved', 'completed'].includes(purchaseStatus)) {
            
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );

            console.log(`🔎 Buscando usuário... Email: ${emailCompra} | CPF: ${cpfCompra}`);

            // --- A BUSCA HÍBRIDA ---
            // Buscamos qualquer usuário que tenha ESSE email OU ESSE cpf
            const { data: users, error } = await supabase
                .from('atletas')
                .select('id, first_premium_at, invited_by, email, cpf')
                .or(`email.eq.${emailCompra},cpf.eq.${cpfCompra}`);

            if (error) {
                console.error("Erro no banco:", error);
                return NextResponse.json({ message: 'DB Error' }, { status: 500 });
            }

            // Pega o primeiro usuário encontrado (geralmente só deve haver um)
            const atleta = users?.[0];

            if (atleta) {
                console.log(`✅ Usuário encontrado: ${atleta.email} (ID: ${atleta.id})`);
                
                const updates = { plano: 'premium' };
                
                // Se o CPF no banco estiver vazio (caso raro), atualiza com o da compra
                if (!atleta.cpf && cpfCompra) {
                    updates.cpf = cpfCompra;
                }

                // Lógica de Primeira Conversão (Comissão)
                if (!atleta.first_premium_at) {
                    updates.first_premium_at = new Date().toISOString();
                    console.log(`🏆 Comissão contabilizada para ID: ${atleta.invited_by}`);
                }

                await supabase.from('atletas').update(updates).eq('id', atleta.id);
                console.log("💎 Plano atualizado com sucesso!");

            } else {
                console.log(`⚠️ NENHUM usuário encontrado para Email: ${emailCompra} ou CPF: ${cpfCompra}`);
                // Opcional: Salvar em uma tabela de 'vendas_perdidas' para análise manual
            }
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('❌ Erro Fatal no Webhook:', error);
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}