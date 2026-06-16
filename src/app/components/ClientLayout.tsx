import { useEffect, useRef, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Ticket,
  BookOpen,
  UserCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  Search,
  LogOut,
  HelpCircle,
  CheckCheck,
  X,
  MonitorSmartphone,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useAuth } from "../store/authStore";
import { useServiceDesk } from "../store/serviceDeskStore";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

const navItems = [
  { name: "Dashboard", href: "/client", icon: LayoutDashboard, end: true },
  { name: "My Tickets", href: "/client/tickets", icon: Ticket, end: false },
  { name: "Knowledge Base", href: "/client/knowledge", icon: BookOpen, end: false },
];

export function ClientLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, markNotificationsRead, markNotificationRead, dismissNotification } = useServiceDesk();

  useEffect(() => {
    if (!user) navigate("/login", { replace: true, state: { portal: "client" } });
    else if (user.role !== "client") navigate("/", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  if (!user || user.role !== "client") return null;

  const clientNotifications = notifications.filter(
    (n) => n.href?.includes("/tickets/") || n.kind === "status" || n.kind === "system",
  );
  const unreadCount = clientNotifications.filter((n) => n.unread).length;

  const confirmLogout = () => {
    setLogoutOpen(false);
    logout();
    toast.success("Signed out of client portal");
    navigate("/login", { state: { portal: "client" } });
  };

  return (
    <div className="bg-muted flex h-screen overflow-hidden">
      <aside
        className={`${sidebarCollapsed ? "w-[60px]" : "w-[220px]"} bg-sidebar text-sidebar-foreground flex flex-col flex-shrink-0 transition-all duration-200`}
      >
        <div
          className={`border-sidebar-border h-[56px] flex items-center border-b flex-shrink-0 ${sidebarCollapsed ? "px-3 justify-between" : "px-4 justify-between"}`}
        >
          {sidebarCollapsed ? (
            <div className="bg-violet-500 text-white flex size-7 items-center justify-center rounded-md flex-shrink-0">
              <MonitorSmartphone className="w-4 h-4" />
            </div>
          ) : (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="bg-violet-500 text-white flex size-7 items-center justify-center rounded-md flex-shrink-0">
                <MonitorSmartphone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sidebar-foreground text-sm font-semibold leading-tight truncate">Client Portal</div>
                <div className="text-sidebar-foreground/60 text-xs leading-tight truncate">{user.company}</div>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-sidebar-foreground/60 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent size-7 flex-shrink-0"
          >
            {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto py-3 px-2">
          {!sidebarCollapsed && (
            <div className="mb-2 px-2">
              <Badge variant="secondary" className="bg-violet-500/15 text-violet-700 border-violet-400/25 text-[10px]">
                Client Workspace
              </Badge>
            </div>
          )}
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-2 py-2 rounded-md transition-all duration-100 group relative ${
                  isActive
                    ? "bg-white text-violet-700 dark:bg-sidebar-muted dark:text-sidebar-foreground"
                    : "text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                } ${sidebarCollapsed ? "justify-center" : ""}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && !sidebarCollapsed && (
                    <div className="bg-violet-400 absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full" />
                  )}
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-violet-700 dark:text-sidebar-foreground" : ""}`} />
                  {!sidebarCollapsed && <span className="text-[13px] font-medium truncate">{item.name}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-sidebar-border flex-shrink-0 border-t p-2">
          <NavLink
            to="/client/account"
            className={({ isActive }) =>
              `flex items-center gap-3 px-2 py-2 rounded-md transition-all group relative ${
                isActive
                  ? "bg-white text-violet-700 dark:bg-sidebar-muted dark:text-sidebar-foreground"
                  : "text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
              } ${sidebarCollapsed ? "justify-center" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !sidebarCollapsed && (
                  <div className="bg-violet-400 absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full" />
                )}
                <UserCircle className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-violet-700 dark:text-sidebar-foreground" : ""}`} />
                {!sidebarCollapsed && <span className="text-[13px] font-medium">Account</span>}
              </>
            )}
          </NavLink>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-background border-border flex h-[56px] items-center gap-4 border-b px-6 flex-shrink-0">
          <div className="flex-1 flex items-center gap-3">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
              <Input placeholder="Search tickets, articles..." className="h-8 w-64 pl-9 pr-4 text-[13px]" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative" ref={notifRef}>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground relative size-8"
                onClick={() => setNotifOpen((o) => !o)}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-background">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-[380px] rounded-xl border bg-background shadow-xl z-50 flex flex-col overflow-hidden" style={{ maxHeight: 420 }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <span className="text-[14px] font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-[12px]" onClick={() => markNotificationsRead()}>
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </Button>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {clientNotifications.length === 0 ? (
                      <div className="py-12 text-center text-[13px] text-muted-foreground">No notifications yet</div>
                    ) : (
                      clientNotifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          className={`flex gap-3 px-4 py-3 border-b cursor-pointer hover:bg-muted/40 ${n.unread ? "bg-violet-50/40" : ""}`}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.href) {
                              const href = n.href.startsWith("/tickets/") ? n.href.replace("/tickets/", "/client/tickets/") : n.href;
                              navigate(href);
                              setNotifOpen(false);
                            }
                          }}
                        >
                          <div className="min-w-0 flex-1">
                            <div className={`text-[13px] ${n.unread ? "font-semibold" : "font-medium"}`}>{n.title}</div>
                            {n.detail && <div className="text-[12px] text-muted-foreground line-clamp-1">{n.detail}</div>}
                            <div className="mt-1 text-[11px] text-muted-foreground">{relativeTime(n.createdAt)}</div>
                          </div>
                          <button
                            className="self-start p-1 rounded hover:bg-muted"
                            onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }}
                          >
                            <X className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground size-8">
              <HelpCircle className="w-4 h-4" />
            </Button>

            <div className="bg-border h-5 w-px" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto gap-2 px-0 hover:bg-transparent">
                  <div className="bg-violet-600 text-white flex size-7 items-center justify-center rounded-full text-xs font-semibold">
                    {user.initials}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-foreground text-[13px] font-medium leading-tight">{user.name}</div>
                    <div className="text-muted-foreground text-[11px] leading-tight">{user.jobTitle ?? "Client Contact"}</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-[13px]" onSelect={() => navigate("/client/account")}>
                  <UserCircle className="w-3.5 h-3.5 mr-2" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-[13px] text-red-600" onSelect={() => setLogoutOpen(true)}>
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <Outlet />
        </main>
      </div>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out of client portal?</AlertDialogTitle>
            <AlertDialogDescription>You will need to sign in again to access your tickets and knowledge base.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout}>Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
