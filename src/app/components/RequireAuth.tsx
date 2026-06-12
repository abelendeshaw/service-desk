import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../store/authStore";
import type { UserRole } from "../store/types";

export function RequireStaff({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/login", { replace: true, state: { portal: "staff" } });
    else if (user.role !== "staff") navigate("/client", { replace: true });
  }, [user, navigate]);

  if (!user || user.role !== "staff") return null;
  return <>{children}</>;
}

export function RequireClient({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/login", { replace: true, state: { portal: "client" as UserRole } });
    else if (user.role !== "client") navigate("/", { replace: true });
  }, [user, navigate]);

  if (!user || user.role !== "client") return null;
  return <>{children}</>;
}
