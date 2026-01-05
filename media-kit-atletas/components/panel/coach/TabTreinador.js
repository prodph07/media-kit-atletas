import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Medal, Users, GraduationCap, Clock, Award, CheckCircle, Search, Plus, Trash2, ExternalLink, Clock3, Lock } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SERVICOS_COMUNS = [
    { id: 'personal', label: 'Personal Fight', desc: 'Aulas particulares 1x1' },
    { id: 'group', label: 'Aulas em Grupo', desc: 'Turmas regulares na academia' },
    { id: 'online', label: 'Consultoria Online', desc: 'Análise de vídeo e treinos' },
    { id: 'seminar', label: 'Seminários', desc: 'Disponível para viagens' },
    { id: 'corner', label: 'Corner / Eventos', desc: 'Acompanhamento em lutas' }
];

// Adicione isPremium nas props
export default function TabTreinador({ perfil, setPerfil, isPremium }) {
    
    // Estados locais
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [meusAlunos, setMeusAlunos] = useState([]); 

    // Carregar alunos ao abrir a aba
    useEffect(() => {
        fetchStudents();
    }, [perfil.id]);

    const fetchStudents = async () => {
        if (!perfil.id) return;
        // Busca na tabela RELACOES
        const { data, error } = await supabase
            .from('relacoes')
            .select(`
                id, status, initiated_by,
                student:atletas!student_id(id, nome, apelido, foto_url, slug)
            `)
            .eq('coach_id', perfil.id); // Onde EU sou o treinador

        if (!error && data) {
            setMeusAlunos(data);
        }
    };

    const updateCoachDetail = (field, value) => {
        setPerfil(prev => ({ ...prev, coach_details: { ...prev.coach_details, [field]: value } }));
    };

    // BUSCA DE ATLETAS
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm || searchTerm.length < 3) return;
        setIsSearching(true);
        const { data, error } = await supabase
            .from('atletas')
            .select('id, nome, apelido, foto_url, slug')
            .or(`nome.ilike.%${searchTerm}%,apelido.ilike.%${searchTerm}%`)
            .eq('is_athlete', true)
            .neq('id', perfil.id)
            .limit(5);

        if (!error) setSearchResults(data || []);
        setIsSearching(false);
    };

    // --- LÓGICA DE ENVIO DE CONVITE (COM TRAVA FREE) ---
    const sendInvite = async (student) => {
        const studentId = student.id;
        const coachId = perfil.id;

        // TRAVA: Limite de 2 alunos para Free
        // Conta apenas alunos com status 'accepted' (ativos) ou 'pending' (vaga reservada)
        const activeStudentsCount = meusAlunos.filter(a => a.status === 'accepted' || a.status === 'pending').length;
        
        if (!isPremium && activeStudentsCount >= 2) {
            alert("🔒 Limite do Plano Grátis Atingido (2 Alunos).\n\nFaça o upgrade para Premium para adicionar ilimitados alunos à sua equipe.");
            return;
        }

        // 1. Verifica se JÁ EXISTE uma relação inversa (O aluno me convidou antes?)
        const { data: existingReverse } = await supabase
            .from('relacoes')
            .select('*')
            .eq('coach_id', coachId)
            .eq('student_id', studentId)
            .single();

        if (existingReverse) {
            if (existingReverse.status === 'accepted') {
                alert("Vocês já estão conectados!");
                return;
            }
            // Se existe e fui EU que criei, não faz nada
            if (existingReverse.initiated_by === coachId) {
                alert("Você já enviou um convite. Aguarde o aceite.");
                return;
            }
            // Se existe e foi ELE que criou, ACEITA AUTOMATICAMENTE (Aceite Mútuo)
            const { error: updateError } = await supabase
                .from('relacoes')
                .update({ status: 'accepted' })
                .eq('id', existingReverse.id);
            
            if (!updateError) {
                alert(`Vínculo confirmado! ${student.apelido || student.nome} agora é seu aluno.`);
                fetchStudents(); // Recarrega lista
                setSearchResults([]);
                setSearchTerm('');
            }
            return;
        }

        // 2. Se não existe relação nenhuma, CRIA O CONVITE PENDENTE
        const { error: insertError } = await supabase
            .from('relacoes')
            .insert({
                coach_id: coachId,
                student_id: studentId,
                initiated_by: coachId, // Fui eu
                status: 'pending'
            });

        if (insertError) {
            alert("Erro ao convidar: " + insertError.message);
        } else {
            alert("Convite enviado! O atleta precisa aceitar.");
            fetchStudents();
            setSearchResults([]);
            setSearchTerm('');
        }
    };

    // Remover vínculo ou cancelar convite
    const removeRelation = async (relationId) => {
        if (!confirm("Tem certeza que deseja remover este vínculo/convite?")) return;
        const { error } = await supabase.from('relacoes').delete().eq('id', relationId);
        if (!error) fetchStudents();
    };

    const details = perfil.coach_details || {};

    // Função de serviços (checkboxes)
    const toggleService = (serviceId) => {
        const currentServices = perfil.coach_details?.services || [];
        let newServices;
        if (currentServices.includes(serviceId)) newServices = currentServices.filter(s => s !== serviceId);
        else newServices = [...currentServices, serviceId];
        updateCoachDetail('services', newServices);
    };

    return (
        <div className="space-y-6">
            
            {/* AUTORIDADE */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 mb-6"><GraduationCap className="text-orange-500" /><h3 className="text-orange-500 font-bold uppercase text-sm">Credenciais</h3></div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="text-xs text-slate-500">Graduação</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={details.graduation || ''} onChange={(e) => updateCoachDetail('graduation', e.target.value)} /></div>
                    <div><label className="text-xs text-slate-500">Tempo (Anos)</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" type="number" value={details.experience_years || ''} onChange={(e) => updateCoachDetail('experience_years', e.target.value)} /></div>
                    <div><label className="text-xs text-slate-500">Equipe</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={details.team || ''} onChange={(e) => updateCoachDetail('team', e.target.value)} /></div>
                    <div><label className="text-xs text-slate-500">Linhagem</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={details.lineage || ''} onChange={(e) => updateCoachDetail('lineage', e.target.value)} /></div>
                </div>
            </div>

            {/* --- LISTA E BUSCA DE ALUNOS --- */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-orange-500 font-bold uppercase text-sm flex items-center gap-2">
                        <Users size={18}/> Gerenciar Alunos
                    </h3>
                    
                    {/* Indicador de Limite Free */}
                    {!isPremium && (
                        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700 flex items-center gap-1">
                            {meusAlunos.length >= 2 ? <Lock size={12} className="text-red-500"/> : <Users size={12}/>}
                            {meusAlunos.length} / 2 (Free)
                        </span>
                    )}
                </div>
                
                {/* BUSCA */}
                <div className="relative mb-6">
                    <div className="flex gap-2">
                        <input className="w-full bg-black border border-slate-700 p-2 rounded text-white focus:border-orange-500" placeholder="Buscar atleta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}/>
                        <button onClick={handleSearch} disabled={isSearching} className="bg-slate-800 text-white px-4 rounded border border-slate-700">{isSearching ? '...' : <Search size={20}/>}</button>
                    </div>
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-slate-800 border border-slate-700 rounded-b-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                            {searchResults.map(atleta => (
                                <div key={atleta.id} className="flex items-center justify-between p-3 hover:bg-slate-700 transition border-b border-slate-700/50">
                                    <div className="flex items-center gap-3">
                                        <img src={atleta.foto_url || "https://placehold.co/100"} className="w-10 h-10 rounded-full object-cover border border-slate-600"/>
                                        <div><p className="font-bold text-white text-sm">{atleta.apelido || atleta.nome}</p></div>
                                    </div>
                                    <button 
                                        onClick={() => sendInvite(atleta)} 
                                        className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 ${!isPremium && meusAlunos.length >= 2 ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-500 text-white'}`}
                                    >
                                        {!isPremium && meusAlunos.length >= 2 ? <Lock size={14}/> : <Plus size={14}/>} Convidar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* LISTA DE ALUNOS (DO BANCO) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {meusAlunos.length === 0 ? (
                        <p className="text-slate-500 text-xs italic col-span-2 text-center py-4">Nenhum aluno vinculado.</p>
                    ) : (
                        meusAlunos.map((rel) => (
                            <div key={rel.id} className={`flex items-center justify-between p-3 rounded border ${rel.status === 'pending' ? 'bg-yellow-900/10 border-yellow-500/30' : 'bg-black/40 border-slate-800'}`}>
                                <div className="flex items-center gap-3">
                                    <img src={rel.student?.foto_url || "https://placehold.co/100"} className={`w-10 h-10 rounded-full object-cover border ${rel.status === 'pending' ? 'border-yellow-500/50' : 'border-slate-700'}`}/>
                                    <div>
                                        <p className="font-bold text-white text-sm">{rel.student?.apelido || rel.student?.nome}</p>
                                        
                                        {rel.status === 'pending' ? (
                                            <span className="text-[10px] font-bold text-yellow-500 flex items-center gap-1"><Clock3 size={10}/> Aguardando Aceite</span>
                                        ) : (
                                            <a href={`/${rel.student?.slug}`} target="_blank" className="text-[10px] text-cyan-500 hover:underline flex items-center gap-1">Ver Perfil <ExternalLink size={8}/></a>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => removeRelation(rel.id)} className="text-slate-600 hover:text-red-500 transition" title="Remover"><Trash2 size={16}/></button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* SERVIÇOS E METODOLOGIA (Mantidos iguais) */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-orange-500 font-bold uppercase text-sm mb-4">Serviços</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {SERVICOS_COMUNS.map((servico) => {
                        const isSelected = (details.services || []).includes(servico.id);
                        return <div key={servico.id} onClick={() => toggleService(servico.id)} className={`cursor-pointer p-4 rounded-lg border transition-all relative ${isSelected ? 'bg-orange-900/20 border-orange-500' : 'bg-black/40 border-slate-700 hover:border-slate-500'}`}><h4 className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>{servico.label}</h4>{isSelected && <CheckCircle size={16} className="absolute top-2 right-2 text-orange-500" />}</div>
                    })}
                </div>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-orange-500 font-bold uppercase text-sm mb-4">Metodologia</h3>
                <div className="mb-4"><label className="text-xs text-slate-500">Especialidades</label><input className="w-full bg-black border border-slate-700 p-2 rounded text-white" value={details.specialties || ''} onChange={(e) => updateCoachDetail('specialties', e.target.value)} /></div>
                <div><label className="text-xs text-slate-500">Sobre</label><textarea className="w-full bg-black border border-slate-700 p-2 rounded text-white" rows={4} value={details.methodology || ''} onChange={(e) => updateCoachDetail('methodology', e.target.value)} /></div>
            </div>
        </div>
    );
}