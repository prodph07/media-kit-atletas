import { NextResponse } from 'next/server';

// 1. AVISA O CLOUDFLARE QUE ISSO É EDGE
export const runtime = 'edge';

export async function POST(req) {
  try {
    const { url } = await req.json();

    console.log("🗑️ Tentativa de deletar (Edge):", url);

    if (!url) return NextResponse.json({ message: 'URL vazia' }, { status: 400 });

    // --- LÓGICA DE EXTRAÇÃO DE ID (Mantida) ---
    // Remove query params se houver
    const urlSemQuery = url.split('?')[0];
    
    // Procura o padrão do Cloudinary para pegar o ID
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
    const match = urlSemQuery.match(regex);
    
    // Se não achar pelo regex, tenta pegar a última parte
    let publicId = '';
    if (match && match[1]) {
        publicId = match[1];
    } else {
        const parts = urlSemQuery.split('/');
        const lastPart = parts[parts.length - 1];
        publicId = lastPart.substring(0, lastPart.lastIndexOf('.'));
    }

    console.log("🆔 Public ID Extraído:", publicId);

    // --- 2. DELETAR USANDO FETCH (ADMIN API) ---
    // Usamos a Admin API do Cloudinary via REST, que funciona no Edge sem biblioteca
    // Endpoint: DELETE /resources/image/upload?public_ids[]=id
    
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Autenticação Basic Auth para a API Admin
    const auth = btoa(`${apiKey}:${apiSecret}`);

    // Como estamos no Edge, usamos params na URL para o DELETE
    const deleteUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?public_ids[]=${encodeURIComponent(publicId)}`;

    const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    console.log("✅ Resposta Cloudinary:", data);

    // Verifica se deletou (Cloudinary retorna { deleted: { "id": "deleted" } } ou partial)
    if (data.deleted && data.deleted[publicId] === 'deleted') {
        return NextResponse.json({ success: true });
    } else if (data.partial) {
        // As vezes retorna partial se achou mas deu aviso
        return NextResponse.json({ success: true, warning: 'Partial delete' });
    } else {
        // Se não achou (not_found), consideramos sucesso pois a imagem já não existe
        if (data.deleted && data.deleted[publicId] === 'not_found') {
             return NextResponse.json({ success: true, note: 'Image already gone' });
        }
        console.error("Erro Cloudinary:", data);
        return NextResponse.json({ message: 'Falha ao deletar' }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ ERRO NO SERVIDOR EDGE:', error);
    return NextResponse.json({ message: 'Erro interno', error: error.message }, { status: 500 });
  }
}