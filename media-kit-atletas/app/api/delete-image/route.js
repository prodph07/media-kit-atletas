import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Configura as chaves
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { url } = body;

    console.log("---------------------------------------------------");
    console.log("🗑️  TENTATIVA DE DELETAR IMAGEM");
    console.log("📥 URL Recebida:", url);

    if (!url) {
        console.log("❌ Erro: URL vazia");
        return NextResponse.json({ message: 'URL vazia' }, { status: 400 });
    }

    // --- LÓGICA ROBUSTA DE EXTRAÇÃO DE ID ---
    // Exemplo: https://res.cloudinary.com/nome/image/upload/v1234/atletas_assets/foto.jpg
    
    // 1. Pega tudo depois de "/upload/"
    const parts = url.split('/upload/');
    if (parts.length < 2) {
        console.log("❌ Erro: URL não parece ser do Cloudinary");
        return NextResponse.json({ message: 'URL inválida' }, { status: 400 });
    }

    let pathPart = parts[1]; // Ex: v123456/atletas_assets/foto.jpg

    // 2. Remove o número da versão (v12345/) se existir
    // O regex procura "v" seguido de números e uma barra
    pathPart = pathPart.replace(/^v\d+\//, ''); 

    // 3. Remove a extensão do arquivo (.jpg, .png)
    // Pega tudo antes do último ponto
    const publicId = pathPart.substring(0, pathPart.lastIndexOf('.'));

    console.log("🆔 Public ID Extraído:", publicId);

    // --- EXECUTA O DELETE NA CLOUDINARY ---
    const result = await cloudinary.uploader.destroy(publicId);

    console.log("✅ Resposta da Cloudinary:", result); 
    // Esperado: { result: 'ok' } se deu certo
    // Ou: { result: 'not found' } se o ID estiver errado
    console.log("---------------------------------------------------");

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ ERRO NO SERVIDOR:', error);
    return NextResponse.json({ message: 'Erro interno', error: error.message }, { status: 500 });
  }
}