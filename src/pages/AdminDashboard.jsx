import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, LogOut, Search, ExternalLink } from 'lucide-react';

const API = 'http://127.0.0.1:3456';

const EMPTY_ARTICLE = {
  id: '', title: '', slug: '', excerpt: '', full_content: '',
  featured_image: '', category: 'External News', content_type: 'external',
  external_url: '', facebook_url: '', publish_date: '', author: 'Tem Tem Sabah',
  seo_title: '', seo_description: '', status: 'draft', featured: false,
  created_at: '', updated_at: '',
};

const inp = { padding: '0.5rem', borderRadius: 6, border: '1px solid #2a3040', background: '#1a1f2e', color: '#e0e6ed', fontSize: '0.85rem', outline: 'none', width: '100%' };

export default function AdminDashboard({ token, onLogout }) {
  const [tab, setTab] = useState('newsroom'); // 'newsroom' | 'recipes'
  const [view, setView] = useState('list'); // 'list' | 'edit' | 'recipe-edit'
  const [articles, setArticles] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = () => {
    Promise.all([
      fetch(API + '/api/newsroom').then(r => r.json()),
      fetch(API + '/api/recipes').then(r => r.json()),
    ]).then(([n, r]) => {
      setArticles(n.articles || []);
      setRecipes(r.recipes || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(fetchData, []);

  const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };

  const saveArticles = async (updated) => {
    const resp = await fetch(API + '/api/newsroom', { method: 'PUT', headers, body: JSON.stringify({ articles: updated }) });
    const d = await resp.json();
    setMsg(d.ok ? '✅ Saved!' : '❌ Error');
    setTimeout(() => setMsg(''), 2000);
    if (d.ok) setArticles(updated);
  };

  const saveRecipes = async (updated) => {
    const resp = await fetch(API + '/api/recipes', { method: 'PUT', headers, body: JSON.stringify({ recipes: updated }) });
    const d = await resp.json();
    setMsg(d.ok ? '✅ Recipes saved!' : '❌ Error');
    setTimeout(() => setMsg(''), 2000);
    if (d.ok) setRecipes(updated);
  };

  if (loading) return <div style={{ padding: '2rem', color: '#fff', background: '#0f1219', minHeight: '100vh' }}>Loading...</div>;

  return (
    <div style={{ background: '#0f1219', minHeight: '100vh', color: '#e0e6ed' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#1a1f2e', borderBottom: '1px solid #2a3040' }}>
        <button onClick={() => setTab('newsroom')} style={{
          padding: '0.4rem 1rem', borderRadius: 6, border: 'none',
          background: tab === 'newsroom' ? '#00373e' : 'transparent',
          color: tab === 'newsroom' ? 'white' : '#9ca3af', cursor: 'pointer', fontSize: '0.85rem'
        }}>📰 Newsroom</button>
        <button onClick={() => setTab('recipes')} style={{
          padding: '0.4rem 1rem', borderRadius: 6, border: 'none',
          background: tab === 'recipes' ? '#00373e' : 'transparent',
          color: tab === 'recipes' ? 'white' : '#9ca3af', cursor: 'pointer', fontSize: '0.85rem'
        }}>🍽 Recipes</button>
        <div style={{ flex: 1 }} />
        {msg && <span style={{ fontSize: '0.8rem', color: '#7fd962' }}>{msg}</span>}
        <button onClick={onLogout} style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '0.4rem 0.75rem',
          borderRadius: 6, border: '1px solid #2a3040', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: '0.8rem'
        }}><LogOut size={14} /></button>
      </div>

      {tab === 'newsroom' ? (
        view === 'edit' ? (
          <ArticleForm
            article={editing}
            onSave={async (a) => {
              let updated;
              if (a.id && articles.find(x => x.id === a.id)) {
                updated = articles.map(x => x.id === a.id ? { ...x, ...a, updated_at: new Date().toISOString() } : x);
              } else {
                updated = [...articles, { ...a, id: 'n-' + Date.now(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
              }
              await saveArticles(updated);
              setView('list');
              setEditing(null);
            }}
            onCancel={() => { setView('list'); setEditing(null); }}
          />
        ) : (
          <ArticleList
            articles={articles}
            search={search}
            setSearch={setSearch}
            filterType={filterType}
            setFilterType={setFilterType}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            onAdd={() => { setEditing({ ...EMPTY_ARTICLE, id: 'n-' + Date.now(), publish_date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }); setView('edit'); }}
            onEdit={(a) => { setEditing({ ...a }); setView('edit'); }}
            onDelete={async (id) => {
              if (!confirm('Delete this article?')) return;
              await saveArticles(articles.filter(x => x.id !== id));
            }}
          />
        )
      ) : tab === 'recipes' && view === 'recipe-edit' ? (
        <RecipeEditForm
          recipe={editingRecipe}
          onSave={async (r) => {
            let updated;
            if (r.id && recipes.find(x => x.id === r.id)) {
              updated = recipes.map(x => x.id === r.id ? r : x);
            } else {
              updated = [...recipes, { ...r, id: 'r-' + Date.now() }];
            }
            await saveRecipes(updated);
            setView('list');
            setEditingRecipe(null);
          }}
          onCancel={() => { setView('list'); setEditingRecipe(null); }}
        />
      ) : tab === 'recipes' ? (
        <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem' }}>🍽 Recipes Manager</h2>
            <button onClick={() => {
              setEditingRecipe({ id: '', title: 'New Recipe', subtitle: '', image: '', thumbnail: '',
                type: '', cuisine: '', prep: '', cook: '', servings: 4, cost: '', description: '',
                ingredients: [{ group: '', items: [['', '']] }], instructions: [''], equipment: '', notes: '', video: '' });
              setView('recipe-edit');
            }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.4rem 0.75rem',
              borderRadius: 6, border: 'none', background: '#00373e', color: 'white', cursor: 'pointer', fontSize: '0.8rem'
            }}><Plus size={14} /> Add Recipe</button>
          </div>
          {recipes.map(r => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem',
              marginBottom: '0.5rem', borderRadius: 6, background: '#1a1f2e', border: '1px solid #2a3040' }}>
              <img src={r.thumbnail || r.image} alt="" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover', background: '#0f1219' }}
                onError={e => e.target.style.display = 'none'} />
              <div style={{ flex: 1, fontSize: '0.85rem' }}>{r.title}</div>
              <button onClick={() => { setEditingRecipe({ ...r }); setView('recipe-edit'); }}
                style={{ background: 'none', border: 'none', color: '#59c2ff', cursor: 'pointer' }}><Pencil size={14} /></button>
              <button onClick={async () => {
                if (!confirm('Delete?')) return;
                await saveRecipes(recipes.filter(x => x.id !== r.id));
              }} style={{ background: 'none', border: 'none', color: '#f26d78', cursor: 'pointer' }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ── Article List ──
function ArticleList({ articles, search, setSearch, filterType, setFilterType, filterStatus, setFilterStatus, onAdd, onEdit, onDelete }) {
  const filtered = articles.filter(a => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.excerpt?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType && a.content_type !== filterType) return false;
    if (filterStatus && a.status !== filterStatus) return false;
    return true;
  });

  const CATEGORY_BG = { external: '#00373e', facebook: '#1877F2', internal: '#03081e', announcement: '#ffd976' };
  const STATUS_COLORS = { published: '#7fd962', draft: '#f59e0b', scheduled: '#59c2ff' };

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1.1rem' }}>📰 Newsroom Manager</h2>
        <button onClick={onAdd} style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '0.4rem 1rem',
          borderRadius: 6, border: 'none', background: '#00373e', color: 'white', cursor: 'pointer', fontSize: '0.85rem'
        }}><Plus size={14} /> Add News</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..."
            style={{ ...inp, paddingLeft: '2rem', fontSize: '0.8rem' }} />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...inp, width: 'auto', minWidth: 140, fontSize: '0.8rem' }}>
          <option value="">All Types</option>
          <option value="external">External News</option>
          <option value="facebook">Facebook Updates</option>
          <option value="internal">Internal Stories</option>
          <option value="announcement">Announcements</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inp, width: 'auto', minWidth: 120, fontSize: '0.8rem' }}>
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>
        <span>Total: <strong style={{ color: '#e0e6ed' }}>{articles.length}</strong></span>
        <span>Published: <strong style={{ color: '#7fd962' }}>{articles.filter(a => a.status === 'published').length}</strong></span>
        <span>Drafts: <strong style={{ color: '#f59e0b' }}>{articles.filter(a => a.status === 'draft').length}</strong></span>
        <span>Scheduled: <strong style={{ color: '#59c2ff' }}>{articles.filter(a => a.status === 'scheduled').length}</strong></span>
      </div>

      {/* Article List */}
      {filtered.length === 0 ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>No articles found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filtered.map(a => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem',
              borderRadius: 6, background: '#1a1f2e', border: '1px solid #2a3040',
            }}>
              <img src={a.featured_image} alt="" style={{ width: 48, height: 48, borderRadius: 4, objectFit: 'cover', background: '#0f1219' }}
                onError={e => e.target.style.display = 'none'} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: 2 }}>
                  <span style={{
                    fontSize: '0.65rem', padding: '1px 6px', borderRadius: 3,
                    background: CATEGORY_BG[a.content_type] || '#00373e',
                    color: a.content_type === 'announcement' ? '#000' : '#fff',
                  }}>{a.category}</span>
                  <span style={{
                    fontSize: '0.65rem', padding: '1px 6px', borderRadius: 3,
                    background: STATUS_COLORS[a.status] || '#6b7280',
                    color: '#000',
                  }}>{a.status}</span>
                  <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>{a.publish_date}</span>
                </div>
              </div>
              <button onClick={() => onEdit(a)} style={{ background: 'none', border: 'none', color: '#59c2ff', cursor: 'pointer', flexShrink: 0 }}><Pencil size={14} /></button>
              <button onClick={() => onDelete(a.id)} style={{ background: 'none', border: 'none', color: '#f26d78', cursor: 'pointer', flexShrink: 0 }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Article Form ──
function ArticleForm({ article, onSave, onCancel }) {
  const [e, setE] = useState(article);
  const [autoLoading, setAutoLoading] = useState(false);
  const [autoUrl, setAutoUrl] = useState('');
  const [formMsg, setFormMsg] = useState('');

  const update = (field, value) => setE({ ...e, [field]: value });

  // Auto-generate slug when title changes
  const handleTitle = (val) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    update('title', val);
    update('slug', slug);
  };

  // Auto Generate from URL
  const autoGenerate = async () => {
    let urlToFetch = autoUrl.trim();
    if (!urlToFetch) return;
    
    // Detect Facebook embed code and extract URL
    const fbEmbedMatch = urlToFetch.match(/data-href=["'](https:\/\/[^"']*facebook\.com[^"']*)["']/i);
    const fbIframeMatch = urlToFetch.match(/href=(https?%3A%2F%2F[^&]*facebook[^&]*)&/i);
    const fbEmbedBlockquote = urlToFetch.match(/<blockquote[^>]*cite=["'](https:\/\/[^"']*facebook\.com[^"']*)["']/i);
    
    if (fbEmbedMatch) {
      urlToFetch = fbEmbedMatch[1];
    } else if (fbIframeMatch) {
      // Decode the URL-encoded Facebook URL from the iframe src
      urlToFetch = decodeURIComponent(fbIframeMatch[1]);
    } else if (fbEmbedBlockquote) {
      urlToFetch = fbEmbedBlockquote[1];
    }
    
    // If input contains src="https://... extract that URL for non-embeds
    if (!urlToFetch.startsWith('http') && urlToFetch.includes('src="')) {
      const srcMatch = urlToFetch.match(/src=["'](https?:\/\/[^"']*)["']/i);
      if (srcMatch) urlToFetch = srcMatch[1];
    }
    
    // If it's still HTML but no FB URL found, try to extract any URL
    if (!urlToFetch.startsWith('http')) {
      const anyUrl = urlToFetch.match(/https?:\/\/[^\s"'<>]+/);
      if (anyUrl) urlToFetch = anyUrl[0];
    }
    
    setAutoLoading(true);
    try {
      const resp = await fetch('http://127.0.0.1:3456/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToFetch }),
      });
      const data = await resp.json();
      if (data.ok && data.meta) {
        const m = data.meta;
        // Auto-fill fields
        if (m.title) handleTitle(m.title);
        if (m.description) {
          // Truncate excerpt to ~200 chars for clean summary
          const excerpt = m.description.length > 200 ? m.description.substring(0, 197) + '...' : m.description;
          setE(prev => ({ ...prev, excerpt, seo_description: m.description }));
        }
        if (m.image) setE(prev => ({ ...prev, featured_image: m.image }));
        if (m.site_name) setE(prev => ({ ...prev, source: m.site_name }));
        // Set URL field based on content type
        const url = autoUrl.trim();  // Keep the original input (embed or URL) as reference
        
        // Detect if embed code or Facebook URL
        if (url.includes('facebook.com') || url.includes('fb.com') || url.includes('data-href=') || url.includes('fb-post')) {
          setE(prev => ({ ...prev, content_type: 'facebook', facebook_url: urlToFetch, category: 'Facebook Updates' }));
        } else {
          setE(prev => ({ ...prev, content_type: 'external', external_url: urlToFetch, category: 'External News' }));
        }
        setFormMsg('✅ Auto-generated!');
        setTimeout(() => setFormMsg(''), 2000);
      } else {
        setFormMsg('❌ Failed to extract');
      }
    } catch (err) {
      setFormMsg('❌ Error: ' + err.message);
    }
    setAutoLoading(false);
  };

  // Content type labels
  const typeLabels = {
    external: 'External News — links to external article',
    facebook: 'Facebook News — opens Facebook URL',
    internal: 'Internal Story — full hosted article',
    announcement: 'Announcement — brand updates & campaigns',
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1.2rem' }}>←</button>
        <h2 style={{ fontSize: '1.1rem' }}>{e.id && article.id ? '✏️ Edit Article' : '➕ New Article'}</h2>
      </div>

      {/* Auto Generate Section */}
      <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #2a3040', borderRadius: 8, background: '#0f1219' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '0.85rem', color: '#59c2ff', margin: 0 }}>
            ⚡ Auto Generate from URL
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Paste any article URL → auto-fills all fields</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            value={autoUrl}
            onChange={e => setAutoUrl(e.target.value)}
            placeholder="Paste article URL or Facebook embed code..."
            style={{ ...inp, flex: 1, fontSize: '0.8rem' }}
            onKeyDown={e => e.key === 'Enter' && autoGenerate()}
          />
          <button
            onClick={autoGenerate}
            disabled={autoLoading || !autoUrl.trim()}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 6,
              border: 'none',
              background: autoLoading ? '#2a3040' : '#59c2ff',
              color: autoLoading ? '#6b7280' : '#000',
              cursor: autoLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {autoLoading ? '⏳ Loading...' : '🚀 Auto Generate'}
          </button>
        </div>
        {formMsg && <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: formMsg.includes('✅') ? '#7fd962' : '#f26d78' }}>{formMsg}</p>}
        <p style={{ marginTop: '0.25rem', fontSize: '0.7rem', color: '#6b7280' }}>
          Supports: External News, Facebook posts, any article URL with OG tags
        </p>
      </div>

      {/* Smart form: Title + Slug always visible */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={label}>Title *</label>
          <input value={e.title} onChange={v => handleTitle(v.target.value)} placeholder="Article title" style={inp} />
        </div>
        <div>
          <label style={label}>Slug</label>
          <input value={e.slug} onChange={v => update('slug', v.target.value)} placeholder="auto-generated" style={inp} />
        </div>
      </div>

      {/* Content Type selector */}
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={label}>Content Type</label>
        <select value={e.content_type} onChange={v => update('content_type', v.target.value)} style={inp}>
          <option value="external">External News</option>
          <option value="facebook">Facebook News</option>
          <option value="internal">Internal Story</option>
          <option value="announcement">Announcement</option>
        </select>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>{typeLabels[e.content_type]}</p>
      </div>

      {/* Conditional fields based on content type */}
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {e.content_type === 'external' && (
          <div>
            <label style={label}>External URL *</label>
            <input value={e.external_url} onChange={v => update('external_url', v.target.value)} placeholder="https://www.example.com/article" style={inp} />
          </div>
        )}

        {e.content_type === 'facebook' && (
          <div>
            <label style={label}>Facebook URL *</label>
            <input value={e.facebook_url} onChange={v => update('facebook_url', v.target.value)} placeholder="https://www.facebook.com/..." style={inp} />
          </div>
        )}

        {(e.content_type === 'internal' || e.content_type === 'announcement') && (
          <div>
            <label style={label}>Full Content</label>
            <textarea value={e.full_content} onChange={v => update('full_content', v.target.value)} rows={8} placeholder="Write full article content here..." style={{ ...inp, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem' }} />
          </div>
        )}

        {/* Common fields */}
        <div>
          <label style={label}>Excerpt / Summary</label>
          <textarea value={e.excerpt} onChange={v => update('excerpt', v.target.value)} rows={2} placeholder="Brief summary" style={{ ...inp, resize: 'vertical' }} />
        </div>

        <div>
          <label style={label}>Featured Image URL</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input value={e.featured_image} onChange={v => update('featured_image', v.target.value)} placeholder="https://temtemsabah.com/wp-content/uploads/..." style={{ ...inp, flex: 1 }} />
            {e.featured_image && (
              <img src={e.featured_image} alt="preview" style={{ width: 60, height: 60, borderRadius: 4, objectFit: 'cover', background: '#0f1219' }}
                onError={e => e.target.style.display = 'none'} />
            )}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>Paste URL from Hostinger media gallery</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={label}>Category</label>
            <select value={e.category} onChange={v => update('category', v.target.value)} style={inp}>
              <option>External News</option>
              <option>Facebook Updates</option>
              <option>Internal Stories</option>
              <option>Announcements</option>
            </select>
          </div>
          <div>
            <label style={label}>Publish Date</label>
            <input value={e.publish_date} onChange={v => update('publish_date', v.target.value)} placeholder="June 8, 2024" style={inp} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={label}>Author</label>
            <input value={e.author} onChange={v => update('author', v.target.value)} placeholder="Tem Tem Sabah" style={inp} />
          </div>
          <div>
            <label style={label}>Status</label>
            <select value={e.status} onChange={v => update('status', v.target.value)} style={inp}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>

        {/* SEO Section */}
        <div style={{ border: '1px solid #2a3040', borderRadius: 6, padding: '0.75rem', marginTop: '0.5rem' }}>
          <h3 style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>SEO Settings</h3>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <input value={e.seo_title} onChange={v => update('seo_title', v.target.value)} placeholder="SEO Title (leave empty to use article title)" style={inp} />
            <textarea value={e.seo_description} onChange={v => update('seo_description', v.target.value)} rows={2} placeholder="SEO Description" style={{ ...inp, resize: 'vertical' }} />
          </div>
        </div>

        {/* Featured toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', fontSize: '0.85rem' }}>
          <input type="checkbox" checked={e.featured} onChange={v => update('featured', v.target.checked)} />
          Featured article (shows first)
        </label>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button onClick={() => onSave(e)} style={{ padding: '0.5rem 1.5rem', borderRadius: 6, border: 'none', background: '#00373e', color: 'white', cursor: 'pointer' }}>💾 Save</button>
        <button onClick={() => onSave({ ...e, status: 'draft' })} style={{ padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #f59e0b', background: 'transparent', color: '#f59e0b', cursor: 'pointer' }}>Save as Draft</button>
        <button onClick={onCancel} style={{ padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #2a3040', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );
}

const label = { display: 'block', marginBottom: 4, fontSize: '0.8rem', color: '#9ca3af' };

// ── Recipe Edit Form ──
function RecipeEditForm({ recipe, onSave, onCancel }) {
  const [e, setE] = useState(recipe);
  const update = (f, v) => setE({ ...e, [f]: v });

  return (
    <div style={{ padding: '1.5rem', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1.2rem' }}>←</button>
        <h2 style={{ fontSize: '1.1rem' }}>{e.id ? '✏️ Edit Recipe' : '➕ New Recipe'}</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div><label style={label}>Title</label><input value={e.title} onChange={v => update('title', v.target.value)} style={inp} /></div>
        <div><label style={label}>Subtitle</label><input value={e.subtitle} onChange={v => update('subtitle', v.target.value)} style={inp} /></div>
        <div><label style={label}>Image URL</label><input value={e.image} onChange={v => update('image', v.target.value)} style={inp} /></div>
        <div><label style={label}>Thumbnail</label><input value={e.thumbnail} onChange={v => update('thumbnail', v.target.value)} style={inp} /></div>
        <div><label style={label}>Type</label><input value={e.type} onChange={v => update('type', v.target.value)} style={inp} /></div>
        <div><label style={label}>Cuisine</label><input value={e.cuisine} onChange={v => update('cuisine', v.target.value)} style={inp} /></div>
        <div><label style={label}>Prep</label><input value={e.prep} onChange={v => update('prep', v.target.value)} style={inp} /></div>
        <div><label style={label}>Cook</label><input value={e.cook} onChange={v => update('cook', v.target.value)} style={inp} /></div>
        <div><label style={label}>Servings</label><input value={e.servings} onChange={v => update('servings', Number(v.target.value))} type="number" style={inp} /></div>
        <div><label style={label}>Cost</label><input value={e.cost} onChange={v => update('cost', v.target.value)} style={inp} /></div>
      </div>
      <div style={{ marginTop: '0.75rem' }}><label style={label}>Description</label>
        <textarea value={e.description} onChange={v => update('description', v.target.value)} rows={3} style={{ ...inp, width: '100%', resize: 'vertical' }} /></div>
      <div style={{ marginTop: '0.75rem' }}>
        <label style={label}>Ingredients (groups with items)</label>
        {e.ingredients?.map((g, gi) => (
          <div key={gi} style={{ marginBottom: '0.5rem', padding: '0.5rem', border: '1px solid #2a3040', borderRadius: 6 }}>
            <input value={g.group} onChange={v => { const gs = [...e.ingredients]; gs[gi] = { ...gs[gi], group: v.target.value }; update('ingredients', gs); }}
              placeholder="Group name (optional)" style={{ ...inp, marginBottom: '0.4rem', fontSize: '0.8rem' }} />
            {g.items.map((item, ii) => (
              <div key={ii} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.3rem' }}>
                <input value={item[0]} onChange={v => { const gs = [...e.ingredients]; gs[gi].items[ii][0] = v.target.value; update('ingredients', gs); }}
                  placeholder="Ingredient" style={{ ...inp, flex: 1, fontSize: '0.8rem' }} />
                <input value={item[1]} onChange={v => { const gs = [...e.ingredients]; gs[gi].items[ii][1] = v.target.value; update('ingredients', gs); }}
                  placeholder="Amount" style={{ ...inp, flex: 1, fontSize: '0.8rem' }} />
                <button onClick={() => { const gs = [...e.ingredients]; gs[gi].items = gs[gi].items.filter((_, j) => j !== ii); update('ingredients', gs); }}
                  style={{ background: 'none', border: 'none', color: '#f26d78', cursor: 'pointer' }}><Trash2 size={14} /></button>
              </div>
            ))}
            <button onClick={() => { const gs = [...e.ingredients]; gs[gi].items = [...gs[gi].items, ['', '']]; update('ingredients', gs); }}
              style={{ background: 'none', border: 'none', color: '#59c2ff', cursor: 'pointer', fontSize: '0.75rem' }}>+ Item</button>
          </div>
        ))}
        <button onClick={() => update('ingredients', [...(e.ingredients || []), { group: '', items: [['', '']] }])}
          style={{ background: 'none', border: '1px dashed #2a3040', color: '#9ca3af', padding: '0.3rem 0.75rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem' }}>+ Group</button>
      </div>
      <div style={{ marginTop: '0.75rem' }}>
        <label style={label}>Instructions</label>
        {e.instructions?.map((inst, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.3rem' }}>
            <span style={{ color: '#6b7280', fontSize: '0.8rem', paddingTop: '0.4rem', minWidth: 18 }}>{i + 1}.</span>
            <input value={inst} onChange={v => { const insts = [...e.instructions]; insts[i] = v.target.value; update('instructions', insts); }}
              placeholder="Step" style={{ ...inp, flex: 1, fontSize: '0.8rem' }} />
            <button onClick={() => update('instructions', e.instructions.filter((_, j) => j !== i))}
              style={{ background: 'none', border: 'none', color: '#f26d78', cursor: 'pointer' }}><Trash2 size={14} /></button>
          </div>
        ))}
        <button onClick={() => update('instructions', [...(e.instructions || []), ''])}
          style={{ background: 'none', border: '1px dashed #2a3040', color: '#9ca3af', padding: '0.3rem 0.75rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem' }}>+ Step</button>
      </div>
      <div style={{ marginTop: '0.75rem' }}>
        <label style={label}>Equipment (optional)</label>
        <input value={e.equipment || ''} onChange={v => update('equipment', v.target.value)} style={inp} />
      </div>
      <div style={{ marginTop: '0.75rem' }}>
        <label style={label}>TikTok Video URL (optional)</label>
        <input value={e.video || ''} onChange={v => update('video', v.target.value)} placeholder="https://www.tiktok.com/..." style={inp} />
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button onClick={() => onSave(e)} style={{ padding: '0.5rem 1.5rem', borderRadius: 6, border: 'none', background: '#00373e', color: 'white', cursor: 'pointer' }}>💾 Save Recipe</button>
        <button onClick={onCancel} style={{ padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #2a3040', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );
}
