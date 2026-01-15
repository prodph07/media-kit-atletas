import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_KEY); // Service Role preferred but trying generic first

export async function POST(request) {
    try {
        const { registrationId } = await request.json();

        // 1. Fetch Registration + Event + Organizer
        const { data: reg, error: regError } = await supabase
            .from('eventos_inscricoes')
            .select(`
                id, evento_id, categoria_id, atleta_id,
                evento:eventos!evento_id(nome, organizador_id),
                atleta:atletas!atleta_id(nome, email, cpf),
                categoria:eventos_categorias(nome, preco)
            `)
            .eq('id', registrationId)
            .single();

        if (regError || !reg) {
            return NextResponse.json({ error: 'Inscrição não encontrada.' }, { status: 404 });
        }

        const organizerId = reg.evento?.organizador_id;
        if (!organizerId) return NextResponse.json({ error: 'Organizador não identificado.' }, { status: 400 });

        // 2. Fetch Organizer MP Token
        const { data: orgData } = await supabase
            .from('atletas')
            .select('coach_details')
            .eq('id', organizerId) // organizador_id is linked to atletas Table ID? Or User ID?
        // Usually 'organizador_id' in 'eventos' is 'user_id' string. Let's check schema assumption.
        // In TabEventos.js: organizador_id: userId. So it is UUID.
        // In TabEventos.js effectiveUserId is used.
        // Let's assume organizador_id is user_id.
        // But we need to fetch from 'atletas' table where user_id = organizador_id.
        // Wait, query above uses .eq('id', organizerId) which implies organizerId is the TABLE ID.
        // Let's re-read useProfileData.js/TabEventos.js logic.
        // In TabEventos: organizador_id: userId (which is auth.uid()).
        // So we need .eq('user_id', organizerId).

        // Let's Try fetching by user_id first
        let { data: orgProfile } = await supabase.from('atletas').select('coach_details').eq('user_id', organizerId).single();

        // If not found, maybe organizador_id WAS the table ID? (Less likely for auth linkage).
        // Let's proceed with user_id assumption.

        const accessToken = orgProfile?.coach_details?.mp_access_token;

        if (!accessToken) {
            return NextResponse.json({ error: 'Organizador não configurou pagamento.' }, { status: 400 });
        }

        // 3. Prepare Payment Data
        const price = Number(reg.categoria?.preco);
        if (!price || price <= 0) {
            return NextResponse.json({ error: 'Categoria gratuita ou sem preço definido.' }, { status: 400 });
        }

        const paymentData = {
            transaction_amount: price,
            description: `Inscrição: ${reg.evento.nome} - ${reg.categoria.nome}`,
            payment_method_id: 'pix',
            payer: {
                email: reg.atleta?.email || 'email@pagador.com', // Must be valid email
                first_name: reg.atleta?.nome?.split(' ')[0] || 'Atleta',
                last_name: reg.atleta?.nome?.split(' ').slice(1).join(' ') || 'Sobrenome',
                identification: {
                    type: 'CPF',
                    number: reg.atleta?.cpf || '19119119100' // Sandbox allows dummy. Prod needs valid.
                }
            },
            notification_url: `https://nocautepages.com/api/payments/webhook` // Optional for now
        };

        // 4. Call Mercado Pago
        const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': registrationId // Prevent double charge
            },
            body: JSON.stringify(paymentData)
        });

        const mpResult = await mpResponse.json();

        if (mpResult.status === 400 || mpResult.error) {
            console.error("MP Error:", mpResult);
            return NextResponse.json({ error: 'Erro no Mercado Pago: ' + (mpResult.message || 'Dados inválidos') }, { status: 400 });
        }

        // 5. Update Registration with Payment ID
        await supabase
            .from('eventos_inscricoes')
            .update({
                payment_id: mpResult.id.toString(),
                payment_status: mpResult.status
            })
            .eq('id', registrationId);

        // 6. Return QR Code
        const qrCodeBase64 = mpResult.point_of_interaction?.transaction_data?.qr_code_base64;
        const qrCodeCopyPaste = mpResult.point_of_interaction?.transaction_data?.qr_code;

        return NextResponse.json({
            paymentId: mpResult.id,
            qrCodeBase64,
            qrCodeCopyPaste,
            status: mpResult.status
        });

    } catch (err) {
        console.error("Payment API Error:", err);
        return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
    }
}
