import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sqqknubphqvrhtabtmjb.supabase.co';
const ANON_KEY = 'eyJhbG...Ee-o';

const sb = createClient(SUPABASE_URL, ANON_KEY);

const { data, error } = await sb.from('newsroom').select('count').limit(1);
console.log('Result:', JSON.stringify({ data, error: error?.message }));
