import { supabase } from '../lib/supabaseClient';

export type Nota = {
  id: number;
  user_id: string;
  numero: string;
  emissor: string;
  tomador: string;
  valor: number;
  data_emissao: string | null;
  descricao: string | null;
  created_at: string;
};

export type NotaInput = {
  numero: string;
  emissor: string;
  tomador: string;
  valor: number;
  data_emissao?: string;
  descricao?: string;
};

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Usuário não autenticado.');
  return data.user.id;
}

function normalizeNotas(data: any[] = []): Nota[] {
  return data.map((item) => ({
    ...item,
    valor: Number(item.valor ?? 0),
  }));
}

export async function getAllNotas() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('notas')
    .select('*')
    .eq('user_id', userId)
    .order('data_emissao', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return normalizeNotas(data || []);
}

export async function getNotaById(id: number) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('notas')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw new Error(error.message);
  return normalizeNotas([data || {}])[0];
}

export async function createNota(payload: NotaInput) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('notas')
    .insert({ ...payload, user_id: userId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return normalizeNotas([data || {}])[0];
}

export async function updateNota(id: number, payload: NotaInput) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('notas')
    .update({ ...payload, user_id: userId })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return normalizeNotas([data || {}])[0];
}

export async function removeNota(id: number) {
  const userId = await getCurrentUserId();
  const { error } = await supabase.from('notas').delete().eq('id', id).eq('user_id', userId);
  if (error) throw new Error(error.message);
  return true;
}
