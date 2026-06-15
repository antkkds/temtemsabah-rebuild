const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'sqqknubphqvrhtabtmjb';
const DB_PASS = 'hSiR0hAVivGlkMCj';
const SRC = path.join(__dirname, '..', 'src', 'data');

async function main() {
  const client = new Client({
    host: `db.${PROJECT_REF}.supabase.co`,
    port: 5432, database: 'postgres',
    user: 'postgres', password: DB_PASS,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log('✅ Connected, seeding data...');

  // Seed newsroom
  const rawNews = fs.readFileSync(path.join(SRC, 'newsroom.js'), 'utf-8');
  const newsMatch = rawNews.match(/export const NEWSROOM_DATA = (\[[\s\S]*?\n\]);/);
  if (newsMatch) {
    const articles = eval('(' + newsMatch[1] + ')');
    await client.query('DELETE FROM newsroom');
    for (const a of articles) {
      await client.query(`INSERT INTO newsroom (title, slug, excerpt, full_content, featured_image, category, content_type, external_url, facebook_url, publish_date, author, seo_title, seo_description, status, featured, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`, [
        a.title, a.slug, a.excerpt||'', a.full_content||'', a.featured_image||'',
        a.category||'External News', a.content_type||'external',
        a.external_url||'', a.facebook_url||'', a.publish_date||'',
        a.author||'Tem Tem Sabah', a.seo_title||'', a.seo_description||'',
        a.status||'draft', !!a.featured,
        a.created_at||new Date().toISOString(), a.updated_at||new Date().toISOString(),
      ]);
    }
    console.log(`✅ ${articles.length} newsroom articles`);
  }

  // Seed recipes
  const rawRec = fs.readFileSync(path.join(SRC, 'recipes.js'), 'utf-8');
  const recMatch = rawRec.match(/export const RECIPES = (\[[\s\S]*?\n\]);/);
  if (recMatch) {
    const recipes = eval('(' + recMatch[1] + ')');
    await client.query('DELETE FROM recipes');
    for (const r of recipes) {
      await client.query(`INSERT INTO recipes (recipe_id, title, subtitle, image, thumbnail, type, cuisine, prep, cook, servings, cost, description, ingredients, instructions, equipment, tips, video, nutrition) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`, [
        r.id, r.title, r.subtitle||'', r.image||'', r.thumbnail||'',
        r.type||'', r.cuisine||'', r.prep||'', r.cook||'',
        r.servings||4, r.cost||'', r.description||'',
        JSON.stringify(r.ingredients||[]), JSON.stringify(r.instructions||[]),
        JSON.stringify(r.equipment||[]), r.tips||'', r.video||'',
        JSON.stringify(r.nutrition||{}),
      ]);
    }
    console.log(`✅ ${recipes.length} recipes`);
  }

  await client.end();
  console.log('\nAll done!');
}

main().catch(console.error);
