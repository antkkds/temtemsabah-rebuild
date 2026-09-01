import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sqqknubphqvrhtabtmjb.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxcWtudWJwaHF2cmh0YWJ0bWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0OTU1NzAsImV4cCI6MjA5NzA3MTU3MH0.N-Gs3GwYVErNdN7zfjS8Z2pi0ikgRHVKdDXJnUwEe-o';

export const supabase = createClient(SUPABASE_URL, ANON_KEY);

// Fast-fail wrapper: prevents UI hangs when Supabase is unreachable (project offline/deleted)
export const withTimeout = (promise, ms = 4000) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase request timed out')), ms)),
  ]);

// Current session helpers
export const getSession = () => supabase.auth.getSession();
export const login = (email, password) => supabase.auth.signInWithPassword({ email, password });
export const logout = () => supabase.auth.signOut();
export const onAuthChange = (callback) => supabase.auth.onAuthStateChange(callback);

// Newsroom
export const getArticles = async (status) => {
  let query = supabase.from('newsroom').select('*').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  return { data: data || [], error };
};

export const saveArticles = async (articles) => {
  if (!articles.length) return { data: [] };
  const { data, error } = await supabase.from('newsroom').upsert(articles, { onConflict: 'id' }).select();
  return { data, error };
};

// Recipes
export const getRecipes = async () => {
  const { data, error } = await supabase.from('recipes').select('*').order('created_at', { ascending: true });
  return { data: data || [], error };
};

export const saveRecipes = async (recipes) => {
  if (!recipes.length) return { data: [] };
  const { data, error } = await supabase.from('recipes').upsert(recipes, { onConflict: 'id' }).select();
  return { data, error };
};

// Client-side image compression: resize to max 1200px, JPEG q0.8
function compressImage(file, maxW = 1200) {
  return new Promise((resolve, reject) => {
    if (file.size < 200 * 1024 || !file.type.startsWith('image/')) {
      return resolve(file); // skip small files and non-images
    }
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w <= maxW && file.size < 1024 * 1024) {
        URL.revokeObjectURL(img.src);
        return resolve(file); // small enough already
      }
      if (w > maxW) { h = h * maxW / w; w = maxW; }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      c.toBlob(blob => {
        URL.revokeObjectURL(img.src);
        if (blob) resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
        else resolve(file);
      }, 'image/jpeg', 0.8);
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

// Upload image to Supabase Storage (auto-compresses large images)
export const uploadImage = async (file, folder = 'recipe') => {
  if (file.size > 10 * 1024 * 1024) return { error: 'File too large. Max 10MB.' };
  const compressed = await compressImage(file);
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2,6)}.jpg`;
  const { data, error } = await supabase.storage.from(folder).upload(fileName, compressed, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) return { error };
  const { data: { publicUrl } } = supabase.storage.from(folder).getPublicUrl(fileName);
  return { url: publicUrl };
};
