import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, LogOut, Search, ExternalLink } from 'lucide-react';
import { supabase, getArticles, getRecipes, saveArticles as sbSaveArticles, saveRecipes as sbSaveRecipes, uploadImage } from '../lib/supabase';
import { callMagicVision } from '../lib/vision';
import AdminSettings from './AdminSettings';

const EMPTY_ARTICLE = {
  id: '', title: '', slug: '', excerpt: '', full_content: '',
  featured_image: '', category: 'External News', content_type: 'external',
  external_url: '', facebook_url: '', publish_date: '', author: 'Tem Tem Sabah',
  seo_title: '', seo_description: '', status: 'draft', featured: false,
  created_at: '', updated_at: '',
};

const inp = { padding: '0.5rem', borderRadius: 6, border: '1px solid #2a3040', background: '#1a1f2e', color: '#e0e6ed', fontSize: '0.85rem', outline: 'none', width: '100%' };

export default function AdminDashboard() {
  const token = localStorage.getItem('crm_token');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('crm_user') || 'null'));
  const [tab, setTab] = useState('newsroom');
  const [view, setView] = useState('list');
  const [articles, setArticles] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [crmUsers, setCrmUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  const isAdmin = () => user?.role === 'admin';
  const can = (perm) => user?.role === 'admin' || !!user?.permissions?.[perm];

  const logout = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    window.location.reload();
  };

  // 🪄 Magic Link: auto-fill recipe from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const getParam = (name) => params.get(name) || hashParams.get(name);
    const title = getParam('title');
    if (title) {
      setEditingRecipe({
        id: '', title, subtitle: getParam('subtitle') || '', image: getParam('image') || '',
        thumbnail: '', type: getParam('type') || 'snack', cuisine: getParam('cuisine') || '',
        prep: getParam('prep') || '', cook: getParam('cook') || '',
        servings: parseInt(getParam('servings')) || 4, cost: '', description: getParam('desc') || '',
        ingredients: [], instructions: [], equipment: [], tips: '', video: getParam('video') || '',
        nutrition: { calories: '', protein: '', carbs: '', fat: '' },
      });
      setView('recipe-edit');
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: articles }, { data: recipes }] = await Promise.all([
      getArticles(),
      getRecipes(),
    ]);
    setArticles(articles || []);
    setRecipes(recipes || []);
    if (can('users')) {
      const { data: users } = await supabase.from('crm_users').select('*').order('created_at', { ascending: true });
      setCrmUsers(users || []);
    }
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };

  const doSaveArticles = async (updated) => {
    const { error } = await sbSaveArticles(updated);
    setMsg(error ? '❌ ' + error.message : '✅ Saved!');
    setTimeout(() => setMsg(''), 2000);
    if (!error) setArticles(updated);
  };

  const doSaveRecipes = async (updated) => {
    const { error } = await sbSaveRecipes(updated);
    setMsg(error ? '❌ ' + error.message : '✅ Recipes saved!');
    setTimeout(() => setMsg(''), 2000);
    if (!error) setRecipes(updated);
  };

  if (loading) return <div style={{ padding: '2rem', color: '#fff', background: '#0f1219', minHeight: '100vh' }}>Loading...</div>;

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
        {can('users') && <button onClick={() => { setTab('users'); setView('list'); }} style={{
          padding: '0.4rem 1rem', borderRadius: 6, border: 'none',
          background: tab === 'users' ? '#00373e' : 'transparent',
          color: tab === 'users' ? 'white' : '#9ca3af', cursor: 'pointer', fontSize: '0.85rem'
        }}>👥 Users</button>}
        <button onClick={() => setTab('settings')} style={{
          padding: '0.4rem 1rem', borderRadius: 6, border: 'none',
          background: tab === 'settings' ? '#00373e' : 'transparent',
          color: tab === 'settings' ? 'white' : '#9ca3af', cursor: 'pointer', fontSize: '0.85rem'
        }}>⚙ Settings</button>
        <div style={{ flex: 1 }} />
        {user && <span style={{ fontSize: '0.75rem', color: '#6b7280', marginRight: '0.5rem' }}>{user.email}</span>}
        {msg && <span style={{ fontSize: '0.8rem', color: '#7fd962' }}>{msg}</span>}
        <button onClick={logout} style={{
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
              await doSaveArticles(updated);
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
              await doSaveArticles(articles.filter(x => x.id !== id));
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
            await doSaveRecipes(updated);
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
                await doSaveRecipes(recipes.filter(x => x.id !== r.id));
              }} style={{ background: 'none', border: 'none', color: '#f26d78', cursor: 'pointer' }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      ) : tab === 'users' ? (
        <div style={{ padding: '1.5rem', maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem' }}>👥 User Management</h2>
            <button onClick={() => setEditingUser({})} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.4rem 0.75rem',
              borderRadius: 6, border: 'none', background: '#00373e', color: 'white', cursor: 'pointer', fontSize: '0.8rem'
            }}><Plus size={14} /> Add User</button>
          </div>
          {editingUser !== null ? (
            <div style={{ background: '#1a1f2e', padding: '1.5rem', borderRadius: 8, border: '1px solid #2a3040' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>{editingUser.id ? '✏️ Edit User' : '➕ Add User'}</h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div><label style={labelS}>Email</label><input value={editingUser.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} style={inp} placeholder="email@example.com" /></div>
                <div><label style={labelS}>Name</label><input value={editingUser.name || ''} onChange={e => setEditingUser({...editingUser, name: e.target.value})} style={inp} placeholder="Display name" /></div>
                <div><label style={labelS}>{editingUser.id ? 'New Password (leave blank to keep)' : 'Password'}</label><input type="password" value={editingUser._password || ''} onChange={e => setEditingUser({...editingUser, _password: e.target.value})} style={inp} placeholder={editingUser.id ? 'Leave blank to keep current' : 'Password'} /></div>
                <div><label style={labelS}>Role</label>
                  <select value={editingUser.role || 'editor'} onChange={e => setEditingUser({...editingUser, role: e.target.value})} style={inp}>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div><label style={labelS}>Permissions</label>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {['newsroom','recipes','users','content'].map(p => (
                      <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9ca3af', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={editingUser.permissions?.[p] || false}
                          onChange={e => setEditingUser({...editingUser, permissions: {...(editingUser.permissions||{}), [p]: e.target.checked}})}
                          style={{ accentColor: '#00373e' }}
                        /> {p}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button onClick={async () => {
                  try {
                  if (editingUser.id) {
                    const body = { name: editingUser.name, email: editingUser.email, role: editingUser.role, permissions: editingUser.permissions };
                    if (editingUser._password) body.password = editingUser._password;
                    const r = await fetch('/api/crm/users/' + editingUser.id, { method: 'PUT', headers, body: JSON.stringify(body) });
                    const d = await r.json();
                    if (d.ok) { setMsg('✅ User updated'); fetchData(); setEditingUser(null); }
                    else setMsg('❌ ' + (d.error || 'Failed'));
                  } else {
                    const r = await fetch('/api/crm/users', { method: 'POST', headers, body: JSON.stringify({ email: editingUser.email, password: editingUser._password, name: editingUser.name, role: editingUser.role, permissions: editingUser.permissions }) });
                    const d = await r.json();
                    if (d.ok) { setMsg('✅ User created'); fetchData(); setEditingUser(null); }
                    else setMsg('❌ ' + (d.error || 'Failed'));
                  }
                  } catch { setMsg('❌ User mgmt unavailable from this URL'); }
                  setTimeout(() => setMsg(''), 2000);
                }} style={{ padding: '0.5rem 1.5rem', borderRadius: 6, border: 'none', background: '#00373e', color: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>💾 Save</button>
                <button onClick={() => setEditingUser(null)} style={{ padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #2a3040', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              {crmUsers.map(u => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#1a1f2e', borderRadius: 6, marginBottom: '0.5rem', border: '1px solid #2a3040' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{u.name} <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>({u.email})</span></div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Role: {u.role} | Permissions: {Object.entries(u.permissions||{}).filter(([,v]) => v).map(([k]) => k).join(', ')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setEditingUser(u)} style={{ background: 'none', border: 'none', color: '#59c2ff', cursor: 'pointer' }}><Pencil size={14} /></button>
                    {u.id !== crmUsers.find(x => x.role === 'admin')?.id && <button onClick={async () => {
                      if (!confirm('Delete ' + u.email + '?')) return;
                      try {
                      const r = await fetch('/api/crm/users/' + u.id, { method: 'DELETE', headers });
                      const d = await r.json();
                      if (d.ok) { setMsg('✅ User deleted'); fetchData(); }
                      else setMsg('❌ ' + (d.error || 'Failed'));
                      } catch { setMsg('❌ User mgmt unavailable'); }
                      setTimeout(() => setMsg(''), 2000);
                    }} style={{ background: 'none', border: 'none', color: '#f26d78', cursor: 'pointer' }}><Trash2 size={14} /></button>}
                  </div>
                </div>
              ))}
              {crmUsers.length === 0 && <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No users yet</p>}
            </div>
          )}
        </div>
      ) : tab === 'settings' ? (
        <AdminSettings setMsg={setMsg} />
      ) : null}
    </div>
  );
}

const labelS = { display: 'block', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500, marginBottom: '0.25rem' };
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
                onError={e => { e.target.style.background = '#2a3040'; e.target.style.display = 'none'; }} />
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
      const resp = await fetch('/api/extract', {
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
            <input value={e.facebook_url} onChange={v => {
              const url = v.target.value;
              update('facebook_url', url);
              // Auto-fill title and category when URL is pasted
              if (url.includes('facebook.com/') && !e.title) {
                const pageMatch = url.match(/facebook\.com\/([^\/\?]+)/);
                const name = pageMatch ? pageMatch[1] : 'Facebook';
                update('title', 'Facebook Post — ' + decodeURIComponent(name));
                update('slug', 'facebook-' + Date.now());
                update('category', 'Facebook Updates');
              }
            }} placeholder="https://www.facebook.com/..." style={inp} />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
              Paste any Facebook post URL. Title will auto-fill.
            </p>
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

        {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => {
          if (!e.title.trim()) { setFormMsg('⚠️ Title is empty — saving anyway'); }
          onSave({ ...e, status: 'published' });
        }} style={{
          padding: '0.5rem 1.5rem', borderRadius: 6, border: 'none',
          background: '#7fd962', color: '#000', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
        }}>📢 Publish</button>
        <button onClick={() => {
          if (!e.title.trim()) { setFormMsg('⚠️ Title is empty — saving anyway'); }
          onSave(e);
        }} style={{
          padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #2a3040',
          background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: '0.85rem'
        }}>💾 Save</button>
        <button onClick={() => onSave({ ...e, status: 'draft' })} style={{
          padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #f59e0b',
          background: 'transparent', color: '#f59e0b', cursor: 'pointer', fontSize: '0.85rem'
        }}>Save as Draft</button>
        <button onClick={onCancel} style={{
          padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #2a3040',
          background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: '0.85rem'
        }}>Cancel</button>
      </div>
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

      {/* Image URL - above Magic Key, full width */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={label}>Image URL</label>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          <input value={e.image} onChange={v => update('image', v.target.value)} placeholder="https://..." style={{ ...inp, flex: 1, minWidth: '200px' }} />
          <input type="file" accept="image/*" style={{ display: 'none' }} id="recipe-img-upload" onChange={async (ev) => {
            const file = ev.target.files?.[0]; if (!file) return;
            const { url, error } = await uploadImage(file, 'recipe');
            if (url) update('image', url);
            ev.target.value = '';
          }} />
          <button onClick={() => document.getElementById('recipe-img-upload').click()} style={{ padding: '0.4rem 0.7rem', borderRadius: 6, border: '1px solid #2a3040', background: '#1a1f2e', color: '#e0e6ed', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>📁 Browse</button>
          {e.image && (
            <img src={e.image} alt="" style={{ width: 48, height: 48, borderRadius: 4, objectFit: 'cover', background: '#0f1219' }}
              onError={e => e.target.style.display = 'none'} />
          )}
        </div>
      </div>

      {/* 🪄 Magic Key: paste image URL -> Gemini Vision -> autofill */}
      <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #2a3040', borderRadius: 8, background: '#0a1220' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', color: '#59c2ff', fontWeight: 600, marginBottom: '0.25rem' }}>🪄 Magic Key</label>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>Paste recipe image URL, or pick a photo → auto-fills fields</p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input id="magic-url-input" placeholder="https://example.com/recipe-photo.jpg" style={{ ...inp, flex: 1, fontSize: '0.8rem', minWidth: '200px' }} />
          <button id="magic-btn" onClick={async () => {
            const url = document.getElementById('magic-url-input').value.trim();
            if (!url) return;
            const btn = document.getElementById('magic-btn');
            btn.disabled = true; btn.textContent = '⏳';
            document.getElementById('magic-status').textContent = 'Sending to AI...';
            try {
              const result = await callMagicVision(url);
              if (result.recipe && result.recipe.title) {
                setE(result.recipe);
                document.getElementById('magic-status').textContent = '✅ Auto-filled! Review and save.';
              } else if (result.ocr) {
                document.getElementById('magic-status').textContent = '⚠️ OCR found text but could not parse.';
              } else {
                document.getElementById('magic-status').textContent = '❌ ' + (result.error || 'Failed');
              }
            } catch (err) {
              document.getElementById('magic-status').textContent = '❌ Error: ' + err.message;
            }
            btn.disabled = false; btn.textContent = '🪄 Magic';
          }} style={{ padding: '0.5rem 1rem', borderRadius: 6, border: 'none', background: '#59c2ff', color: '#000', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>🪄 Magic</button>
          <input type="file" accept="image/*" style={{ display: 'none' }} id="magic-photo-input" onChange={async (ev) => {
            const file = ev.target.files?.[0]; if (!file) return;
            const status = document.getElementById('magic-status');
            status.textContent = '📤 Uploading...';
            try { localStorage.setItem('last_recipe_photo', file.name); } catch {}
            const { url, error } = await uploadImage(file, 'recipe');
            if (error || !url) { status.textContent = '❌ Upload failed: ' + (error?.message || error); ev.target.value = ''; return; }
            document.getElementById('magic-url-input').value = url;
            status.textContent = '🪄 Processing with AI...';
              const btn = document.getElementById('magic-btn');
              btn.disabled = true; btn.textContent = '⏳';
              try {
                const result = await callMagicVision(url);
                if (result.recipe && result.recipe.title) { setE(result.recipe); status.textContent = '✅ Auto-filled! Review and save.'; }
                else if (result.ocr) { status.textContent = '⚠️ OCR found text but could not parse.'; }
                else { status.textContent = '❌ ' + (result.error || 'Failed'); }
              } catch (err) { status.textContent = '❌ Error: ' + err.message; }
                btn.disabled = false; btn.textContent = '🪄 Magic';
              ev.target.value = '';
            }} />
          <button onClick={() => document.getElementById('magic-photo-input').click()} style={{ padding: '0.5rem 0.8rem', borderRadius: 6, border: '1px solid #2a3040', background: '#1a1f2e', color: '#e0e6ed', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>📷 Photo</button>
          {typeof window !== 'undefined' && localStorage.getItem('last_recipe_photo') && (
            <span style={{ fontSize: '0.7rem', color: '#6b7280', alignSelf: 'center' }}>last: {localStorage.getItem('last_recipe_photo').slice(0, 20)}</span>
          )}
        </div>
        <p id="magic-status" style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.35rem' }}></p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div><label style={label}>Title</label><input value={e.title} onChange={v => update('title', v.target.value)} style={inp} /></div>
        <div><label style={label}>Subtitle</label><input value={e.subtitle} onChange={v => update('subtitle', v.target.value)} style={inp} /></div>
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
        <label style={label}>TikTok Video URL or Embed Code (optional)</label>
        <input value={e.video || ''} onChange={v => {
          const raw = v.target.value;
          // Detect TikTok embed codes and extract URL
          let url = raw;
          const blockquoteMatch = raw.match(/cite=["'](https:\/\/[^"']*tiktok\.com[^"']*)["']/i);
          const iframeMatch = raw.match(/src=["'](https:\/\/[^"']*tiktok\.com[^"']*)["']/i);
          const anyUrlMatch = raw.match(/(https:\/\/[a-z0-9]+\.tiktok\.com\/[^\s"'<>]+)/i);
          if (blockquoteMatch) url = blockquoteMatch[1];
          else if (iframeMatch) url = iframeMatch[1];
          else if (anyUrlMatch) url = anyUrlMatch[1];
          update('video', url);
        }} placeholder="Paste TikTok URL or embed code..." style={inp} />
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => onSave(e)} style={{
          padding: '0.5rem 1.5rem', borderRadius: 6, border: 'none',
          background: '#00373e', color: 'white', cursor: 'pointer', fontSize: '0.85rem'
        }}>💾 Save Recipe</button>
        <button onClick={onCancel} style={{
          padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #2a3040',
          background: 'transparent', color: '#9ca3af', cursor: 'pointer'
        }}>Cancel</button>
      </div>
    </div>
  );
}
