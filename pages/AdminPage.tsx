import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BarChart3, CalendarClock, ExternalLink, FileText, Lightbulb, LogOut, Mic, MicOff, Pause, Pencil, Play, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { API_BASE_URL } from '../services/api';

// Admin panel (/admin): statistics, all articles (with drafts and scheduled ones) and topic suggestions
// for the daily agent. Login: backend AdminController::login, token kept in localStorage.

const TOKEN_KEY = 'geo-admin-token';

type Status = 'published' | 'scheduled' | 'draft';
interface AdminPost {
  id: number; slug: string; title: string; excerpt: string; category: string | null; imageUrl: string | null;
  publishedAt: string | null; status: Status; paused?: boolean; views: number;
  facebook: 'shared' | 'failed' | null; facebookError: string | null; instagram: string | null; instagramError: string | null;
  content?: string;
  edit?: { categorySlug: string | null; content: string; author: string | null; featured: boolean };
}
interface CategoryOption { id: string; name: string }
interface Totals { views: number; visitors: number }
interface Stats {
  days: number; live: { visitors5min: number; views30min: number }; today: Totals; week: Totals; month: Totals;
  daily: { day: string; views: number; visitors: number }[];
  topArticles: { id: number; title: string; slug: string; views: number; visitors: number }[];
  topPages: { path: string; views: number }[]; referrers: { referrer: string; views: number }[];
  devices: Record<string, number>;
  recent: { path: string; ip: string | null; visitor: string; device: string | null; referrer: string | null; created_at: string; title: string | null }[];
}
interface Suggestion { id: number; text: string; source: 'typed' | 'voice'; forDate: string | null; usedAt: string | null; createdAt: string }

class Unauthorized extends Error {}

const call = async <T,>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> => {
  const token = localStorage.getItem(TOKEN_KEY) || '';
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  if (response.status === 401) throw new Unauthorized();
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || `Greška (${response.status})`);
  return payload as T;
};

const sarajevo = (iso: string | null, withDate = true) => iso
  ? new Date(iso).toLocaleString('bs-BA', { timeZone: 'Europe/Sarajevo', ...(withDate ? { day: '2-digit', month: '2-digit' } : {}), hour: '2-digit', minute: '2-digit' })
  : '—';
const tomorrow = () => {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Sarajevo' }));
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const STATUS: Record<Status, { label: string; className: string }> = {
  published: { label: 'Objavljeno', className: 'bg-emerald-100 text-emerald-800' },
  scheduled: { label: 'Zakazano', className: 'bg-blue-100 text-blue-800' },
  draft: { label: 'Draft', className: 'bg-amber-100 text-amber-800' },
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-stone-200 p-4 md:p-3 ${className}`}>{children}</div>
);

// ---------------------------------------------------------------- login

const Login: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { token } = await call<{ token: string }>('/admin/login', { method: 'POST', body: { username, password } });
      localStorage.setItem(TOKEN_KEY, token);
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-4 h-6 border-[3px] border-geo-green" />
          <span className="font-serif font-black text-2xl tracking-tight">GEOVIZIJA</span>
          <span className="ml-auto text-xs font-bold text-stone-500 uppercase">Admin</span>
        </div>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Korisničko ime" autoCapitalize="none"
          autoComplete="username" className="w-full border border-stone-300 rounded-xl px-4 py-3 text-base" />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Lozinka" type="password"
          autoComplete="current-password" className="w-full border border-stone-300 rounded-xl px-4 py-3 text-base" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="w-full bg-geo-green text-white font-bold rounded-xl py-3 disabled:opacity-50">
          {busy ? 'Prijava…' : 'Prijavi se'}
        </button>
      </form>
    </div>
  );
};

// ---------------------------------------------------------------- statistics

const StatsTab: React.FC<{ onOpen: (id: number) => void }> = ({ onOpen }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [days, setDays] = useState(7);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    call<Stats>(`/admin/stats?days=${days}`).then(s => { setStats(s); setError(''); }).catch(e => setError(e.message));
  }, [days]);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, [load]);

  if (error) return <Card><p className="text-red-600 text-sm">{error}</p></Card>;
  if (!stats) return <p className="text-stone-500 text-sm p-4">Učitavam…</p>;

  const max = Math.max(1, ...stats.daily.map(d => d.views));
  const devices = Object.entries(stats.devices) as [string, number][];
  const totalDevices = devices.reduce((sum, [, views]) => sum + Number(views), 0) || 1;

  return (
    <div className="space-y-4">
      <Card className="flex items-center gap-3 bg-emerald-950 text-white border-emerald-950">
        <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" /></span>
        <div><div className="text-2xl font-black">{stats.live.visitors5min}</div><div className="text-xs text-emerald-200">na sajtu (zadnjih 5 min)</div></div>
        <div className="ml-auto text-right"><div className="text-lg font-bold">{stats.live.views30min}</div><div className="text-xs text-emerald-200">pregleda / 30 min</div></div>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        {([['Danas', stats.today], ['7 dana', stats.week], ['30 dana', stats.month]] as const).map(([label, t]) => (
          <Card key={label} className="!p-3">
            <div className="text-xs text-stone-500 font-semibold">{label}</div>
            <div className="text-xl font-black">{t.views ?? 0}</div>
            <div className="text-xs text-stone-500">{t.visitors ?? 0} posjetilaca</div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center mb-3">
          <h3 className="font-bold">Pregledi po danu</h3>
          <select value={days} onChange={e => setDays(Number(e.target.value))} className="ml-auto text-sm border border-stone-300 rounded-lg px-2 py-1">
            <option value={7}>7 dana</option><option value={14}>14 dana</option><option value={30}>30 dana</option>
          </select>
        </div>
        <div className="flex items-end gap-1 h-32">
          {stats.daily.map(d => (
            <div key={d.day} className="flex-1 flex flex-col items-center justify-end h-full" title={`${d.day}: ${d.views} pregleda, ${d.visitors} posjetilaca`}>
              <span className="text-[10px] text-stone-500">{d.views}</span>
              <div className="w-full bg-geo-green rounded-t" style={{ height: `${(d.views / max) * 100}%`, minHeight: 2 }} />
              <span className="text-[10px] text-stone-400 mt-1">{d.day.slice(8)}.</span>
            </div>
          ))}
          {stats.daily.length === 0 && <p className="text-sm text-stone-500 m-auto">Još nema podataka.</p>}
        </div>
      </Card>

      <Card>
        <h3 className="font-bold mb-2">Najčitanije ({stats.days} dana)</h3>
        <ol className="divide-y divide-stone-100">
          {stats.topArticles.map((a, i) => (
            <li key={a.id}>
              <button onClick={() => onOpen(a.id)} className="w-full flex items-center gap-3 py-2 text-left">
                <span className="text-stone-400 font-bold w-5">{i + 1}</span>
                <span className="flex-1 text-sm font-semibold leading-snug">{a.title}</span>
                <span className="text-sm font-bold">{a.views}</span>
              </button>
            </li>
          ))}
          {stats.topArticles.length === 0 && <li className="text-sm text-stone-500 py-2">Još nema pregleda članaka.</li>}
        </ol>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-bold mb-2">Odakle dolaze</h3>
          {stats.referrers.map(r => (
            <div key={r.referrer} className="flex text-sm py-1"><span className="flex-1 truncate">{r.referrer}</span><span className="font-bold">{r.views}</span></div>
          ))}
          {stats.referrers.length === 0 && <p className="text-sm text-stone-500">Direktno / nepoznato.</p>}
        </Card>
        <Card>
          <h3 className="font-bold mb-2">Uređaji</h3>
          {devices.map(([device, views]) => (
            <div key={device} className="text-sm py-1">
              <div className="flex"><span className="flex-1">{device === 'mobile' ? 'Mobitel' : 'Računar'}</span><span className="font-bold">{Math.round((views / totalDevices) * 100)}%</span></div>
              <div className="h-1.5 bg-stone-100 rounded"><div className="h-1.5 bg-geo-green rounded" style={{ width: `${(views / totalDevices) * 100}%` }} /></div>
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <h3 className="font-bold mb-2">Zadnje posjete</h3>
        <div className="divide-y divide-stone-100">
          {stats.recent.map((v, i) => (
            <div key={i} className="py-2 text-sm">
              <div className="flex gap-2">
                <span className="text-stone-500 tabular-nums">{sarajevo(v.created_at.replace(' ', 'T') + 'Z', false)}</span>
                <span className="flex-1 truncate font-semibold">{v.title || v.path}</span>
              </div>
              <div className="text-xs text-stone-500 flex flex-wrap gap-x-3">
                <span className="font-mono">{v.ip || '—'}</span>
                <span>{v.device === 'mobile' ? 'mobitel' : 'računar'}</span>
                {v.referrer && <span>s {v.referrer}</span>}
                <span className="font-mono text-stone-400">#{v.visitor.slice(0, 6)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ---------------------------------------------------------------- articles

const renderContent = (content: string) => content.split(/\n+/).map(l => l.trim()).filter(Boolean).map((block, i) => {
  if (block.startsWith('## ')) return <h2 key={i} className="font-serif font-bold text-xl mt-6 mb-2">{block.slice(3)}</h2>;
  const image = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
  if (image) return <figure key={i} className="my-4"><img src={image[2]} alt={image[1]} className="w-full rounded-xl" loading="lazy" /><figcaption className="text-xs text-stone-500 mt-1">{image[1]}</figcaption></figure>;
  return <p key={i} className="mb-3 leading-relaxed text-stone-800">{block}</p>;
});

// A scheduled article's Page post is a scheduled Facebook post, not yet shared.
const facebookLabel = (post: AdminPost) => post.facebook === 'shared'
  ? (post.status === 'scheduled' ? 'zakazano' : 'objavljeno')
  : post.facebook === 'failed' ? 'greška' : '—';

// <input type="datetime-local"> works in the browser's own time zone.
const toLocalInput = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const field = 'w-full border border-stone-300 rounded-xl px-3 py-2 text-base';

const PostEditor: React.FC<{ post: AdminPost; onCancel: () => void; onSaved: () => void }> = ({ post, onCancel, onSaved }) => {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [title, setTitle] = useState(post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt ?? '');
  const [category, setCategory] = useState(post.edit?.categorySlug ?? '');
  const [content, setContent] = useState(post.edit?.content ?? post.content ?? '');
  const [author, setAuthor] = useState(post.edit?.author ?? '');
  const [featured, setFeatured] = useState(post.edit?.featured ?? false);
  const [draft, setDraft] = useState(post.status === 'draft');
  const [publishedAt, setPublishedAt] = useState(toLocalInput(post.publishedAt) || toLocalInput(new Date().toISOString()));
  const [cover, setCover] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    call<{ data: CategoryOption[] }>('/categories').then(r => setCategories(r.data)).catch(e => setError(e.message));
  }, []);

  const pickCover = (file: File | undefined) => {
    if (!file) return;
    // Shrunk to 2000px JPEG first: a phone photo as base64 can exceed the host's upload limit.
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 2000 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
      setCover(canvas.toDataURL('image/jpeg', 0.9));
      URL.revokeObjectURL(url);
    };
    img.onerror = () => setError('Slika se ne može učitati.');
    img.src = url;
  };

  const save = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Naslov i tekst ne mogu biti prazni.');
      return;
    }
    if (!draft && post.status === 'draft' && !window.confirm('Članak će biti objavljen (i podijeljen na Facebook/Instagram). Nastaviti?')) return;
    setBusy(true);
    setError('');
    try {
      // The cover first: publishing a draft needs one.
      if (cover) await call(`/posts/${post.id}/generate-image`, { method: 'POST', body: { image: cover } });
      await call(`/posts/${post.id}`, {
        method: 'PUT',
        body: {
          title: title.trim(), excerpt: excerpt.trim(), content, featured, cover_changed: !!cover,
          ...(category ? { category } : {}),
          ...(author.trim() ? { author: author.trim() } : {}),
          // Sent only when changed: the minute-precision input would otherwise drop stored seconds,
          // which counts as an edit and replaces a scheduled Facebook post for nothing.
          ...(draft !== (post.status === 'draft') || publishedAt !== toLocalInput(post.publishedAt)
            ? { published_at: draft ? null : new Date(publishedAt).toISOString() } : {}),
        },
      });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-16 space-y-4">
      <label className="block">
        <span className="text-xs font-bold text-stone-500">Naslovna slika</span>
        <img src={cover ?? post.imageUrl ?? ''} alt="" className={`w-full rounded-2xl mt-1 bg-stone-100 aspect-video object-cover ${cover || post.imageUrl ? '' : 'hidden'}`} />
        <input type="file" accept="image/*" onChange={e => pickCover(e.target.files?.[0])} className="mt-2 text-sm" />
      </label>
      <label className="block">
        <span className="text-xs font-bold text-stone-500">Naslov</span>
        <input value={title} onChange={e => setTitle(e.target.value)} className={`${field} font-bold`} />
      </label>
      <label className="block">
        <span className="text-xs font-bold text-stone-500">Uvod (excerpt)</span>
        <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={3} className={field} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-bold text-stone-500">Kategorija</span>
          <select value={category} onChange={e => setCategory(e.target.value)} className={field}>
            {!category && <option value="">—</option>}
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-bold text-stone-500">Autor</span>
          <input value={author} onChange={e => setAuthor(e.target.value)} className={field} />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={draft} onChange={e => setDraft(e.target.checked)} /> Draft
        </label>
        {!draft && (
          <label className="flex items-center gap-2 text-sm">
            Objava <input type="datetime-local" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} className="border border-stone-300 rounded-lg px-2 py-1.5" />
          </label>
        )}
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} /> Istaknuto
        </label>
      </div>
      <label className="block">
        <span className="text-xs font-bold text-stone-500">Tekst</span>
        <span className="block text-[11px] text-stone-400">Svaki red je odlomak · „## “ podnaslov · „![opis](putanja)“ slika</span>
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={20} className={`${field} font-serif leading-relaxed`} />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2 sticky bottom-0 bg-white py-3">
        <button onClick={onCancel} disabled={busy} className="flex-1 py-3 rounded-xl border border-stone-300 font-semibold">Odustani</button>
        <button onClick={save} disabled={busy} className="flex-1 py-3 rounded-xl bg-geo-green text-white font-bold disabled:opacity-50">
          {busy ? 'Spremam…' : 'Spremi'}
        </button>
      </div>
    </div>
  );
};

const PostDetail: React.FC<{ id: number; onClose: () => void; onDeleted: () => void; onSaved: () => void }> = ({ id, onClose, onDeleted, onSaved }) => {
  const [post, setPost] = useState<AdminPost | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    call<{ data: AdminPost }>(`/admin/posts/${id}`).then(r => setPost(r.data)).catch(e => setError(e.message));
  }, [id]);
  useEffect(load, [load]);

  const [ask, setAsk] = useState<Ask | null>(null);
  const remove = () => post && setAsk(deleteAsk(post, problems => {
    if (problems.length) window.alert(`Članak je obrisan, ali: ${problems.join(' ')}`);
    onDeleted();
  }));

  return (
    <div className="fixed inset-0 md:left-56 z-50 bg-white overflow-y-auto">
      <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-stone-200 flex items-center gap-2 px-4 py-3">
        <button onClick={onClose} className="p-2 -ml-2" aria-label="Zatvori"><X size={22} /></button>
        <span className="font-bold truncate flex-1">{post?.title ?? 'Učitavam…'}</span>
        {post && post.status !== 'draft' && (
          <a href={`/article/${post.slug}`} target="_blank" rel="noopener" className="p-2" aria-label="Otvori na sajtu"><ExternalLink size={20} /></a>
        )}
        {post && !editing && <button onClick={() => setEditing(true)} className="p-2" aria-label="Uredi"><Pencil size={20} /></button>}
        {post && <button onClick={remove} className="p-2 text-red-600" aria-label="Obriši"><Trash2 size={20} /></button>}
      </div>
      {error && <p className="text-red-600 text-sm p-4">{error}</p>}
      {ask && <ConfirmDialog ask={ask} onDone={() => setAsk(null)} />}
      {post && editing && (
        <PostEditor post={post} onCancel={() => setEditing(false)} onSaved={() => { setEditing(false); load(); onSaved(); }} />
      )}
      {post && !editing && (
        <article className="max-w-2xl mx-auto p-4 pb-16">
          {post.imageUrl && <img src={post.imageUrl} alt="" className="w-full rounded-2xl mb-4" />}
          <div className="flex flex-wrap gap-2 text-xs mb-3">
            <span className={`px-2 py-1 rounded-full font-bold ${STATUS[post.status].className}`}>{STATUS[post.status].label}</span>
            {post.paused && <span className="px-2 py-1 rounded-full font-bold bg-amber-100 text-amber-800">Pauzirano</span>}
            {post.category && <span className="px-2 py-1 rounded-full bg-stone-100 font-semibold">{post.category}</span>}
            <span className="px-2 py-1 rounded-full bg-stone-100">{sarajevo(post.publishedAt)}</span>
            <span className="px-2 py-1 rounded-full bg-stone-100 font-bold">{post.views} pregleda</span>
            <span className="px-2 py-1 rounded-full bg-stone-100">FB: {facebookLabel(post)}</span>
            <span className="px-2 py-1 rounded-full bg-stone-100">IG: {post.instagram ?? '—'}</span>
          </div>
          {(post.facebookError || post.instagramError) && (
            <p className="text-xs text-red-600 mb-3">{[post.facebookError, post.instagramError].filter(Boolean).join(' · ')}</p>
          )}
          <h1 className="font-serif font-black text-2xl leading-tight mb-2">{post.title}</h1>
          <p className="text-stone-600 italic mb-4">{post.excerpt}</p>
          {post.content && renderContent(post.content)}
        </article>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- article actions (schedule, pause, delete)

// The site's own month names (as on articles), week from Monday.
const BOSNIAN = {
  firstDayOfWeek: 1,
  weekdays: {
    shorthand: ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'] as [string, string, string, string, string, string, string],
    longhand: ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'] as [string, string, string, string, string, string, string],
  },
  months: {
    shorthand: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'] as [string, string, string, string, string, string, string, string, string, string, string, string],
    longhand: ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni', 'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'] as [string, string, string, string, string, string, string, string, string, string, string, string],
  },
  time_24hr: true,
};

const Modal: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => (
  <div className="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center p-3" onClick={onClose}>
    <div className="w-full max-w-sm bg-white rounded-2xl p-4 space-y-3 shadow-xl" onClick={e => e.stopPropagation()}>{children}</div>
  </div>
);

interface Ask { title: string; text: string; confirm: string; danger?: boolean; run: () => Promise<void> }

const ConfirmDialog: React.FC<{ ask: Ask; onDone: () => void }> = ({ ask, onDone }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const go = async () => {
    setBusy(true);
    try {
      await ask.run();
      onDone();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };
  return (
    <Modal onClose={() => !busy && onDone()}>
      <h3 className="font-bold">{ask.title}</h3>
      <p className="text-sm text-stone-600">{ask.text}</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button onClick={onDone} disabled={busy} className="flex-1 py-2.5 rounded-xl border border-stone-300 font-semibold text-sm">Odustani</button>
        <button onClick={go} disabled={busy} className={`flex-1 py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-50 ${ask.danger ? 'bg-red-600' : 'bg-geo-green'}`}>
          {busy ? '…' : ask.confirm}
        </button>
      </div>
    </Modal>
  );
};

const ScheduleDialog: React.FC<{ post: AdminPost; onPick: (date: Date) => void; onClose: () => void }> = ({ post, onPick, onClose }) => {
  const holder = useRef<HTMLInputElement>(null);
  const [date, setDate] = useState<Date>(() => {
    const current = post.publishedAt ? new Date(post.publishedAt) : null;
    return current && current > new Date() ? current : new Date(Date.now() + 60 * 60000);
  });

  useEffect(() => {
    if (!holder.current) return;
    const picker = flatpickr(holder.current, {
      inline: true, enableTime: true, time_24hr: true, minuteIncrement: 5, defaultDate: date,
      locale: BOSNIAN, onChange: ([picked]) => picked && setDate(picked),
    });
    return () => picker.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal onClose={onClose}>
      <h3 className="font-bold">Zakaži objavu</h3>
      <p className="text-xs text-stone-500 line-clamp-2">{post.title}</p>
      <div className="flex justify-center"><input ref={holder} className="hidden" /></div>
      <p className="text-sm text-center font-semibold">{sarajevo(date.toISOString())}</p>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-stone-300 font-semibold text-sm">Odustani</button>
        <button onClick={() => onPick(date)} className="flex-1 py-2.5 rounded-xl bg-geo-green text-white font-bold text-sm">Zakaži</button>
      </div>
    </Modal>
  );
};

/** What Meta answered on delete / pause, when it did not go through. */
const metaProblems = (r: { facebook?: { status: string; message: string }; instagram?: { status: string; message: string } } | undefined) =>
  [r?.facebook, r?.instagram].filter(x => x?.status === 'failed').map(x => x!.message);

const deleteAsk = (post: AdminPost, onDone: (problems: string[]) => void): Ask => ({
  title: 'Obrisati članak?',
  text: `„${post.title}“ se briše zauvijek${post.facebook === 'shared' || post.instagram === 'posted' ? ', zajedno sa objavama na Facebooku i Instagramu' : ''}. Ovo se ne može vratiti.`,
  confirm: 'Obriši', danger: true,
  run: async () => onDone(metaProblems(await call(`/posts/${post.id}`, { method: 'DELETE' }))),
});

const PostActions: React.FC<{ post: AdminPost; onChanged: (notice?: string) => void }> = ({ post, onChanged }) => {
  const [ask, setAsk] = useState<Ask | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const live = post.status === 'published';
  const stop = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn(); };

  const reschedule = (date: Date) => {
    setScheduling(false);
    const now = date <= new Date();
    setAsk({
      title: now ? 'Objaviti odmah?' : 'Zakazati objavu?',
      text: now
        ? `„${post.title}“ će odmah biti objavljen na sajtu i Facebooku, a na Instagramu za minutu.`
        : `„${post.title}“ će biti objavljen ${sarajevo(date.toISOString())}${post.paused ? ' (ali ostaje pauziran dok ga ne pokreneš)' : ''}.`,
      confirm: now ? 'Objavi' : 'Zakaži',
      run: async () => { await call(`/posts/${post.id}`, { method: 'PUT', body: { published_at: date.toISOString() } }); onChanged(); },
    });
  };

  const togglePause = () => setAsk(post.paused
    ? {
      title: 'Pokrenuti ponovo?',
      text: post.publishedAt && new Date(post.publishedAt) <= new Date()
        ? `Vrijeme objave je prošlo, pa „${post.title}“ izlazi odmah: sajt i Facebook sada, Instagram za minutu.`
        : `„${post.title}“ će biti objavljen ${sarajevo(post.publishedAt)}, kako je zakazano.`,
      confirm: 'Pokreni',
      run: async () => { await call(`/posts/${post.id}/resume`, { method: 'POST' }); onChanged(); },
    }
    : {
      title: 'Pauzirati?',
      text: `„${post.title}“ neće biti objavljen ni kad dođe vrijeme (ni na Facebooku ni na Instagramu) dok ga ne pokreneš ponovo. Ostaje među zakazanima.`,
      confirm: 'Pauziraj',
      run: async () => { onChanged(metaProblems(await call(`/posts/${post.id}/pause`, { method: 'POST' })).join(' ') || undefined); },
    });

  const button = 'p-1.5 rounded-lg bg-white/90 border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50';
  // Clicks here (and in the dialogs, rendered inside the card) must not open the article.
  return (
    <div onClick={e => e.stopPropagation()}>
      <div className="flex gap-1">
        {!live && <button onClick={stop(() => setScheduling(true))} className={button} title="Zakaži" aria-label="Zakaži"><CalendarClock size={16} /></button>}
        {post.status === 'scheduled' && (
          <button onClick={stop(togglePause)} className={`${button} ${post.paused ? '!text-amber-700 !border-amber-300 !bg-amber-50' : ''}`}
            title={post.paused ? 'Pokreni' : 'Pauziraj'} aria-label={post.paused ? 'Pokreni' : 'Pauziraj'}>
            {post.paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        )}
        <button onClick={stop(() => setAsk(deleteAsk(post, problems => onChanged(problems.join(' ') || undefined))))}
          className={`${button} hover:!text-red-600`} title="Obriši" aria-label="Obriši"><Trash2 size={16} /></button>
      </div>
      {scheduling && <ScheduleDialog post={post} onPick={reschedule} onClose={() => setScheduling(false)} />}
      {ask && <ConfirmDialog ask={ask} onDone={() => setAsk(null)} />}
    </div>
  );
};

const PostsTab: React.FC<{ onOpen: (id: number) => void; reloadKey: number }> = ({ onOpen, reloadKey }) => {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (nextPage: number) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: String(nextPage) });
      if (search) query.set('search', search);
      if (status) query.set('status', status);
      const r = await call<{ data: AdminPost[]; meta: { total: number; current_page: number; last_page: number } }>(`/admin/posts?${query}`);
      setPosts(prev => nextPage === 1 ? r.data : [...prev, ...r.data]);
      setPage(r.meta.current_page);
      setLastPage(r.meta.last_page);
      setTotal(r.meta.total);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => load(1), 300);
    return () => window.clearTimeout(timer);
  }, [load, reloadKey]);

  // After a card action: reload, and show what Meta refused (e.g. an Instagram post it would not delete).
  const [notice, setNotice] = useState('');
  const changed = (problem?: string) => {
    setNotice(problem ?? '');
    load(1);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white border border-stone-300 rounded-xl px-3">
          <Search size={18} className="text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Traži naslov" className="flex-1 py-2.5 text-base outline-none bg-transparent" />
        </div>
        <a href="/objavi" className="flex items-center gap-1 bg-geo-green text-white font-bold rounded-xl px-3" title="Dodaj članak (JSON)"><Plus size={18} /> Dodaj</a>
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {[['', 'Svi'], ['published', 'Objavljeni'], ['scheduled', 'Zakazani'], ['draft', 'Draftovi']].map(([value, label]) => (
          <button key={value} onClick={() => setStatus(value)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${status === value ? 'bg-stone-900 text-white' : 'bg-white border border-stone-300'}`}>{label}</button>
        ))}
        <span className="ml-auto text-sm text-stone-500 self-center whitespace-nowrap">{total} članaka</span>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {notice && <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded-xl text-sm p-2">{notice}</p>}
      <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-2">
        {posts.map(post => (
          <div key={post.id} role="button" tabIndex={0} onClick={() => onOpen(post.id)} onKeyDown={e => e.key === 'Enter' && onOpen(post.id)}
            className="relative w-full flex gap-3 bg-white border border-stone-200 rounded-2xl p-2 text-left cursor-pointer hover:border-stone-300">
            <div className="absolute top-2 right-2">
              <PostActions post={post} onChanged={changed} />
            </div>
            <div className="w-20 h-20 rounded-xl bg-stone-200 overflow-hidden flex-shrink-0">
              {post.imageUrl && <img src={post.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />}
            </div>
            <div className="flex-1 min-w-0 py-0.5">
              <div className="font-bold text-sm leading-snug line-clamp-2 pr-24">{post.title}</div>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px]">
                <span className={`px-1.5 py-0.5 rounded-full font-bold ${STATUS[post.status].className}`}>{STATUS[post.status].label}</span>
                {post.paused && <span className="px-1.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">Pauzirano</span>}
                <span className="text-stone-500">{sarajevo(post.publishedAt)}</span>
                <span className="text-stone-700 font-bold">{post.views} 👁</span>
                {post.facebook === 'failed' && <span className="text-red-600 font-bold">FB ✕</span>}
                {post.instagram === 'failed' && <span className="text-red-600 font-bold">IG ✕</span>}
                {post.instagram === 'posted' && <span className="text-emerald-700">IG ✓</span>}
              </div>
              {post.category && <div className="text-[11px] text-stone-500 mt-1">{post.category}</div>}
            </div>
          </div>
        ))}
      </div>
      {page < lastPage && (
        <button onClick={() => load(page + 1)} disabled={loading} className="w-full py-3 rounded-xl bg-white border border-stone-300 font-semibold">
          {loading ? 'Učitavam…' : 'Učitaj još'}
        </button>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- suggestions (typed or dictated)

type Recognition = {
  lang: string; continuous: boolean; interimResults: boolean; start: () => void; stop: () => void;
  onresult: ((event: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null; onerror: ((event: { error: string }) => void) | null;
};
const SpeechRecognitionApi = (window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition })
  .SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: new () => Recognition }).webkitSpeechRecognition;

const LANGS = [['hr-HR', 'Hrvatski / bosanski'], ['sr-RS', 'Srpski'], ['bs-BA', 'Bosanski (ako ga preglednik ima)']];

const SuggestionsTab: React.FC = () => {
  const [open, setOpen] = useState<Suggestion[]>([]);
  const [used, setUsed] = useState<Suggestion[]>([]);
  const [text, setText] = useState('');
  const [forDate, setForDate] = useState(tomorrow());
  const [lang, setLang] = useState(() => localStorage.getItem('geo-admin-lang') || 'hr-HR');
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [fromVoice, setFromVoice] = useState(false);
  const [error, setError] = useState('');
  const recognition = useRef<Recognition | null>(null);

  const load = useCallback(() => {
    call<{ open: Suggestion[]; used: Suggestion[] }>('/admin/suggestions')
      .then(r => { setOpen(r.open); setUsed(r.used); setError(''); })
      .catch(e => setError(e.message));
  }, []);
  useEffect(load, [load]);

  // The browser's own speech recognition (Web Speech API): free, no AI service of ours.
  const toggleVoice = () => {
    if (listening) {
      recognition.current?.stop();
      return;
    }
    if (!SpeechRecognitionApi) {
      setError('Ovaj preglednik ne podržava diktiranje. Probaj Chrome (Android) ili Safari (iPhone), ili diktiraj tipkovnicom (ikona mikrofona).');
      return;
    }
    const r = new SpeechRecognitionApi();
    r.lang = lang;
    r.continuous = true;
    r.interimResults = true;
    r.onresult = event => {
      let finalText = '';
      let pending = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else pending += result[0].transcript;
      }
      if (finalText) setText(prev => `${prev}${prev && !prev.endsWith(' ') ? ' ' : ''}${finalText.trim()}`);
      setInterim(pending);
    };
    r.onerror = event => setError(event.error === 'not-allowed' ? 'Dozvoli mikrofon u pregledniku.' : `Diktiranje: ${event.error}`);
    r.onend = () => { setListening(false); setInterim(''); };
    recognition.current = r;
    setError('');
    setFromVoice(true);
    setListening(true);
    r.start();
  };

  const save = async () => {
    if (!text.trim()) return;
    recognition.current?.stop();
    try {
      await call('/admin/suggestions', { method: 'POST', body: { text: text.trim(), source: fromVoice ? 'voice' : 'typed', forDate } });
      setText('');
      setFromVoice(false);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const remove = async (id: number) => {
    await call(`/admin/suggestions/${id}`, { method: 'DELETE' }).catch(e => setError(e.message));
    load();
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h3 className="font-bold">Novi prijedlog za agenta</h3>
        <p className="text-xs text-stone-500">Agent ih pročita kad navečer pravi prijedloge i uvrsti ih među teme.</p>
        <textarea value={text + (interim ? ` ${interim}` : '')} onChange={e => { setText(e.target.value); setInterim(''); }} rows={4}
          placeholder="Npr. tekst o Tari i rafting sezoni, nešto o risovima u Dinaridima…"
          className="w-full border border-stone-300 rounded-xl px-3 py-2 text-base" />
        {/* Two even rows that fit a phone: dictation + language, then date + save. */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={toggleVoice}
            className={`flex items-center justify-center gap-2 h-12 rounded-xl font-bold ${listening ? 'bg-red-600 text-white animate-pulse' : 'bg-stone-900 text-white'}`}>
            {listening ? <><MicOff size={18} /> Zaustavi</> : <><Mic size={18} /> Diktiraj</>}
          </button>
          <select value={lang} onChange={e => { setLang(e.target.value); localStorage.setItem('geo-admin-lang', e.target.value); }}
            className="w-full min-w-0 h-12 border border-stone-300 rounded-xl px-2 text-sm bg-white">
            {LANGS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <label className="flex flex-col justify-center h-12 border border-stone-300 rounded-xl px-3 min-w-0">
            <span className="text-[10px] font-bold text-stone-500 leading-none">Za dan</span>
            <input type="date" value={forDate} onChange={e => setForDate(e.target.value)} className="w-full min-w-0 text-sm bg-transparent outline-none" />
          </label>
          <button onClick={save} disabled={!text.trim()} className="h-12 rounded-xl bg-geo-green text-white font-bold disabled:opacity-40">Spremi</button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </Card>

      <Card>
        <h3 className="font-bold mb-2">Čekaju agenta ({open.length})</h3>
        {open.map(s => (
          <div key={s.id} className="flex gap-2 py-2 border-t border-stone-100 first:border-0">
            <div className="flex-1">
              <p className="text-sm whitespace-pre-wrap">{s.text}</p>
              <p className="text-[11px] text-stone-500 mt-1">{s.source === 'voice' ? '🎤 ' : ''}za {s.forDate ?? '—'} · {sarajevo(s.createdAt)}</p>
            </div>
            <button onClick={() => remove(s.id)} className="p-2 text-stone-400 hover:text-red-600" aria-label="Obriši"><Trash2 size={18} /></button>
          </div>
        ))}
        {open.length === 0 && <p className="text-sm text-stone-500">Nema otvorenih prijedloga.</p>}
      </Card>

      {used.length > 0 && (
        <Card>
          <h3 className="font-bold mb-2 text-stone-500">Iskorišteni</h3>
          {used.map(s => (
            <div key={s.id} className="py-2 border-t border-stone-100 first:border-0 text-sm text-stone-500">
              {s.text} <span className="text-[11px]">· {sarajevo(s.usedAt)}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- shell

type Tab = 'stats' | 'posts' | 'suggestions';
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'stats', label: 'Statistika', icon: <BarChart3 size={20} /> },
  { id: 'posts', label: 'Članci', icon: <FileText size={20} /> },
  { id: 'suggestions', label: 'Prijedlozi', icon: <Lightbulb size={20} /> },
];

export const AdminPage: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(() => !!localStorage.getItem(TOKEN_KEY));
  const [tab, setTab] = useState<Tab>(() => (localStorage.getItem('geo-admin-tab') as Tab) || 'stats');
  const [openPost, setOpenPost] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    document.title = 'Admin | Geovizija';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);

  // Any 401 (expired token) sends back to the login form.
  useEffect(() => {
    const onRejection = (event: PromiseRejectionEvent) => {
      if (event.reason instanceof Unauthorized) {
        localStorage.removeItem(TOKEN_KEY);
        setLoggedIn(false);
      }
    };
    window.addEventListener('unhandledrejection', onRejection);
    return () => window.removeEventListener('unhandledrejection', onRejection);
  }, []);

  if (!loggedIn) return <Login onDone={() => setLoggedIn(true)} />;

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setLoggedIn(false);
  };
  const choose = (next: Tab) => {
    setTab(next);
    setOpenPost(null);
    localStorage.setItem('geo-admin-tab', next);
  };

  const current = TABS.find(t => t.id === tab);

  // Phone: top bar + bottom tabs. PC (md+): fixed sidebar, slim top bar, tighter content.
  return (
    <div className="min-h-screen bg-stone-100 pb-24 md:pb-0 md:pl-56">
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-56 flex-col bg-white border-r border-stone-200">
        <div className="flex items-center gap-2 px-4 h-14 border-b border-stone-100">
          <span className="w-3 h-5 border-[3px] border-geo-green" />
          <span className="font-serif font-black text-lg">GEOVIZIJA</span>
          <span className="text-[10px] font-bold text-stone-500 uppercase">Admin</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => choose(t.id)}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${tab === t.id ? 'bg-geo-green text-white' : 'text-stone-600 hover:bg-stone-100'}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-stone-100 space-y-1">
          <a href="/" target="_blank" rel="noopener" className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100">
            <ExternalLink size={18} /> Otvori sajt
          </a>
          <button onClick={logout} className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
            <LogOut size={18} /> Odjava
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 py-3 md:py-0 md:h-14 flex items-center gap-2">
        <span className="md:hidden w-3 h-5 border-[3px] border-geo-green" />
        <span className="md:hidden font-serif font-black text-lg">GEOVIZIJA</span>
        <span className="md:hidden text-xs font-bold text-stone-500 uppercase">Admin</span>
        <h1 className="hidden md:block font-bold text-base">{current?.label}</h1>
        <button onClick={() => setReloadKey(k => k + 1)} className="ml-auto p-2 rounded-lg hover:bg-stone-100" aria-label="Osvježi"><RefreshCw size={18} /></button>
        <button onClick={logout} className="p-2 md:hidden" aria-label="Odjava"><LogOut size={18} /></button>
      </header>

      <main className="max-w-3xl mx-auto p-4 md:max-w-none md:mx-0 md:p-4" key={`${tab}-${reloadKey}`}>
        {tab === 'stats' && <StatsTab onOpen={setOpenPost} />}
        {tab === 'posts' && <PostsTab onOpen={setOpenPost} reloadKey={reloadKey} />}
        {tab === 'suggestions' && <SuggestionsTab />}
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-stone-200 flex pb-[env(safe-area-inset-bottom)]">
        {TABS.map(t => (
          <button key={t.id} onClick={() => choose(t.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-semibold ${tab === t.id ? 'text-geo-green' : 'text-stone-500'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </nav>

      {openPost !== null && (
        <PostDetail id={openPost} onClose={() => setOpenPost(null)} onDeleted={() => { setOpenPost(null); setReloadKey(k => k + 1); }}
          onSaved={() => setReloadKey(k => k + 1)} />
      )}
    </div>
  );
};
