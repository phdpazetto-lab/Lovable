import { supabase } from '../lib/supabaseClient';

export type Despesa = {
  id: number;
  user_id: string;
  titulo: string;
  descricao: string | null;
  valor: number;
  categoria: string | null;
  data: string | null;
  created_at: string;
};

export type DespesaInput = {
  titulo: string;
  descricao?: string;
  valor: number;
  categoria?: string;
  data?: string;
};

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Usuário não autenticado.');
  return data.user.id;
}

function normalizeDespesas(data: any[] = []): Despesa[] {
  return data.map((item) => ({
    ...item,
    valor: Number(item.valor ?? 0),
  }));
}

export async function getAllDespesas() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('despesas')
    .select('*')
    .eq('user_id', userId)
    .order('data', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return normalizeDespesas(data || []);
}

export async function getDespesaById(id: number) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('despesas')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw new Error(error.message);
  return normalizeDespesas([data || {}])[0];
}

export async function createDespesa(payload: DespesaInput) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('despesas')
    .insert({ ...payload, user_id: userId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return normalizeDespesas([data || {}])[0];
}

export async function updateDespesa(id: number, payload: DespesaInput) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('despesas')
    .update({ ...payload, user_id: userId })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return normalizeDespesas([data || {}])[0];
}

export async function removeDespesa(id: number) {
  const userId = await getCurrentUserId();
  const { error } = await supabase.from('despesas').delete().eq('id', id).eq('user_id', userId);
  if (error) throw new Error(error.message);
  return true;
}
