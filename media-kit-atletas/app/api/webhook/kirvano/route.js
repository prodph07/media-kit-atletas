import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        // 1. Segurança e Parse
        if (req.method !== 'POST') return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
        
        const text = await req.text();
        let payload;
        try { payload = JSON.parse(text); } 
        catch (err) { return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 }); }

        const customerEmail = payload.customer?.email;
        const purchaseStatus = payload.order_status; // ex: 'paid', 'approved'

        if (!customerEmail) return NextResponse.json({ message: 'Email missing' }, { status: 200 });

        // 2. Se a compra foi aprovada
        if (purchaseStatus === 'paid' || purchaseStatus === 'approved' || purchaseStatus === 'completed') {
            
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );

            // 3. Buscar o atleta pelo email para checar o histórico
            const { data: atleta } = await supabase
                .from('atletas')
                .select('id, first_premium_at, invited_by')
                .eq('email', customerEmail) // Busca pelo email principal
                .single();

            if (atleta) {
                const updates = { plano: 'premium' };
                
                // --- A LÓGICA DE OURO ---
                // Se ele NUNCA foi premium antes (first_premium_at é null), carimbamos agora.
                if (!atleta.first_premium_at) {
                    updates.first_premium_at = new Date().toISOString();
                    console.log(`🏆 Primeira conversão Premium de ${customerEmail}! (Indicado por ID: ${atleta.invited_by})`);
                } else {
                    console.log(`🔄 Re-assinatura de ${customerEmail}. Data original: ${atleta.first_premium_at}`);
                }

                // 4. Atualiza no banco
                await supabase.from('atletas').update(updates).eq('id', atleta.id);
            } else {
                console.log(`⚠️ Email ${customerEmail} comprou mas não tem conta na plataforma.`);
            }
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('❌ Erro no Webhook:', error);
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}