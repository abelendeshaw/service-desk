import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Ticket,
  Users,
  UserCircle,
  BookOpen,
  Settings as SettingsIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Plus,
  HelpCircle,
  Mail,
  BarChart2,
  CheckCheck,
  X,
  UserCheck,
  RefreshCw,
  AlertTriangle,
  Info as InfoIcon,
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

const kindConfig = {
  assignment: { icon: UserCheck,     bg: "bg-blue-50",    text: "text-blue-600",    label: "Assignment" },
  status:     { icon: RefreshCw,     bg: "bg-emerald-50", text: "text-emerald-600", label: "Status" },
  escalation: { icon: AlertTriangle, bg: "bg-red-50",     text: "text-red-600",     label: "Escalation" },
  email:      { icon: Mail,          bg: "bg-violet-50",  text: "text-violet-600",  label: "Email" },
  system:     { icon: InfoIcon,      bg: "bg-muted",      text: "text-muted-foreground", label: "System" },
} as const;

const navGroups = [
  {
    label: "Helpdesk",
    items: [
      { name: "Tickets", href: "/tickets", icon: Ticket, exact: false },
      {
        name: "Knowledge Base",
        href: "/knowledge",
        icon: BookOpen,
        exact: false,
      },
      { name: "Reports", href: "/reports", icon: BarChart2, exact: false },
    ],
  },
  {
    label: "Directory",
    items: [
      { name: "Contacts", href: "/contacts", icon: Users, exact: false },
    ],
  },
];

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<"all" | "unread">("all");
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { notifications, markNotificationsRead, markNotificationRead, dismissNotification } = useServiceDesk();
  const unreadCount = notifications.filter((n) => n.unread).length;
  const displayedNotifs = notifFilter === "unread" ? notifications.filter((n) => n.unread) : notifications;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  const confirmLogout = () => {
    setLogoutOpen(false);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="bg-muted flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarCollapsed ? "w-[60px]" : "w-[220px]"} bg-sidebar text-sidebar-foreground flex flex-col flex-shrink-0 transition-all duration-200`}
      >
        {/* Logo */}
        <div
          className={`border-sidebar-border h-[56px] flex items-center border-b flex-shrink-0 ${sidebarCollapsed ? "px-3 justify-between" : "px-4 justify-between"}`}
        >
          {sidebarCollapsed ? (
            <div className="bg-secondary text-secondary-foreground flex size-7 items-center justify-center rounded-md flex-shrink-0">
              <Ticket className="text-secondary-foreground w-4 h-4" />
            </div>
          ) : (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="bg-secondary text-secondary-foreground flex size-7 items-center justify-center rounded-md flex-shrink-0">
                <Ticket className="text-secondary-foreground w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-white text-sm font-semibold leading-tight truncate">
                  Service Desk
                </div>
                <div className="text-sidebar-foreground/60 text-xs leading-tight">
                  Workspace
                </div>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-sidebar-foreground/60 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent size-7 flex-shrink-0"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto py-3 px-2">
          <div className="flex flex-col gap-0.5">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-2 py-2 rounded-md transition-all duration-100 group relative ${
                  isActive
                    ? "bg-white text-primary dark:bg-sidebar-muted dark:text-sidebar-foreground"
                    : "text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                } ${sidebarCollapsed ? "justify-center" : ""}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && !sidebarCollapsed && (
                    <div className="bg-sidebar-accent absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full" />
                  )}
                  <LayoutDashboard className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary dark:text-sidebar-foreground" : ""}`} />
                  {!sidebarCollapsed && (
                    <span className="text-[13px] font-medium truncate">Dashboard</span>
                  )}
                </>
              )}
            </NavLink>
          </div>

          {navGroups.map((group) => (
            <div key={group.label}>
              {!sidebarCollapsed && (
                <div className="mb-1 px-2">
                  <span className="text-sidebar-foreground/60 text-[10px] uppercase tracking-widest font-semibold">
                    {group.label}
                  </span>
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    end={item.exact}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-2 py-2 rounded-md transition-all duration-100 group relative ${
                        isActive
                          ? "bg-white text-primary dark:bg-sidebar-muted dark:text-sidebar-foreground"
                          : "text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                      } ${sidebarCollapsed ? "justify-center" : ""}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && !sidebarCollapsed && (
                          <div className="bg-sidebar-accent absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full" />
                        )}
                        <item.icon
                          className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary dark:text-sidebar-foreground" : ""}`}
                        />
                        {!sidebarCollapsed && (
                          <span className="text-[13px] font-medium truncate">
                            {item.name}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-sidebar-border flex-shrink-0 border-t p-2">
          <NavLink
            to="/employees"
            className={({ isActive }) =>
              `flex items-center gap-3 px-2 py-2 rounded-md transition-all group relative ${
                isActive
                  ? "bg-white text-primary dark:bg-sidebar-muted dark:text-sidebar-foreground"
                  : "text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
              } ${sidebarCollapsed ? "justify-center" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !sidebarCollapsed && (
                  <div className="bg-sidebar-accent absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full" />
                )}
                <UserCircle
                  className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary dark:text-sidebar-foreground" : ""}`}
                />
                {!sidebarCollapsed && (
                  <span className="text-[13px] font-medium">User Management</span>
                )}
              </>
            )}
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-2 py-2 rounded-md transition-all group relative ${
                isActive
                  ? "bg-white text-primary dark:bg-sidebar-muted dark:text-sidebar-foreground"
                  : "text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
              } ${sidebarCollapsed ? "justify-center" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !sidebarCollapsed && (
                  <div className="bg-sidebar-accent absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full" />
                )}
                <SettingsIcon className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="text-[13px] font-medium">Settings</span>
                )}
              </>
            )}
          </NavLink>

        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-background border-border flex h-[56px] items-center gap-4 border-b px-6 flex-shrink-0">
          <div className="flex-1 flex items-center gap-3">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
              <Input
                placeholder="Search tickets, contacts..."
                className="h-8 w-64 pl-9 pr-4 text-[13px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-8 gap-1.5 px-3 text-[13px]" size="sm">
                  <Plus className="w-3.5 h-3.5" />
                  New
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onSelect={() => navigate("/tickets/new")}
                  className="text-[13px]"
                >
                  <Ticket className="w-3.5 h-3.5 mr-2" />
                  New Ticket
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => navigate("/email-support/new")}
                  className="text-[13px]"
                >
                  <Mail className="w-3.5 h-3.5 mr-2" />
                  Compose Email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => navigate("/contacts")}
                  className="text-[13px]"
                >
                  <Users className="w-3.5 h-3.5 mr-2" />
                  New Contact
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
                <div className="absolute right-0 top-full mt-2 w-[440px] rounded-xl border bg-background shadow-xl z-50 flex flex-col overflow-hidden" style={{ maxHeight: 520 }}>
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-semibold">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="flex items-center justify-center h-5 min-w-[20px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1.5">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost" size="sm"
                          className="h-7 gap-1.5 px-2 text-[12px] text-muted-foreground hover:text-foreground"
                          onClick={() => markNotificationsRead()}
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Mark all read
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => setNotifOpen(false)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex gap-1 px-3 py-2 border-b flex-shrink-0">
                    {(["all", "unread"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setNotifFilter(f)}
                        className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                          notifFilter === f
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {f === "all" ? "All" : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
                      </button>
                    ))}
                  </div>

                  {/* List */}
                  <div className="flex-1 overflow-y-auto">
                    {displayedNotifs.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-14 text-center">
                        <Bell className="w-8 h-8 text-muted-foreground/30" />
                        <div className="text-[13px] font-medium">No notifications</div>
                        <div className="text-[12px] text-muted-foreground">
                          {notifFilter === "unread" ? "You're all caught up!" : "Nothing here yet"}
                        </div>
                      </div>
                    ) : (
                      displayedNotifs.map((n) => {
                        const kc = kindConfig[n.kind] ?? kindConfig.system;
                        const KindIcon = kc.icon;
                        return (
                          <div
                            key={n.id}
                            className={`group flex gap-3 px-4 py-3.5 border-b last:border-0 cursor-pointer transition-colors hover:bg-muted/40 ${n.unread ? "bg-blue-50/40" : ""}`}
                            onClick={() => {
                              markNotificationRead(n.id);
                              if (n.href) { navigate(n.href); setNotifOpen(false); }
                            }}
                          >
                            <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${kc.bg}`}>
                              <KindIcon className={`w-4 h-4 ${kc.text}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className={`text-[13px] leading-snug ${n.unread ? "font-semibold" : "font-medium text-foreground/80"}`}>
                                {n.title}
                              </div>
                              {n.detail && (
                                <div className="mt-0.5 text-[12px] text-muted-foreground line-clamp-1">{n.detail}</div>
                              )}
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-[11px] text-muted-foreground">{relativeTime(n.createdAt)}</span>
                                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${kc.bg} ${kc.text}`}>
                                  {kc.label}
                                </span>
                              </div>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-2 pt-0.5">
                              {n.unread && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                              <button
                                className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-5 h-5 rounded-md hover:bg-muted transition-all"
                                onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }}
                              >
                                <X className="w-3 h-3 text-muted-foreground" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="border-t px-4 py-2.5 flex-shrink-0 flex items-center justify-between bg-muted/30">
                      <span className="text-[12px] text-muted-foreground">{notifications.length} notification{notifications.length !== 1 ? "s" : ""}</span>
                      <Button
                        variant="ghost" size="sm"
                        className="h-7 px-2 text-[12px] text-muted-foreground hover:text-foreground"
                        onClick={() => notifications.forEach((n) => dismissNotification(n.id))}
                      >
                        Clear all
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground size-8"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>

            <div className="bg-border h-5 w-px" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto gap-2 px-0 hover:bg-transparent"
                >
                  <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-full text-xs font-semibold">
                    AT
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-foreground text-[13px] font-medium leading-tight">
                      Abraham Tayu
                    </div>
                    <div className="text-muted-foreground text-[11px] leading-tight">
                      Admin
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-[13px]">
                  <UserCircle className="w-3.5 h-3.5 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/settings")}
                  className="text-[13px]"
                >
                  <SettingsIcon className="w-3.5 h-3.5 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-[13px] text-red-600"
                  onSelect={() => setLogoutOpen(true)}
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out now?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access your workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout}>
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
