import { X } from 'lucide-react';

export function RecipeDetailModal({ recipe, onClose }) {
  if (!recipe) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 9998,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', overflowY: 'auto',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16, maxWidth: 700, width: '100%',
        maxHeight: '90vh', overflowY: 'auto', position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'sticky', top: 8, float: 'right', margin: 8,
          background: '#fff', border: 'none', fontSize: '1.25rem', cursor: 'pointer',
          width: 32, height: 32, borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1,
        }}><X size={18} /></button>
        
        {/* Hero Image */}
        {recipe.image && (
          <img src={recipe.image} alt={recipe.title}
            style={{ width: '100%', height: 280, objectFit: 'cover' }}
          />
        )}
        
        <div style={{ padding: '1.5rem 2rem 2rem' }}>
          <h2 style={{ fontSize: 'clamp(26.465px, 1.654rem + ((1vw - 3.2px) * 2.082), 45px)', fontWeight: 600, color: '#000', marginBottom: '0.5rem' }}>
            {recipe.title}
          </h2>
          {recipe.subtitle && (
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>{recipe.subtitle}</p>
          )}
          
          {recipe.description && (
            <p style={{ fontSize: '0.9rem', color: '#333', lineHeight: 1.6, marginBottom: '1.5rem' }}>{recipe.description}</p>
          )}
          
          {/* Ingredients */}
          <h3 style={{ fontSize: 'clamp(15.747px, 0.984rem + ((1vw - 3.2px) * 0.938), 24px)', fontWeight: 600, color: '#00373e', marginBottom: '0.75rem' }}>
            Ingredients
          </h3>
          {recipe.ingredients && recipe.ingredients.map((group, gi) => (
            <div key={gi} style={{ marginBottom: '1rem' }}>
              {group.group && (
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#000', marginBottom: '0.25rem' }}>
                  {group.group}
                </h4>
              )}
              {group.items && group.items.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '0.25rem 0', borderBottom: '1px solid #f0f0f0',
                  fontSize: '0.85rem', color: '#333',
                }}>
                  <span>{item[0]}</span>
                  <span style={{ fontWeight: 500 }}>{item[1]}</span>
                </div>
              ))}
            </div>
          ))}
          
          {/* Instructions */}
          <h3 style={{ fontSize: 'clamp(15.747px, 0.984rem + ((1vw - 3.2px) * 0.938), 24px)', fontWeight: 600, color: '#00373e', marginBottom: '0.75rem' }}>
            Instructions
          </h3>
          <ol style={{ paddingLeft: '1.25rem', lineHeight: 1.8 }}>
            {recipe.instructions && recipe.instructions.map((step, i) => (
              <li key={i} style={{ fontSize: '0.9rem', color: '#333', marginBottom: '0.5rem' }}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export function VideoModal({ videoUrl, onClose }) {
  if (!videoUrl) return null;
  const embedUrl = videoUrl.startsWith('http') ? videoUrl : 'https://www.tiktok.com/embed/v2/' + videoUrl;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: 500, width: '100%' }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: -40, right: 0,
          background: 'none', border: 'none', color: '#fff',
          fontSize: '1.5rem', cursor: 'pointer',
        }}>&#10005;</button>
        <div style={{ position: 'relative', paddingBottom: '177.77%', height: 0, overflow: 'hidden', borderRadius: 12 }}>
          <iframe
            src={embedUrl}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
        <p style={{ color: '#9ca3af', fontSize: '0.8rem', textAlign: 'center', marginTop: '0.5rem' }}>
          <a href={videoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#59c2ff' }}>
            Open on TikTok &#8594;
          </a>
        </p>
      </div>
    </div>
  );
}
