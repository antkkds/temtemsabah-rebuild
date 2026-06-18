import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://sqqknubphqvrhtabtmjb.supabase.co';
const src = readFileSync('src/lib/supabase.js', 'utf8');
const match = src.match(/const ANON_KEY = '([^']+)'/);
const ANON_KEY = match ? match[1] : '';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

// Try uploading a small test
const testContent = new Blob(['test'], { type: 'text/plain' });
const { data, error } = await supabase.storage.from('recipe').upload('test-perm-' + Date.now() + '.txt', testContent, {
  cacheControl: '3600',
  upsert: false,
});

if (error) {
  console.log('Upload FAILED:', error.message);
} else {
  console.log('Upload SUCCESS:', data?.path);
  // Clean up
  await supabase.storage.from('recipe').remove([data.path]);
  console.log('Cleaned up test file');
}
