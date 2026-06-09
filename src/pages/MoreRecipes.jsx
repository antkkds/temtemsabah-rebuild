import { useState } from 'react';
import { RECIPES } from '../data/recipes';
import { X, Clock, Users, ChefHat, Utensils } from 'lucide-react';

export default function MoreRecipes() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = RECIPES.filter(r => {
    const q = search.toLowerCase();
    if (r.title.toLowerCase().includes(q)) return true;
    if (r.subtitle && r.subtitle.toLowerCase().includes(q)) return true;
    if (r.description && r.description.toLowerCase().includes(q)) return true;
    // Check ingredients
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
    // Check instructions
    if (r.instructions) {
      for (const inst of r.instructions) {
        if (inst && inst.toLowerCase().includes(q)) return true;
      }
    }
    return false;
  });

  return (
    <main>
      {/* Header Banner */}
      <div style={{ background: '#f8f6f1', padding: '4rem 1rem', textAlign: 'center' }}>
        <h1
          style={{
            fontSize: 'clamp(29.768px, 1.861rem + ((1vw - 3.2px) * 2.526), 52px)',
            fontWeight: 600,
            color: '#000',
            margin: 0,
            marginBottom: '0.75rem',
          }}
        >
          More Recipes
        </h1>
        <p style={{
          fontSize: 'clamp(14px, 0.875rem + ((1vw - 3.2px) * 0.682), 20px)',
          color: '#555',
          maxWidth: 500,
          margin: '0 auto',
        }}>
          Delicious tempeh recipes crafted by Tem Tem Sabah
        </p>
        <div style={{ maxWidth: 400, margin: '1.5rem auto 0' }}>
          <input
            type="text"
            placeholder="Search recipes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: 9999,
              fontSize: '1rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Recipe Grid */}
      <div style={{ padding: '3rem 1rem', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1.5rem',
        }}>
          {filtered.map(recipe => (
            <div
              key={recipe.id}
              onClick={() => setSelected(recipe)}
              style={{
                cursor: 'pointer',
                borderRadius: 12,
                overflow: 'hidden',
                background: '#fff',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
            >
              <div style={{ aspectRatio: '1', overflow: 'hidden', background: '#f5f5f5' }}>
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                  onError={e => { e.target.src = recipe.thumbnail; }}
                />
              </div>
              <div style={{ padding: '1rem' }}>
                <h3 style={{
                  fontSize: 'clamp(14px, 0.875rem + ((1vw - 3.2px) * 0.227), 16px)',
                  fontWeight: 600,
                  color: '#000',
                  margin: 0,
                  marginBottom: '0.25rem',
                }}>
                  {recipe.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>
                  {recipe.type} · {recipe.cook}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recipe Detail Modal */}
      {selected && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setSelected(null)}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              background: '#fff',
              borderRadius: 16,
              maxWidth: 700,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '2rem',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setSelected(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: '#f5f5f5',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#333',
              }}
            >
              <X size={18} />
            </button>

            {/* Image */}
            <div style={{
              aspectRatio: '16/9',
              borderRadius: 12,
              overflow: 'hidden',
              background: '#f5f5f5',
              marginBottom: '1.5rem',
            }}>
              <img
                src={selected.image}
                alt={selected.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.target.src = selected.thumbnail; }}
              />
            </div>

            {/* Title & Meta */}
            <h2 style={{
              fontSize: 'clamp(20px, 1.25rem + ((1vw - 3.2px) * 1.364), 32px)',
              fontWeight: 600,
              color: '#000',
              margin: 0,
              marginBottom: '0.25rem',
            }}>
              {selected.title}
            </h2>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
              {selected.subtitle}
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#555' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> Prep: {selected.prep}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ChefHat size={14} /> Cook: {selected.cook}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={14} /> {selected.servings} servings</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Utensils size={14} /> {selected.cuisine}</span>
            </div>

            {selected.description && (
              <p style={{ color: '#333', lineHeight: 1.6, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                {selected.description}
              </p>
            )}

            {/* Ingredients with sub-groups */}
            <h3 style={{
              fontSize: 'clamp(15.747px, 0.984rem + ((1vw - 3.2px) * 0.938), 24px)',
              fontWeight: 600,
              color: '#00373e',
              marginBottom: '0.75rem',
            }}>
              Ingredients
            </h3>
            {selected.ingredients.map((group, gi) => (
              <div key={gi} style={{ marginBottom: '1rem' }}>
                {group.group && (
                  <h4 style={{
                    fontSize: 'clamp(14px, 0.875rem + ((1vw - 3.2px) * 0.455), 18px)',
                    fontWeight: 600,
                    color: '#000',
                    marginBottom: '0.4rem',
                    marginTop: '0.5rem',
                  }}>
                    {group.group}
                  </h4>
                )}
                <ul style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.8 }}>
                  {group.items.map((item, i) => (
                    <li key={i} style={{ fontSize: '0.9rem', color: '#333' }}>
                      <strong>{item[0]}</strong> — {item[1]}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Instructions */}
            <h3 style={{
              fontSize: 'clamp(15.747px, 0.984rem + ((1vw - 3.2px) * 0.938), 24px)',
              fontWeight: 600,
              color: '#00373e',
              marginBottom: '0.75rem',
            }}>
              Instructions
            </h3>
            <ol style={{ paddingLeft: '1.25rem', lineHeight: 1.8 }}>
              {selected.instructions.map((step, i) => (
                <li key={i} style={{ fontSize: '0.9rem', color: '#333', marginBottom: '0.5rem' }}>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </main>
  );
}
