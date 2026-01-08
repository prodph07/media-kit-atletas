// app/api/validate-mission/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Dicionário de Prompts: O cérebro de cada missão
const MISSION_PROMPTS = {
  'STORY_INSTAGRAM': `
    Analise esta imagem.
    1. É um print de um Story do Instagram? (Interface, fontes, layout).
    2. Contém o texto "@nocautepages" ou "nocautepages" visível? (Pode ser texto pequeno ou sticker).
    Retorne JSON: { "valid": boolean, "reason": "motivo curto em pt-br" }
  `,
  'LINK_IN_BIO': `
    Analise esta imagem.
    1. É um print de um PERFIL do Instagram (Tela de edição ou visualização)?
    2. Na área de LINKS ou BIOGRAFIA, existe o texto "nocaute.pro" ou "fightnexus"?
    Retorne JSON: { "valid": boolean, "reason": "motivo curto em pt-br" }
  `,
  'GEAR_CHECK': `
    Analise esta imagem.
    1. Ela mostra equipamentos de luta (luvas de boxe/mma, caneleiras, bandagens, kimono, protetor bucal) organizados ou sendo usados? Eles podem estar fazendo alguma pose ou já estar em algum momento treinando.
    2. O contexto parece ser preparação para treino, vestiário ou tatame?
    Retorne JSON: { "valid": boolean, "reason": "motivo curto em pt-br" }
  `
};

export async function POST(req) {
  try {
    const { imageBase64, missionType } = await req.json();

    if (!imageBase64 || !missionType) {
      return NextResponse.json({ valid: false, reason: "Dados incompletos." }, { status: 400 });
    }

    // Seleciona o prompt correto
    const prompt = MISSION_PROMPTS[missionType];
    
    if (!prompt) {
      return NextResponse.json({ valid: false, reason: "Tipo de missão inválido." }, { status: 400 });
    }

    // Limpa header do base64 se necessário
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
    ]);

    const responseText = result.response.text();
    // Limpeza de segurança para garantir JSON válido
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    
    try {
        const validation = JSON.parse(cleanJson);
        return NextResponse.json(validation);
    } catch (e) {
        console.error("Erro JSON Gemini:", responseText);
        return NextResponse.json({ valid: false, reason: "Erro na análise da I.A." }, { status: 500 });
    }

  } catch (error) {
    console.error("Erro Validação IA:", error);
    return NextResponse.json({ valid: false, reason: "Erro interno no servidor." }, { status: 500 });
  }
}