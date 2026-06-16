import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sqqknubphqvrhtabtmjb.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxcWtudWJwaHF2cmh0YWJ0bWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0OTU1NzAsImV4cCI6MjA5NzA3MTU3MH0.N-Gs3GwYVErNdN7zfjS8Z2pi0ikgRHVKdDXJnUwEe-o';

export const supabase = createClient(SUPABASE_URL, ANON_KEY);

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
  const { error: delErr } = await supabase.from('newsroom').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) return { error: delErr };
  if (!articles.length) return { data: [] };
  const { data, error } = await supabase.from('newsroom').insert(articles).select();
  return { data, error };
};

// Recipes
export const getRecipes = async () => {
  const { data, error } = await supabase.from('recipes').select('*').order('created_at', { ascending: true });
  return { data: data || [], error };
};

export const saveRecipes = async (recipes) => {
  const { error: delErr } = await supabase.from('recipes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) return { error: delErr };
  if (!recipes.length) return { data: [] };
  const { data, error } = await supabase.from('recipes').insert(recipes).select();
  return { data, error };
};

// Upload image to Supabase Storage
export const uploadImage = async (file, folder = 'recipe') => {
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const { data, error } = await supabase.storage.from(folder).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) return { error };
  const { data: { publicUrl } } = supabase.storage.from(folder).getPublicUrl(fileName);
  return { url: publicUrl };
};
