import { supabase } from '../lib/supabaseClient';
import { mapFilesToUrls } from './storageService';

export type MaterialOcorrencia = {
  id: number;
  user_id: string;
  equipamento: string;
  patrimonio: string;
  data: string | null;
  descricao: string | null;
  anexos: string[];
  created_at: string;
};

export type MaterialOcorrenciaInput = {
  equipamento: string;
  patrimonio: string;
  data?: string;
  descricao?: string;
  anexos?: string[];
};

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Usuário não autenticado.');
  return data.user.id;
}

const BUCKET = 'materiais-ocorrencias';

export async function uploadOcorrenciaFiles(files: File[]) {
  if (!files.length) return [] as string[];
  return mapFilesToUrls(files, BUCKET, 'ocorrencias');
}

function normalize(data: any[] = []): MaterialOcorrencia[] {
  return data.map((item) => ({
    ...item,
    anexos: item.anexos ?? [],
  }));
}

export async function getAllOcorrencias() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('materiais_ocorrencias')
    .select('*')
    .eq('user_id', userId)
    .order('data', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return normalize(data || []);
}

export async function getOcorrenciaById(id: number) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('materiais_ocorrencias')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw new Error(error.message);
  return normalize([data || {}])[0];
}

export async function createOcorrencia(payload: MaterialOcorrenciaInput) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('materiais_ocorrencias')
    .insert({ ...payload, user_id: userId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return normalize([data || {}])[0];
}

export async function updateOcorrencia(id: number, payload: MaterialOcorrenciaInput) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('materiais_ocorrencias')
    .update({ ...payload, user_id: userId })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return normalize([data || {}])[0];
}

export async function removeOcorrencia(id: number) {
  const userId = await getCurrentUserId();
  const { error } = await supabase.from('materiais_ocorrencias').delete().eq('id', id).eq('user_id', userId);
  if (error) throw new Error(error.message);
  return true;
}
