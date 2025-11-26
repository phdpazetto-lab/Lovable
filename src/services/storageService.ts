import { supabase } from '../lib/supabaseClient';

type UploadResult = {
  path: string;
  publicUrl: string;
};

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Usuário não autenticado.');
  return data.user.id;
}

function buildStoragePath(parts: string[]) {
  return parts.filter(Boolean).join('/');
}

export async function uploadFileToBucket(
  bucket: string,
  file: File,
  options?: { prefix?: string }
): Promise<UploadResult> {
  const userId = await getCurrentUserId();
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const prefix = options?.prefix ?? '';
  const extension = file.name.split('.').pop();
  const safeExt = extension ? `.${extension}` : '';
  const randomName = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  const path = buildStoragePath([prefix, userId, String(year), month, `${randomName}${safeExt}`]);

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
    cacheControl: '3600',
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export function mapFilesToUrls(files: File[], bucket: string, prefix?: string) {
  return Promise.all(files.map((file) => uploadFileToBucket(bucket, file, { prefix }))).then((results) =>
    results.map((result) => result.publicUrl)
  );
}
