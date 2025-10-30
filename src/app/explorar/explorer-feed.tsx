'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import type { Post } from '@/data/communityPosts';
import { PostComposer } from '@/components/PostComposer';
import { PostItem } from '@/components/PostItem';
import { useAuth } from '@/components/auth-provider';

export type ExplorerPost = Post & {
  communitySlug: string;
  communityNome: string;
  communityCapa?: string;
};

type SuggestedCommunity = {
  slug: string;
  nome: string;
  descricao: string;
  membros: number;
  capa?: string;
};

type ExplorerFeedProps = {
  initialPosts: ExplorerPost[];
  suggestedCommunities: SuggestedCommunity[];
};

type TabKey = 'forYou' | 'trending' | 'following';

type TrendingTag = {
  tag: string;
  count: number;
};

const numberFormatter = new Intl.NumberFormat('pt-BR');

function computeTrendingTags(posts: ExplorerPost[]): TrendingTag[] {
  const counts = new Map<string, number>();
  posts.forEach((post) => {
    (post.tags ?? []).forEach((tag) => {
      const key = tag.trim();
      if (!key) return;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
  });
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function ExplorerFeed({ initialPosts, suggestedCommunities }: ExplorerFeedProps) {
  const router = useRouter();
  const { user, memberships, joinCommunity, leaveCommunity } = useAuth();
  const [posts, setPosts] = useState<ExplorerPost[]>(initialPosts);
  const [activeTab, setActiveTab] = useState<TabKey>('forYou');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const membershipSet = useMemo(() => new Set(memberships.map((item) => item.slug)), [memberships]);

  const trendingTags = useMemo(() => computeTrendingTags(posts), [posts]);

  const filteredPosts = useMemo(() => {
    let list = posts;

    if (selectedTag) {
      const tagLower = selectedTag.toLowerCase();
      list = list.filter((post) => (post.tags ?? []).some((tag) => tag.toLowerCase() === tagLower));
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      list = list.filter((post) => {
        return (
          post.conteudo.toLowerCase().includes(query) ||
          post.autor.toLowerCase().includes(query) ||
          post.communityNome.toLowerCase().includes(query)
        );
      });
    }

    if (activeTab === 'following') {
      if (membershipSet.size === 0) {
        return [];
      }
      list = list.filter((post) => membershipSet.has(post.communitySlug));
    }

    const sorted = [...list];
    if (activeTab === 'trending') {
      sorted.sort((a, b) => {
        const scoreA = a.likes + a.replies * 2;
        const scoreB = b.likes + b.replies * 2;
        return scoreB - scoreA;
      });
    } else {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return sorted;
  }, [posts, selectedTag, search, activeTab, membershipSet]);

  const handleComposerSubmit = (payload: { conteudo: string; tags: string[] }) => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent('/explorar')}`);
      return;
    }

    const refCommunity = memberships[0];
    const newPost: ExplorerPost = {
      id: `local-${Date.now()}`,
      autor: user.nome,
      conteudo: payload.conteudo,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: 0,
      tags: payload.tags,
      communitySlug: refCommunity?.slug ?? 'rede-geral',
      communityNome: refCommunity?.nome ?? 'Rede PedagoPass',
      communityCapa: refCommunity?.capa,
    };

    setPosts((prev) => [newPost, ...prev]);
  };

  const handleSuggestedToggle = (slug: string, isMember: boolean) => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent('/explorar')}`);
      return;
    }

    const result = isMember ? leaveCommunity(slug) : joinCommunity(slug);
    if (!result.ok && result.error) {
      console.warn(result.error);
    }
  };

  const activeLabel: Record<TabKey, string> = {
    forYou: 'publicações recentes da rede',
    trending: 'posts com mais engajamento',
    following: 'comunidades em que você participa',
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.9fr)_minmax(280px,1fr)]">
      <section className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">O que você trouxe hoje?</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {user ? 'Compartilhe uma ideia rápida ou faça uma pergunta para a rede.' : 'Entre com sua conta para publicar e participar das conversas.'}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 p-1 dark:border-slate-700">
              {(
                [
                  { key: 'forYou' as TabKey, label: 'Para você' },
                  { key: 'trending' as TabKey, label: 'Em alta' },
                  { key: 'following' as TabKey, label: 'Seguindo' },
                ]
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  aria-pressed={activeTab === tab.key}
                  className={clsx(
                    'rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
                    activeTab === tab.key
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-600 hover:text-primary-700 dark:text-slate-300 dark:hover:text-primary-200'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label className="sr-only" htmlFor="explore-search">
              Buscar no feed
            </label>
            <input
              id="explore-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por autor, conteúdo ou comunidade"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Exibindo {activeLabel[activeTab]}
            {selectedTag ? ` • filtrado por #${selectedTag}` : ''}
            {search.trim() ? ` • correspondendo a “${search.trim()}”` : ''}
          </p>
        </div>

        <PostComposer
          onSubmit={handleComposerSubmit}
          suggestedTags={trendingTags.map((item) => item.tag)}
        />

        {(selectedTag || search.trim()) && (
          <div className="flex flex-wrap items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <span>Filtros ativos:</span>
            {selectedTag && (
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-primary-700 transition hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-200"
              >
                #{selectedTag}
                <span aria-hidden>×</span>
              </button>
            )}
            {search.trim() && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1 text-slate-700 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200"
              >
                “{search.trim()}”
                <span aria-hidden>×</span>
              </button>
            )}
          </div>
        )}

        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {activeTab === 'following' && membershipSet.size === 0
                ? 'Entre em uma comunidade para ver posts de quem você acompanha.'
                : 'Nada por aqui ainda. Ajuste os filtros ou publique algo novo!'}
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 dark:border-slate-700 dark:bg-slate-800">Comunidade</span>
                  <Link
                    href={`/comunidades/${post.communitySlug}`}
                    className="font-medium text-primary-700 transition hover:underline dark:text-primary-300"
                  >
                    {post.communityNome}
                  </Link>
                </div>
                <PostItem post={post} />
              </div>
            ))
          )}
        </div>
      </section>

      <aside className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-24">
          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Assuntos em destaque</h3>
              {trendingTags.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Sem tags suficientes ainda. Publique algo e comece a conversa!</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {trendingTags.map((item) => {
                    const isActive = selectedTag === item.tag;
                    return (
                      <li key={item.tag}>
                        <button
                          type="button"
                          onClick={() => setSelectedTag(isActive ? null : item.tag)}
                          className={clsx(
                            'flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
                            isActive
                              ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/20 dark:text-primary-200'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-primary-400 hover:text-primary-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-primary-400 dark:hover:text-primary-200'
                          )}
                        >
                          <span>#{item.tag}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{item.count} menção{item.count === 1 ? '' : 's'}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Sugestões para seguir</h3>
              <ul className="mt-4 space-y-3">
                {suggestedCommunities.map((community) => {
                  const isMember = membershipSet.has(community.slug);
                  return (
                    <li
                      key={community.slug}
                      className="rounded-xl border border-slate-200 p-4 text-sm transition hover:border-primary-300 dark:border-slate-700 dark:hover:border-primary-400"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            href={`/comunidades/${community.slug}`}
                            className="font-semibold text-slate-900 transition hover:underline dark:text-white"
                          >
                            {community.nome}
                          </Link>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{community.descricao}</p>
                          <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            {numberFormatter.format(community.membros)} membros
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSuggestedToggle(community.slug, isMember)}
                          className={clsx(
                            'rounded-full px-3 py-1 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
                            isMember
                              ? 'border border-slate-300 text-slate-600 hover:border-primary-400 hover:text-primary-700 dark:border-slate-600 dark:text-slate-300 dark:hover:border-primary-400 dark:hover:text-primary-200'
                              : 'border border-transparent bg-primary-600 text-white hover:bg-primary-700'
                          )}
                        >
                          {isMember ? 'Seguindo' : 'Seguir'}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </div>
      </aside>
    </div>
  );
}
