import React from "react";
import type { AuthUser, UserRole } from "./types";
import { seedEngineers } from "./seed";

const AUTH_STORAGE_KEY = "serviceDesk.auth.v1";

const DEMO_USERS: AuthUser[] = [
  {
    id: "staff-1",
    name: "Abraham Tayu",
    email: "abreham.t@ienetworks.co",
    initials: "AT",
    role: "staff",
    company: "IE Networks",
    jobTitle: "Support Administrator",
  },
  {
    id: "client-1",
    name: "Alemu Bekele",
    email: "alemu@epss.com",
    initials: "AB",
    role: "client",
    company: "EPSS",
    phone: "+251 911 234 567",
    jobTitle: "IT Manager",
  },
  {
    id: "client-2",
    name: "Selam Tadesse",
    email: "selam@mint.com",
    initials: "ST",
    role: "client",
    company: "MinT",
    phone: "+251 922 345 678",
    jobTitle: "Infrastructure Lead",
  },
  {
    id: "eng-ww",
    name: "Wongel Wondyifraw",
    email: "wongel@ienetworks.co",
    initials: "WW",
    role: "engineer",
    company: "IE Networks",
    jobTitle: "Field Engineer",
    engineerId: "eng-ww",
  },
];

type AuthState = {
  user: AuthUser | null;
};

type AuthActions = {
  login: (email: string, password: string, portal: UserRole) => { ok: true } | { ok: false; message: string };
  logout: () => void;
  updateProfile: (input: Partial<Pick<AuthUser, "name" | "email" | "phone" | "jobTitle">>) => void;
};

type AuthStore = AuthState & AuthActions;

const AuthContext = React.createContext<AuthStore | null>(null);

function loadSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.email || !parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistSession(user: AuthUser | null) {
  if (user) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(AUTH_STORAGE_KEY);
}

function resolveUser(email: string, portal: UserRole): AuthUser | null {
  const normalized = email.trim().toLowerCase();
  const match = DEMO_USERS.find((u) => u.email.toLowerCase() === normalized && u.role === portal);
  if (match) return match;

  if (portal === "staff" && normalized.endsWith("@ienetworks.co")) {
    const name = normalized
      .split("@")[0]
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const parts = name.trim().split(/\s+/);
    return {
      id: `staff-${normalized}`,
      name,
      email: normalized,
      initials: ((parts[0]?.[0] ?? "S") + (parts[1]?.[0] ?? "T")).toUpperCase(),
      role: "staff",
      company: "IE Networks",
      jobTitle: "Support Team",
    };
  }

  if (portal === "client") {
    const domain = normalized.split("@")[1] ?? "";
    const companyMap: Record<string, string> = {
      "epss.com": "EPSS",
      "mint.com": "MinT",
      "moti.com": "MoTI",
      "eramotl.com": "ERA/MOTL",
    };
    const company = companyMap[domain];
    if (!company) return null;
    const name = normalized
      .split("@")[0]
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const parts = name.trim().split(/\s+/);
    return {
      id: `client-${normalized}`,
      name,
      email: normalized,
      initials: ((parts[0]?.[0] ?? "C") + (parts[1]?.[0] ?? "L")).toUpperCase(),
      role: "client",
      company,
      jobTitle: "Client Contact",
    };
  }

  if (portal === "engineer") {
    const engineer = seedEngineers.find((e) => e.email.toLowerCase() === normalized);
    if (engineer) {
      return {
        id: engineer.id,
        engineerId: engineer.id,
        name: engineer.name,
        email: engineer.email,
        initials: engineer.initials,
        role: "engineer",
        company: "IE Networks",
        jobTitle: "Field Engineer",
      };
    }
    if (normalized.endsWith("@ienetworks.co")) {
      const name = normalized
        .split("@")[0]
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const parts = name.trim().split(/\s+/);
      return {
        id: `engineer-${normalized}`,
        engineerId: `engineer-${normalized}`,
        name,
        email: normalized,
        initials: ((parts[0]?.[0] ?? "F") + (parts[1]?.[0] ?? "E")).toUpperCase(),
        role: "engineer",
        company: "IE Networks",
        jobTitle: "Field Engineer",
      };
    }
    return null;
  }

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(() => loadSession());

  const login: AuthActions["login"] = (email, _password, portal) => {
    const resolved = resolveUser(email, portal);
    if (!resolved) {
      return {
        ok: false,
        message:
          portal === "client"
            ? "Client account not found. Try alemu@epss.com or your organization email."
            : portal === "engineer"
              ? "Field engineer account not found. Try wongel@ienetworks.co or your @ienetworks.co email."
              : "Staff account not found. Use your @ienetworks.co email.",
      };
    }
    setUser(resolved);
    persistSession(resolved);
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    persistSession(null);
  };

  const updateProfile: AuthActions["updateProfile"] = (input) => {
    setUser((prev) => {
      if (!prev) return prev;
      const parts = (input.name ?? prev.name).trim().split(/\s+/);
      const next: AuthUser = {
        ...prev,
        ...input,
        initials: ((parts[0]?.[0] ?? prev.initials[0]) + (parts[1]?.[0] ?? prev.initials[1] ?? "")).toUpperCase(),
      };
      persistSession(next);
      return next;
    });
  };

  const value = React.useMemo<AuthStore>(
    () => ({ user, login, logout, updateProfile }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useRequireAuth(role?: UserRole) {
  const auth = useAuth();
  if (!auth.user) return { user: null, ready: false as const };
  if (role && auth.user.role !== role) return { user: null, ready: false as const };
  return { user: auth.user, ready: true as const };
}
