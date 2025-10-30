"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Community } from "@/lib/api";
import { apiLogin, apiLogout, apiMe, apiSignup, apiMyCommunities, apiJoinCommunity, apiLeaveCommunity, apiGetCommunities, apiCreateQuickToken } from "@/lib/api";

type StoredUser = {
  id: string;
  nome: string;
  email: string;
  createdAt: string;
};

type AuthContextValue = {
  user: StoredUser | null;
  loading: boolean;
  memberships: Community[];
  login: (email: string, senha: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (nome: string, email: string, senha: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  joinCommunity: (slug: string) => { ok: boolean; error?: string };
  leaveCommunity: (slug: string) => { ok: boolean; error?: string };
  refreshMemberships: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberships, setMemberships] = useState<Community[]>([]);

  const mapSlugsToCommunities = React.useCallback(async (slugs: string[]): Promise<Community[]> => {
    const set = new Set(slugs);
    try {
      const all = await apiGetCommunities();
      return all.filter(c => set.has(c.slug));
    } catch {
      return [];
    }
  }, []);

  const syncMemberships = React.useCallback(async (nextUser: StoredUser | null) => {
    if (!nextUser) { setMemberships([]); return; }
    const slugs = await apiMyCommunities();
    const list = await mapSlugsToCommunities(slugs);
    setMemberships(list);
  }, [mapSlugsToCommunities]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await apiMe();
      if (cancelled) return;
      setUser(me);
      await syncMemberships(me);
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [syncMemberships]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    memberships,
    async login(email, senha) {
      try {
        const u = await apiLogin({ email, senha });
        setUser(u);
        await syncMemberships(u);
        try {
          localStorage.setItem('pp.lastEmail', u.email);
          localStorage.setItem('pp.lastNome', u.nome);
        } catch {}
        return { ok: true };
      } catch (e: any) {
        return { ok: false, error: e?.data?.error || e?.message || 'Falha ao entrar' };
      }
    },
    async signup(nome, email, senha) {
      try {
        const u = await apiSignup({ nome, email, senha });
        setUser(u);
        await syncMemberships(u);
        try {
          localStorage.setItem('pp.lastEmail', u.email);
          localStorage.setItem('pp.lastNome', u.nome);
        } catch {}
        return { ok: true };
      } catch (e: any) {
        return { ok: false, error: e?.data?.error || e?.message || 'Falha ao cadastrar' };
      }
    },
    logout() {
      // antes de limpar o token, tenta gerar um quick-token (5min) para relogar em 1 clique
      (async () => {
        const qt = await apiCreateQuickToken();
        if (qt) {
          try {
            localStorage.setItem('pp.quickToken', qt.token);
            localStorage.setItem('pp.quickTokenExp', qt.expiresAt);
          } catch {}
        }
        apiLogout();
      })();
      setUser(null);
      setMemberships([]);
    },
    joinCommunity(slug) {
      if (!user) return { ok: false as const, error: "É necessário estar logado." };
      try {
        apiJoinCommunity(slug);
        syncMemberships(user);
        return { ok: true as const };
      } catch (e: any) {
        return { ok: false as const, error: e?.data?.error || 'Falha ao participar' };
      }
    },
    leaveCommunity(slug) {
      if (!user) return { ok: false as const, error: "É necessário estar logado." };
      try {
        apiLeaveCommunity(slug);
        syncMemberships(user);
        return { ok: true as const };
      } catch (e: any) {
        return { ok: false as const, error: e?.data?.error || 'Falha ao sair' };
      }
    },
    refreshMemberships() {
      syncMemberships(user);
    }
  }), [user, loading, memberships, syncMemberships]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
