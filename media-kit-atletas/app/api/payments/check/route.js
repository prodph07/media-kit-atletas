import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_KEY);

export async function POST(request) {
    try {
        const { registrationId, paymentId } = await request.json();

        // 1. Get Registration to find Organizer Token
        const { data: reg } = await supabase
            .from('eventos_inscricoes')
            .select(`
                id, evento:eventos!evento_id(organizador_id),
                payment_id
            `)
            .eq('id', registrationId)
            .single();

        if (!reg) return NextResponse.json({ error: 'Inscrição não encontrada' }, { status: 404 });

        // Use stored payment_id if not provided
        const finalPaymentId = paymentId || reg.payment_id;
        if (!finalPaymentId) return NextResponse.json({ status: 'pending' });

        // 2. Get Token
        const organizerId = reg.evento?.organizador_id;
        const { data: orgProfile } = await supabase.from('atletas').select('coach_details').eq('user_id', organizerId).single();
        const accessToken = orgProfile?.coach_details?.mp_access_token;

        if (!accessToken) return NextResponse.json({ error: 'Token inválido' }, { status: 400 });

        // 3. specific Check MP
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${finalPaymentId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!mpResponse.ok) return NextResponse.json({ status: 'unknown' });

        const mpData = await mpResponse.json();
        const status = mpData.status; // 'approved', 'pending', etc.

        // 4. Update DB if changed
        if (status === 'approved') {
            await supabase
                .from('eventos_inscricoes')
                .update({ status: 'pago', payment_status: 'approved' })
                .eq('id', registrationId);
        }

        return NextResponse.json({ status });

    } catch (err) {
        console.error("Check Error:", err);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
