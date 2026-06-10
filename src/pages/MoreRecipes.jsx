import { useState } from 'react';
import { RECIPES } from '../data/recipes';
import { Clock, Users, ChefHat, Utensils } from 'lucide-react';
import { RecipeDetailModal, VideoModal } from '../components/RecipeModals';

export default function MoreRecipes() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [videoModal, setVideoModal] = useState(null);

  const filtered = RECIPES.filter(r => {
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
      <div style={{ background: '#f8f6f1', padding: '4rem 1rem', textAlign: 'center' }}>
        <h1 style={{
          fontSize: 'clamp(29.768px, 1.861rem + ((1vw - 3.2px) * 2.526), 52px)',
          fontWeight: 600, color: '#00373e', margin: 0,
        }}>
          More Recipes
        </h1>
        <p style={{ fontSize: '1rem', color: '#666', marginTop: '0.5rem' }}>
          Delicious tempeh recipes crafted by Tem Tem Sabah
        </p>
        <div style={{ maxWidth: 400, margin: '1.5rem auto 0' }}>
          <input type="text" placeholder="Search recipes..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db',
              borderRadius: 9999, fontSize: '1rem', outline: 'none',
            }}
          />
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
                cursor: 'pointer', borderRadius: 12, overflow: 'hidden',
                background: '#fff', border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
            >
              <div style={{ aspectRatio: '1', overflow: 'hidden', background: '#f5f5f5', position: 'relative' }}>
                <img src={recipe.image} alt={recipe.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                  loading="lazy"
                  onError={e => { e.target.src = recipe.thumbnail; }}
                />
                {recipe.video && (
                  <button onClick={(e) => { e.stopPropagation(); setVideoModal(recipe.video); }}
                    style={{
                      position: 'absolute', bottom: 8, right: 8,
                      width: 36, height: 36, borderRadius: '50%',
                      background: '#000', border: '2px solid #fff',
                      color: '#fff', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      fontSize: 16, padding: 0,
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    title="Watch video"
                  >&#9654;</button>
                )}
              </div>
              <div style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: 'clamp(14px, 0.875rem + ((1vw - 3.2px) * 0.227), 16px)', fontWeight: 600, color: '#000', margin: 0, marginBottom: '0.25rem' }}>
                  {recipe.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>
                  {recipe.type} &middot; {recipe.cook}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <RecipeDetailModal recipe={selected} onClose={() => setSelected(null)} />
      <VideoModal videoUrl={videoModal} onClose={() => setVideoModal(null)} />
    </main>
  );
}
