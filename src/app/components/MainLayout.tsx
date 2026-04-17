import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Ticket,
  Users,
  Building2,
  UserCircle,
  BookOpen,
  LifeBuoy,
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
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Input } from './ui/input';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Helpdesk',
    items: [
      { name: 'Tickets', href: '/tickets', icon: Ticket, exact: false },
      { name: 'Support', href: '/support', icon: LifeBuoy, exact: false },
      { name: 'Email Support', href: '/email-support', icon: Mail, exact: false },
      { name: 'Knowledge Base', href: '/knowledge', icon: BookOpen, exact: false },
    ],
  },
  {
    label: 'Directory',
    items: [
      { name: 'Contacts', href: '/contacts', icon: Users, exact: false },
      { name: 'Companies', href: '/companies', icon: Building2, exact: false },
      { name: 'Employees', href: '/employees', icon: UserCircle, exact: false },
    ],
  },
];

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const navigate = useNavigate();

  const confirmLogout = () => {
    setLogoutOpen(false);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="bg-muted flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarCollapsed ? 'w-[60px]' : 'w-[220px]'} bg-sidebar text-sidebar-foreground flex flex-col flex-shrink-0 transition-all duration-200`}
      >
        {/* Logo */}
        <div className={`border-sidebar-border h-[56px] flex items-center border-b flex-shrink-0 ${sidebarCollapsed ? 'px-4 justify-center' : 'px-5'}`}>
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
                <div className="text-white text-sm font-semibold leading-tight truncate">Service Desk</div>
                <div className="text-sidebar-foreground/60 text-xs leading-tight">Workspace</div>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto py-3 px-2">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!sidebarCollapsed && (
                <div className="mb-1 px-2">
                  <span className="text-sidebar-foreground/60 text-[10px] uppercase tracking-widest font-semibold">{group.label}</span>
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
                          ? 'bg-white text-primary dark:bg-sidebar-muted dark:text-sidebar-foreground'
                          : 'text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent'
                      } ${sidebarCollapsed ? 'justify-center' : ''}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && !sidebarCollapsed && (
                          <div className="bg-sidebar-accent absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full" />
                        )}
                        <item.icon
                          className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary dark:text-sidebar-foreground' : ''}`}
                        />
                        {!sidebarCollapsed && (
                          <span className="text-[13px] font-medium truncate">{item.name}</span>
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
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-2 py-2 rounded-md transition-all group relative ${
                isActive
                  ? 'bg-white text-primary dark:bg-sidebar-muted dark:text-sidebar-foreground'
                  : 'text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent'
              } ${sidebarCollapsed ? 'justify-center' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !sidebarCollapsed && (
                  <div className="bg-sidebar-accent absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full" />
                )}
                <SettingsIcon className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-[13px] font-medium">Settings</span>}
              </>
            )}
          </NavLink>

          {/* User */}
          {!sidebarCollapsed && (
            <div className="mt-1 px-2 py-2">
              <div className="flex items-center gap-2.5">
                <div className="bg-secondary text-secondary-foreground flex size-7 items-center justify-center rounded-full text-xs font-semibold flex-shrink-0">
                  AT
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-medium truncate">Abraham Tayu</div>
                  <div className="text-sidebar-foreground/60 text-[11px] truncate">Admin</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                  onClick={() => setLogoutOpen(true)}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent h-auto w-full items-center gap-3 rounded-md px-2 py-2 ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span className="text-[13px]">Collapse</span>
              </>
            )}
          </Button>
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
                <DropdownMenuItem onSelect={() => navigate('/tickets/new')} className="text-[13px]">
                  <Ticket className="w-3.5 h-3.5 mr-2" />
                  New Ticket
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate('/support/new')} className="text-[13px]">
                  <LifeBuoy className="w-3.5 h-3.5 mr-2" />
                  New Support
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate('/email-support/new')} className="text-[13px]">
                  <Mail className="w-3.5 h-3.5 mr-2" />
                  Compose Email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate('/contacts')} className="text-[13px]">
                  <Users className="w-3.5 h-3.5 mr-2" />
                  New Contact
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate('/companies')} className="text-[13px]">
                  <Building2 className="w-3.5 h-3.5 mr-2" />
                  New Company
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative size-8">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuItem className="flex-col items-start gap-0.5">
                  <span className="font-medium">Ticket SUP-204 breached SLA</span>
                  <span className="text-xs text-muted-foreground">2 minutes ago</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex-col items-start gap-0.5">
                  <span className="font-medium">New message from EPSS client</span>
                  <span className="text-xs text-muted-foreground">10 minutes ago</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate('/support')}>
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground size-8">
              <HelpCircle className="w-4 h-4" />
            </Button>

            <div className="bg-border h-5 w-px" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto gap-2 px-0 hover:bg-transparent">
                  <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-full text-xs font-semibold">
                    AT
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-foreground text-[13px] font-medium leading-tight">Abraham Tayu</div>
                    <div className="text-muted-foreground text-[11px] leading-tight">Admin</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-[13px]">
                  <UserCircle className="w-3.5 h-3.5 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="text-[13px]">
                  <SettingsIcon className="w-3.5 h-3.5 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-[13px] text-red-600" onSelect={() => setLogoutOpen(true)}>
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
            <AlertDialogAction onClick={confirmLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}