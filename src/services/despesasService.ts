import { supabase } from '../lib/supabaseClient';

export type ExpenseStatus = 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'PAGO';

export interface Expense {
  id: number;
  user_id: string;
  date: string;
  reference_month: string;
  category: string;
  description: string;
  amount: number;
  cost_center?: string | null;
  status: ExpenseStatus;
  comprovante_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseInput {
  date: string;
  reference_month: string;
  category: string;
  description: string;
  amount: number;
  cost_center?: string | null;
  status?: ExpenseStatus;
  comprovante_url?: string | null;
}

export const COMPROVANTES_BUCKET = 'comprovantes-despesas';
export const COMPROVANTE_ALLOWED_TYPES = ['application/pdf', 'image/*'];
export const COMPROVANTE_MAX_SIZE = 10 * 1024 * 1024; // 10MB

function normalizeReferenceMonth(monthValue: string) {
  if (!monthValue) return monthValue;
  return monthValue.endsWith('-01') ? monthValue : `${monthValue}-01`;
}

export function isAllowedComprovanteType(file: File) {
  return file.type === 'application/pdf' || file.type.startsWith('image/');
}

function buildStoragePath(userId: string, reference: string | Date, extension: string) {
  const referenceDate = typeof reference === 'string' ? new Date(reference) : reference;
  const baseDate = Number.isNaN(referenceDate.getTime()) ? new Date() : referenceDate;
  const year = baseDate.getUTCFullYear();
  const month = `${baseDate.getUTCMonth() + 1}`.padStart(2, '0');
  return `${userId}/${year}/${month}/${crypto.randomUUID()}.${extension}`;
}

function getFileExtension(file: File) {
  const nameExt = file.name.split('.').pop();
  if (nameExt) return nameExt.toLowerCase();
  if (file.type === 'application/pdf') return 'pdf';
  if (file.type.startsWith('image/')) return file.type.split('/')[1];
  return 'bin';
}

export async function uploadComprovante(file: File, userId: string, referenceDate: string | Date) {
  if (!isAllowedComprovanteType(file)) {
    throw new Error('Tipo de arquivo não suportado. Envie uma imagem ou PDF.');
  }

  if (file.size > COMPROVANTE_MAX_SIZE) {
    throw new Error('Arquivo maior que o limite de 10MB.');
  }

  const extension = getFileExtension(file);
  const path = buildStoragePath(userId, referenceDate, extension);

  const { data, error } = await supabase.storage
    .from(COMPROVANTES_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    throw error;
  }

  return data.path;
}

export async function deleteComprovante(path?: string | null) {
  if (!path) return;
  const { error } = await supabase.storage.from(COMPROVANTES_BUCKET).remove([path]);
  if (error) throw error;
}

export async function getComprovanteSignedUrl(path?: string | null, expiresInSeconds = 3600) {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from(COMPROVANTES_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error) throw error;
  return data.signedUrl;
}

export async function listExpenses(userId: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Expense[];
}

export async function createExpense(userId: string, payload: ExpenseInput) {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      ...payload,
      user_id: userId,
      amount: Number(payload.amount),
      reference_month: normalizeReferenceMonth(payload.reference_month),
      status: payload.status ?? 'PENDENTE',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Expense;
}

export async function updateExpense(id: number, payload: ExpenseInput) {
  const { data, error } = await supabase
    .from('expenses')
    .update({
      ...payload,
      amount: Number(payload.amount),
      reference_month: normalizeReferenceMonth(payload.reference_month),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Expense;
}

export async function deleteExpense(id: number) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

export function formatMonthValue(dateValue?: string | null) {
  if (!dateValue) return '';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return dateValue;
  const year = parsed.getUTCFullYear();
  const month = `${parsed.getUTCMonth() + 1}`.padStart(2, '0');
  return `${year}-${month}`;
}

export function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
