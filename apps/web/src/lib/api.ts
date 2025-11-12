export interface EdgeResponse<T> {
  data: T | null;
  error: string | null;
}

async function callEdgeFunction<T>(path: string, init?: RequestInit): Promise<EdgeResponse<T>> {
  const res = await fetch(`/api/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    ...init
  });

  if (!res.ok) {
    return { data: null, error: `Edge function ${path} returned ${res.status}` };
  }

  try {
    const json = (await res.json()) as T;
    return { data: json, error: null };
  } catch (error) {
    return { data: null, error: 'Failed to parse response JSON' };
  }
}

export const api = {
  syncToSheets<T>(payload: T) {
    return callEdgeFunction('sync-to-sheets', {
      body: JSON.stringify(payload)
    });
  }
};
