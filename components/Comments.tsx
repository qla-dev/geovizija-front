import React, { useEffect, useState } from 'react';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import { api } from '../services/api';
import { Comment } from '../types';

// Article discussion backed by /api/posts/{id}/comments. Anonymous: the name is
// remembered in this browser, likes are remembered per comment so one browser
// likes a comment once.
const AUTHOR_KEY = 'geovizija.commentAuthor';
const LIKED_KEY = 'geovizija.likedComments';

const readLiked = (): number[] => {
  try {
    return JSON.parse(localStorage.getItem(LIKED_KEY) || '[]');
  } catch {
    return [];
  }
};

const store = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage - nothing to remember.
  }
};

// 1 minutu, 2-4 minute, 5+ minuta (11-14 always the last form)
const plural = (n: number, [one, few, many]: [string, string, string]) => {
  const tens = n % 100, ones = n % 10;
  if (tens >= 11 && tens <= 14) return many;
  return ones === 1 ? one : ones >= 2 && ones <= 4 ? few : many;
};

const timeAgo = (iso: string) => {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'Upravo sada';
  if (minutes < 60) return `Prije ${minutes} ${plural(minutes, ['minutu', 'minute', 'minuta'])}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Prije ${hours} ${plural(hours, ['sat', 'sata', 'sati'])}`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Prije ${days} ${plural(days, ['dan', 'dana', 'dana'])}`;
  return new Date(iso).toLocaleDateString('bs-BA', { day: 'numeric', month: 'long', year: 'numeric' });
};

const CommentForm: React.FC<{
  author: string;
  onAuthorChange: (value: string) => void;
  onSubmit: (body: string, website: string) => Promise<void>;
  placeholder: string;
  compact?: boolean;
  onCancel?: () => void;
}> = ({ author, onAuthorChange, onSubmit, placeholder, compact, onCancel }) => {
  const [body, setBody] = useState('');
  const [website, setWebsite] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!author.trim() || !body.trim() || sending) return;
    setSending(true);
    setError('');
    try {
      await onSubmit(body.trim(), website);
      setBody('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Komentar nije objavljen.');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className={compact ? 'mt-4' : 'mb-8'}>
      <input
        value={author}
        onChange={(e) => onAuthorChange(e.target.value)}
        placeholder="Vaše ime"
        maxLength={60}
        className="w-full sm:w-72 mb-3 bg-stone-50 border border-stone-200 px-4 py-3 text-base text-stone-700 placeholder-stone-400 focus:outline-none focus:border-geo-green focus:bg-white transition-all"
      />
      {/* Honeypot: invisible to people, bots fill it and get rejected */}
      <input
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] w-px h-px opacity-0"
      />
      <div className="relative">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          maxLength={2000}
          className={`w-full bg-stone-50 border border-stone-200 px-4 pt-3 pb-16 text-base ${compact ? 'min-h-[100px]' : 'min-h-[120px]'} focus:outline-none focus:border-geo-green focus:bg-white transition-all resize-y text-stone-700 placeholder-stone-400`}
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          {onCancel && (
            <button type="button" onClick={onCancel} className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors">
              Odustani
            </button>
          )}
          <button
            type="submit"
            disabled={!author.trim() || !body.trim() || sending}
            className="bg-stone-900 text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-geo-green hover:text-stone-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Šaljem…' : 'Objavi'}
          </button>
        </div>
      </div>
      {error ? (
        <p className="text-xs text-rose-600 mt-2 font-medium">{error}</p>
      ) : !compact && (
        <p className="text-[10px] text-stone-400 mt-2 uppercase tracking-wide">Komentari prolaze automatsku moderaciju.</p>
      )}
    </form>
  );
};

export const Comments: React.FC<{ postId: string }> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [author, setAuthor] = useState(() => {
    try {
      return localStorage.getItem(AUTHOR_KEY) || '';
    } catch {
      return '';
    }
  });
  const [liked, setLiked] = useState<number[]>(readLiked);
  const [replyTo, setReplyTo] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setReplyTo(null);
    api.comments(postId)
      .then(list => { if (active) { setComments(list); setStatus('ready'); } })
      .catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [postId]);

  const changeAuthor = (value: string) => {
    setAuthor(value);
    store(AUTHOR_KEY, value);
  };

  const post = async (body: string, website: string, parentId?: number) => {
    const comment = await api.addComment(postId, { author: author.trim(), body, parentId, website });
    setComments(list => parentId
      ? list.map(c => c.id === parentId ? { ...c, replies: [...c.replies, comment] } : c)
      : [comment, ...list]);
    setReplyTo(null);
  };

  const toggleLike = async (id: number) => {
    const like = !liked.includes(id);
    const nextLiked = like ? [...liked, id] : liked.filter(x => x !== id);
    const setLikes = (fn: (c: Comment) => number) => setComments(list => list.map(c => ({
      ...c,
      likes: c.id === id ? fn(c) : c.likes,
      replies: c.replies.map(r => r.id === id ? { ...r, likes: fn(r) } : r),
    })));
    // Optimistic: update now, settle on the server's count.
    setLiked(nextLiked);
    store(LIKED_KEY, JSON.stringify(nextLiked));
    setLikes(c => Math.max(0, c.likes + (like ? 1 : -1)));
    try {
      const likes = await api.likeComment(id, like);
      setLikes(() => likes);
    } catch {
      setLiked(liked);
      store(LIKED_KEY, JSON.stringify(liked));
      setLikes(c => Math.max(0, c.likes + (like ? -1 : 1)));
    }
  };

  const total = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0);

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className="flex gap-4 group animate-fade-in">
      <div className={`${isReply ? 'w-8 h-8 text-sm' : 'w-10 h-10'} rounded-full bg-stone-200 flex-shrink-0 flex items-center justify-center text-stone-500 font-bold font-serif border-2 border-white shadow-sm uppercase`}>
        {comment.author.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <h4 className="font-bold text-stone-900 text-sm truncate">{comment.author}</h4>
          <span className="text-xs text-stone-400 font-medium whitespace-nowrap">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-stone-600 text-base leading-relaxed mb-3 font-serif whitespace-pre-line break-words">
          {comment.body}
        </p>
        <div className="flex items-center gap-6">
          <button
            onClick={() => toggleLike(comment.id)}
            aria-pressed={liked.includes(comment.id)}
            className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${liked.includes(comment.id) ? 'text-geo-green' : 'text-stone-400 hover:text-geo-green'}`}
          >
            <ThumbsUp size={14} fill={liked.includes(comment.id) ? 'currentColor' : 'none'} />
            <span>{comment.likes > 0 ? comment.likes : 'Sviđa mi se'}</span>
          </button>
          {!isReply && (
            <button
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className="text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-stone-900 transition-colors"
            >
              Odgovori
            </button>
          )}
        </div>
        {!isReply && replyTo === comment.id && (
          <CommentForm
            compact
            author={author}
            onAuthorChange={changeAuthor}
            placeholder={`Odgovor korisniku ${comment.author}…`}
            onSubmit={(body, website) => post(body, website, comment.id)}
            onCancel={() => setReplyTo(null)}
          />
        )}
        {comment.replies.length > 0 && (
          <div className="mt-6 space-y-6 border-l-2 border-stone-100 pl-4 md:pl-6">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare size={24} className="text-geo-green" />
        <h3 className="font-serif font-bold text-2xl text-stone-900">
          Rasprava <span className="text-stone-400 text-lg font-normal">({total})</span>
        </h3>
      </div>

      <CommentForm
        author={author}
        onAuthorChange={changeAuthor}
        placeholder="Vaše mišljenje je važno. Napišite komentar..."
        onSubmit={(body, website) => post(body, website)}
      />

      {status === 'loading' && <p className="text-sm text-stone-400">Učitavam komentare…</p>}
      {status === 'error' && <p className="text-sm text-stone-400">Komentari trenutno nisu dostupni.</p>}
      {status === 'ready' && comments.length === 0 && (
        <p className="text-sm text-stone-400 font-serif italic">Još nema komentara. Budite prvi.</p>
      )}
      <div className="space-y-10">
        {comments.map(comment => renderComment(comment))}
      </div>
    </div>
  );
};
