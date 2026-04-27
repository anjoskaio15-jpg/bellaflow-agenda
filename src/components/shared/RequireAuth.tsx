import { useEffect, useState } from "react";
import type React from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { canAccessDev, getMyBusinessUser } from "@/services/businessService";

interface RequireAuthProps {
  children: React.ReactNode;
  requireDev?: boolean;
}

export function RequireAuth({ children, requireDev = false }: RequireAuthProps) {
  const [status, setStatus] = useState<"loading" | "allowed" | "denied" | "login">("loading");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setStatus("login");
        return;
      }

      const membership = await getMyBusinessUser();
      if (!membership) {
        setStatus("denied");
        return;
      }

      setStatus(requireDev && !canAccessDev(membership.role) ? "denied" : "allowed");
    }

    load().catch(() => setStatus("denied"));
  }, [requireDev]);

  if (status === "loading") return <div className="grid min-h-screen place-items-center p-6 text-muted-foreground">Carregando acesso...</div>;
  if (status === "login") return <Navigate to="/login" replace />;
  if (status === "denied") return <div className="grid min-h-screen place-items-center p-6 text-center">Voce nao tem permissao para acessar esta area.</div>;

  return children;
}
