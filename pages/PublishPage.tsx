import React, { useState } from 'react';
import { Send, Check, AlertTriangle, ExternalLink } from 'lucide-react';
import { SEO } from '../components/SEO';
import { API_BASE_URL } from '../services/api';

type Result = { ok: boolean; message: string; url?: string; warnings?: string[] };

/**
 * Paste-and-publish for Claude-written JSON (an article or a daily quiz). The JSON must contain the
 * publish "secret"; the server rejects it otherwise. Not linked from the navigation.
 */
export const PublishPage: React.FC = () => {
  const [json, setJson] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const publish = async () => {
    setResult(null);
    let body: unknown;
    try {
      body = JSON.parse(json);
    } catch {
      setResult({ ok: false, message: 'To nije ispravan JSON.' });
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(`${API_BASE_URL}/publish`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body),
      });
      const payload = await response.json().catch(() => ({}));
      const firstError = payload.errors ? Object.values(payload.errors as Record<string, string[]>)[0]?.[0] : undefined;
      setResult({
        ok: response.ok,
        message: response.status === 429 ? 'Previše pokušaja. Pričekajte minut.' : (firstError || payload.message || `Greška (${response.status}).`),
        url: payload.url,
        warnings: payload.warnings,
      });
      if (response.ok) setJson('');
    } catch {
      setResult({ ok: false, message: 'Server nije dostupan.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-stone-100">
      <SEO title="Objavi | Geovizija" />
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <p className="text-geo-green text-xs font-bold uppercase tracking-[0.25em]">Uredništvo</p>
        <h1 className="font-serif font-black text-3xl md:text-4xl text-stone-900 mt-2">Objavi sadržaj</h1>
        <p className="text-stone-500 text-sm mt-2 leading-relaxed">
          Zalijepite JSON članka ili kviza koji je napisao Claude. Mora sadržavati ispravan <code className="bg-stone-200 px-1">"secret"</code>. Članak se objavljuje odmah; slike se generišu i to traje oko minut.
        </p>

        <textarea
          value={json}
          onChange={e => setJson(e.target.value)}
          spellCheck={false}
          placeholder={'{\n  "secret": "…",\n  "type": "article",\n  "category": "priroda",\n  "title": "…",\n  "excerpt": "…",\n  "content": "…"\n}'}
          className="mt-6 w-full h-80 p-4 bg-white border border-stone-300 font-mono text-xs leading-relaxed text-stone-800 outline-none focus:border-stone-900"
        />

        <button
          onClick={publish}
          disabled={busy || !json.trim()}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-stone-950 text-white py-4 font-black uppercase tracking-widest text-xs disabled:opacity-40 hover:bg-geo-green hover:text-stone-950 transition-colors"
        >
          {busy ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Objavljujem… (do 1 min)</> : <><Send size={16} /> Objavi</>}
        </button>

        {result && (
          <div className={`mt-6 border-l-4 bg-white p-4 ${result.ok ? 'border-geo-green' : 'border-rose-500'}`}>
            <p className={`flex items-center gap-2 font-bold ${result.ok ? 'text-geo-green' : 'text-rose-600'}`}>
              {result.ok ? <Check size={18} /> : <AlertTriangle size={18} />} {result.message}
            </p>
            {result.url && (
              <a href={result.url} className="mt-2 inline-flex items-center gap-1 text-sm text-stone-700 underline">
                Otvori <ExternalLink size={14} />
              </a>
            )}
            {result.warnings && result.warnings.length > 0 && (
              <ul className="mt-2 text-xs text-amber-700 list-disc pl-5">
                {result.warnings.map(w => <li key={w}>{w}</li>)}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
