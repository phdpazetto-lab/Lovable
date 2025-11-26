import { supabase } from '../lib/supabaseClient';

export type MaterialSolicitacao = {
  id: number;
  user_id: string;
  titulo: string;
  materiais_necessarios: string;
  motivo: string;
  data: string | null;
  urgencia: string;
  created_at: string;
};

export type MaterialSolicitacaoInput = {
  titulo: string;
  materiais_necessarios: string;
  motivo: string;
  data?: string;
  urgencia: string;
};

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Usuário não autenticado.');
  return data.user.id;
}

function normalize(data: any[] = []): MaterialSolicitacao[] {
  return data.map((item) => ({
    ...item,
    urgencia: item.urgencia ?? 'normal',
  }));
}

export async function getAllSolicitacoes() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('materiais_solicitacoes')
    .select('*')
    .eq('user_id', userId)
    .order('data', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return normalize(data || []);
}

export async function getSolicitacaoById(id: number) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('materiais_solicitacoes')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw new Error(error.message);
  return normalize([data || {}])[0];
}

export async function createSolicitacao(payload: MaterialSolicitacaoInput) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('materiais_solicitacoes')
    .insert({ ...payload, user_id: userId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return normalize([data || {}])[0];
}

export async function updateSolicitacao(id: number, payload: MaterialSolicitacaoInput) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('materiais_solicitacoes')
    .update({ ...payload, user_id: userId })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return normalize([data || {}])[0];
}

export async function removeSolicitacao(id: number) {
  const userId = await getCurrentUserId();
  const { error } = await supabase.from('materiais_solicitacoes').delete().eq('id', id).eq('user_id', userId);
  if (error) throw new Error(error.message);
  return true;
}
