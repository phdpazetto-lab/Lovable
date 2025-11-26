import { supabase } from '../lib/supabaseClient';

export type Material = {
  id: number;
  user_id: string;
  nome: string;
  tipo: string;
  numero_serie: string;
  colaborador: string;
  data_entrega: string | null;
  created_at: string;
};

export type MaterialInput = {
  nome: string;
  tipo: string;
  numero_serie: string;
  colaborador: string;
  data_entrega?: string;
};

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Usuário não autenticado.');
  return data.user.id;
}

function normalizeMateriais(data: any[] = []): Material[] {
  return data.map((item) => ({
    ...item,
  }));
}

export async function getAllMateriais() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('materiais')
    .select('*')
    .eq('user_id', userId)
    .order('data_entrega', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return normalizeMateriais(data || []);
}

export async function getMaterialById(id: number) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('materiais')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw new Error(error.message);
  return normalizeMateriais([data || {}])[0];
}

export async function createMaterial(payload: MaterialInput) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('materiais')
    .insert({ ...payload, user_id: userId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return normalizeMateriais([data || {}])[0];
}

export async function updateMaterial(id: number, payload: MaterialInput) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('materiais')
    .update({ ...payload, user_id: userId })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return normalizeMateriais([data || {}])[0];
}

export async function removeMaterial(id: number) {
  const userId = await getCurrentUserId();
  const { error } = await supabase.from('materiais').delete().eq('id', id).eq('user_id', userId);
  if (error) throw new Error(error.message);
  return true;
}
