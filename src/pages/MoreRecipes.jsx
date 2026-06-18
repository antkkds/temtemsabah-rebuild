import { useState, useEffect } from 'react';
import { RECIPES as STATIC_RECIPES } from '../data/recipes';
import { supabase } from '../lib/supabase';
import { Clock, Users, ChefHat, Utensils } from 'lucide-react';
import { RecipeDetailModal, VideoModal } from '../components/RecipeModals';
import { useLanguage } from '../context/LanguageContext';
import T from '../data/translations';

export default function MoreRecipes() {
  const { t } = useLanguage();
  const [recipes, setRecipes] = useState(STATIC_RECIPES);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [videoModal, setVideoModal] = useState(null);

  useEffect(() => {
    supabase.from('recipes').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          // Map DB format → UI format
          const mapped = data.map(r => ({
            id: r.id,
            title: r.title,
            subtitle: r.subtitle || '',
            image: r.image || '',
            thumbnail: r.thumbnail || '',
            type: r.type || '',
            cuisine: r.cuisine || '',
            prep: r.prep || '',
            cook: r.cook || '',
            servings: r.servings || 0,
            cost: r.cost || '',
            description: r.description || '',
            ingredients: r.ingredients || [],
            instructions: r.instructions || [],
            equipment: r.equipment || null,
            tips: r.tips || '',
            video: r.video || '',
            nutrition: r.nutrition || null,
          }));
          setRecipes(mapped);
        }
      })
      .catch(() => {}); // Fallback to static data on error
  }, []);

  const filtered = recipes.filter(r => {
    const q = search.toLowerCase();
    if (r.title.toLowerCase().includes(q)) return true;
    if (r.subtitle && r.subtitle.toLowerCase().includes(q)) return true;
    if (r.description && r.description.toLowerCase().includes(q)) return true;
    if (r.ingredients) {
      for (const g of r.ingredients) {
        if (g.items) {
          for (const item of g.items) {
            if (item[0] && item[0].toLowerCase().includes(q)) return true;
            if (item[1] && item[1].toLowerCase().includes(q)) return true;
          }
        }
      }
    }
    if (r.instructions) {
      for (const inst of r.instructions) {
        if (inst && inst.toLowerCase().includes(q)) return true;
      }
    }
    return false;
  });

  return (
    <main>
      <div style={{
        position: 'relative',
        backgroundImage: 'url(/temtemsabah/recipes-hero.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '6rem 1rem',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.55)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: 'clamp(29.768px, 1.861rem + ((1vw - 3.2px) * 2.526), 52px)',
            fontWeight: 600, color: '#ffffff', margin: 0,
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            {t(T.recipes.heading)}
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.9)', marginTop: '0.5rem', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
            {t({ en: 'Delicious tempeh recipes crafted by Tem Tem Sabah', ms: 'Resipi tempeh sedap hasil Tem Tem Sabah', 'zh-CN': 'Tem Tem Sabah 精心制作的美味天贝食谱', 'zh-TW': 'Tem Tem Sabah 精心製作的美味天貝食譜' })}
          </p>
          <div style={{ maxWidth: 400, margin: '1.5rem auto 0' }}>
            <input type="text" placeholder={t(T.recipes.search)} value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem', border: 'none',
                borderRadius: 9999, fontSize: '1rem', outline: 'none',
                background: 'rgba(255,255,255,0.9)',
                color: '#1a1a2e',
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1rem' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {filtered.map(recipe => (
            <div key={recipe.id}
              onClick={() => setSelected(recipe)}
              style={{
                background: '#fff', borderRadius: 12, overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)', cursor: 'pointer',
                border: '1px solid #e5e7eb', transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'}
            >
              {recipe.image && (
                <div style={{ position: 'relative' }}>
                  <img src={recipe.image} alt={recipe.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                  {recipe.video && (
                    <button onClick={(e) => { e.stopPropagation(); setVideoModal(recipe.video); }}
                      style={{
                        position: 'absolute', bottom: 8, right: 8,
                        width: 36, height: 36, borderRadius: '50%',
                        background: '#000', border: '2px solid #fff',
                        color: '#fff', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        fontSize: 16, padding: 0, transition: 'transform 0.15s',
                      }}
                      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                      title="Watch video"
                    >&#9654;</button>
                  )}
                </div>
              )}
              <div style={{ padding: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#00373e' }}>{recipe.title}</h3>
                {recipe.subtitle && <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.3rem 0 0' }}>{recipe.subtitle}</p>}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#999' }}>
                  {recipe.prep && <span><Clock size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{t(T.recipes.prep)}: {recipe.prep}</span>}
                  {recipe.cook && <span><Utensils size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{t(T.recipes.cook)}: {recipe.cook}</span>}
                  {recipe.servings && <span><Users size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{t(T.recipes.servings)}: {recipe.servings}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999', padding: '3rem 0' }}>
            {t(T.recipes.no_recipes)}
          </p>
        )}
      </div>

      {selected && (
        <RecipeDetailModal
          recipe={selected}
          onClose={() => setSelected(null)}
          onVideo={(url) => { setVideoModal(url); setSelected(null); }}
        />
      )}
      {videoModal && (
        <VideoModal url={videoModal} onClose={() => setVideoModal(null)} />
      )}
    </main>
  );
}
