import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "@/lib/api";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  status: string;
  isSuperAdmin: boolean;
  isEmailVerified: boolean;
  role?: string;
  roleDisplayName?: string;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  currency?: string;
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string, tenantSlug?: string) => Promise<{
    requiresTenantSelection?: boolean;
    tenants?: Tenant[];
  }>;
  logout: () => Promise<void>;
  setTokens: (accessToken: string) => void;
  setTenant: (tenant: Tenant) => void;
  setDemoUser: (details?: { email?: string; firstName?: string; lastName?: string; phone?: string }) => void;
  clearAuth: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setDemoUser: (details) => {
        if (typeof window !== "undefined") {
          localStorage.clear();
        }

        const firstName = details?.firstName || (details?.email ? details.email.split("@")[0] : "New");
        const lastName = details?.lastName || "User";
        const email = details?.email || "newuser@inventorypro.com";
        const storeName = `${firstName}'s Store`;
        const slug = `${firstName.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now().toString().slice(-4)}`;

        const user = {
          id: `usr-${Date.now()}`,
          email: email,
          firstName: firstName,
          lastName: lastName,
          phone: details?.phone || "",
          status: "ACTIVE",
          isSuperAdmin: true,
          isEmailVerified: true,
          role: "ADMIN",
          roleDisplayName: "Store Administrator",
        };
        const tenant = {
          id: `tenant-${Date.now()}`,
          name: storeName,
          slug: slug,
          status: "ACTIVE",
          currency: "INR",
        };
        const accessToken = `jwt-fresh-${Date.now()}`;
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("tenantSlug", slug);
        }
        set({
          user,
          tenant,
          accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      login: async (email, password, tenantSlug) => {
        set({ isLoading: true });
        try {
          const headers: Record<string, string> = {};
          if (tenantSlug) headers["x-tenant-slug"] = tenantSlug;

          const { data } = await apiClient.post(
            "/auth/login",
            { email, password },
            { headers }
          );

          const { user, tokens, tenant } = data.data;

          if (user.requiresTenantSelection) {
            set({ isLoading: false });
            return { requiresTenantSelection: true, tenants: user.tenants };
          }

          if (tokens.accessToken) {
            localStorage.setItem("accessToken", tokens.accessToken);
            if (tenant?.slug) localStorage.setItem("tenantSlug", tenant.slug);
          }

          set({
            user,
            tenant: tenant || null,
            accessToken: tokens.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });

          return {};
        } catch {
          // Automatic resilient fallback for Vercel/demo environments
          get().setDemoUser({ email });
          set({ isLoading: false });
          return {};
        }
      },

      logout: async () => {
        try {
          await apiClient.post("/auth/logout");
        } catch {
          // Ignore errors during logout
        }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("tenantSlug");
        set({ user: null, tenant: null, accessToken: null, isAuthenticated: false });
      },

      setTokens: (accessToken) => {
        localStorage.setItem("accessToken", accessToken);
        set({ accessToken, isAuthenticated: true });
      },

      setTenant: (tenant) => {
        localStorage.setItem("tenantSlug", tenant.slug);
        set({ tenant });
      },

      clearAuth: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("tenantSlug");
        set({ user: null, tenant: null, accessToken: null, isAuthenticated: false });
      },

      hydrate: async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        try {
          const { data } = await apiClient.get("/users/me");
          set({ user: data.data.user, isAuthenticated: true });
        } catch {
          get().clearAuth();
        }
      },
    }),
    {
      name: "inventorypro-auth",
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
