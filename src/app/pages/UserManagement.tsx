import { useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Edit,
  Eye,
  Lock,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  UserX,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { cn } from "../components/ui/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type UserRole = "Admin" | "Field Engineer" | "Client";
type UserStatus = "Active" | "Inactive" | "Pending" | "Suspended";

interface SDUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team: string;
  status: UserStatus;
  joinedAt: string;
  lastActive: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  isSystem: boolean;
  permissions: Record<string, Record<string, boolean>>;
}

type UMTab = "users" | "roles";

// ─── Constants ────────────────────────────────────────────────────────────────
const SD_MODULES = ["Tickets", "Contacts", "Reports", "Knowledge Base", "Settings"] as const;
const SD_ACTIONS = ["View", "Create", "Edit", "Delete"] as const;
const ROLES: UserRole[] = ["Admin", "Field Engineer", "Client"];
const STATUSES: UserStatus[] = ["Active", "Inactive", "Pending", "Suspended"];

const tabs: { id: UMTab; label: string; icon: React.ReactNode }[] = [
  { id: "users", label: "Users",               icon: <Users size={15} /> },
  { id: "roles", label: "Roles & Permissions", icon: <Shield size={15} /> },
];

const statusConfig: Record<UserStatus, { label: string; className: string }> = {
  Active:    { label: "Active",    className: "bg-[#e6f7ee] text-[#1a8a4a] border border-[#a3d9b8]" },
  Inactive:  { label: "Inactive",  className: "bg-muted text-muted-foreground border border-[#d1d5db]" },
  Pending:   { label: "Pending",   className: "bg-[#fff8e6] text-[#b07d00] border border-[#fcd34d]" },
  Suspended: { label: "Suspended", className: "bg-[#fef2f2] text-[#dc2626] border border-[#fca5a5]" },
};

const roleColors: Record<UserRole, string> = {
  "Admin":          "bg-primary/10 text-primary border border-primary/30",
  "Field Engineer": "bg-[#f0fdf4] text-[#166534] border border-[#86efac]",
  "Client":         "bg-[#fdf4ff] text-[#7c3aed] border border-[#d8b4fe]",
};

const roleColorDot: Record<string, string> = {
  "Admin":          "bg-primary text-primary-foreground",
  "Field Engineer": "bg-[#10b981] text-white",
  "Client":         "bg-[#7c3aed] text-white",
};

const avatarColors = [
  "bg-primary", "bg-[#10b981]", "bg-[#f59e0b]", "bg-[#8b5cf6]",
  "bg-[#ef4444]", "bg-[#06b6d4]", "bg-[#f97316]", "bg-[#ec4899]",
];

// ─── Seed data ─────────────────────────────────────────────────────────────────
const makeAllPerms = (val: boolean) =>
  Object.fromEntries(SD_MODULES.map((m) => [m, Object.fromEntries(SD_ACTIONS.map((a) => [a, val]))]));

const initialUsers: SDUser[] = [
  { id: "u1",  name: "Abraham Tayu",      email: "abreham.t@ienetworks.co",  role: "Admin",          team: "—",              status: "Active",    joinedAt: "2024-01-10", lastActive: "Active now" },
  { id: "u2",  name: "Wongel Wondyifraw", email: "wongel@ienetworks.co",     role: "Field Engineer", team: "END Team",       status: "Active",    joinedAt: "2024-03-15", lastActive: "2h ago" },
  { id: "u3",  name: "Sisay Shiferaw",    email: "sisay@ienetworks.co",      role: "Field Engineer", team: "ICT Field Team", status: "Active",    joinedAt: "2024-04-01", lastActive: "1d ago" },
  { id: "u4",  name: "Dawit Bekele",      email: "dawit@ienetworks.co",      role: "Field Engineer", team: "CSD Team",       status: "Active",    joinedAt: "2024-02-20", lastActive: "3h ago" },
  { id: "u5",  name: "Mebrate Degu",      email: "mebrate@ienetworks.co",    role: "Field Engineer", team: "NOC Team",       status: "Active",    joinedAt: "2024-05-05", lastActive: "5d ago" },
  { id: "u6",  name: "Masresha Melese",   email: "masresha@ienetworks.co",   role: "Field Engineer", team: "END Team",       status: "Inactive",  joinedAt: "2024-06-12", lastActive: "14d ago" },
  { id: "u7",  name: "EPSS Client",       email: "epss@gmail.com",           role: "Client",         team: "—",              status: "Active",    joinedAt: "2024-01-20", lastActive: "1d ago" },
  { id: "u8",  name: "IE Client",         email: "ie@gmail.com",             role: "Client",         team: "—",              status: "Active",    joinedAt: "2024-02-10", lastActive: "Active now" },
  { id: "u9",  name: "MinT Client",       email: "mint@gmail.com",           role: "Client",         team: "—",              status: "Inactive",  joinedAt: "2024-03-18", lastActive: "30d ago" },
  { id: "u10", name: "ERA/MOTL Client",   email: "eramotl@gmail.com",        role: "Client",         team: "—",              status: "Active",    joinedAt: "2024-04-22", lastActive: "4h ago" },
  { id: "u11", name: "MoTI Client",       email: "moti@gmail.com",           role: "Client",         team: "—",              status: "Pending",   joinedAt: "2024-06-30", lastActive: "—" },
];

const initialRoles: Role[] = [
  {
    id: "r1", name: "Admin",
    description: "Full system access — manage users, roles, tickets, and all configuration.",
    usersCount: 1, isSystem: true,
    permissions: makeAllPerms(true),
  },
  {
    id: "r2", name: "Field Engineer",
    description: "Handles assigned tickets and updates knowledge base articles.",
    usersCount: 5, isSystem: true,
    permissions: {
      Tickets:          { View: true,  Create: true,  Edit: true,  Delete: false },
      Contacts:         { View: true,  Create: false, Edit: false, Delete: false },
      Reports:          { View: true,  Create: false, Edit: false, Delete: false },
      "Knowledge Base": { View: true,  Create: true,  Edit: true,  Delete: false },
      Settings:         { View: false, Create: false, Edit: false, Delete: false },
    },
  },
  {
    id: "r3", name: "Client",
    description: "Submit and track support tickets. Read-only access to the knowledge base.",
    usersCount: 5, isSystem: true,
    permissions: {
      Tickets:          { View: true,  Create: true,  Edit: false, Delete: false },
      Contacts:         { View: true,  Create: false, Edit: false, Delete: false },
      Reports:          { View: false, Create: false, Edit: false, Delete: false },
      "Knowledge Base": { View: true,  Create: false, Edit: false, Delete: false },
      Settings:         { View: false, Create: false, Edit: false, Delete: false },
    },
  },
];

const KNOWN_CANDIDATES = [
  { id: "kc1", name: "Hana Tadesse",   email: "hana.t@ienetworks.co",  team: "END Team" },
  { id: "kc2", name: "Bereket Alemu",  email: "bereket@ienetworks.co", team: "ICT Field Team" },
  { id: "kc3", name: "Selam Getachew", email: "selam@ienetworks.co",   team: "CSD Team" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarColor(name: string) {
  const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % avatarColors.length;
  return avatarColors[idx];
}

// ─── Permissions Matrix ───────────────────────────────────────────────────────
function PermissionsMatrix({
  permissions,
  onChange,
  onToggleModule,
  readOnly = false,
}: {
  permissions: Record<string, Record<string, boolean>>;
  onChange?: (mod: string, action: string, val: boolean) => void;
  onToggleModule?: (mod: string, val: boolean) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted border-b border-border">
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-40">
              Module
            </th>
            {SD_ACTIONS.map((a) => (
              <th key={a} className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {a}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SD_MODULES.map((mod) => (
            <tr key={mod} className="border-b border-[#f0f2f7] hover:bg-muted/40">
              <td className="px-4 py-2.5 font-medium text-foreground text-sm">
                {!readOnly && onToggleModule ? (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={SD_ACTIONS.every((a) => permissions[mod]?.[a] ?? false)}
                      onCheckedChange={(v) => onToggleModule(mod, !!v)}
                    />
                    <span>{mod}</span>
                  </div>
                ) : mod}
              </td>
              {SD_ACTIONS.map((action) => {
                const checked = permissions[mod]?.[action] ?? false;
                return (
                  <td key={action} className="px-3 py-2.5 text-center">
                    {readOnly ? (
                      checked
                        ? <Check size={15} className="inline-block text-[#1a8a4a]" />
                        : <X    size={15} className="inline-block text-muted-foreground/40" />
                    ) : (
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => onChange?.(mod, action, !!v)}
                        className="mx-auto"
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Role Tab Button ──────────────────────────────────────────────────────────
function RoleTabButton({
  role, isSelected, onClick, onEdit, onDelete,
}: {
  role: Role; isSelected: boolean;
  onClick: () => void; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className={cn(
        "group min-w-[210px] rounded-lg border px-3 py-2 text-left transition-all cursor-pointer",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-background hover:border-primary/30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{role.name}</p>
          <p className="truncate text-xs text-muted-foreground">{role.usersCount} users</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost" size="icon"
              className="h-6 w-6 hover:bg-muted"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal size={13} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem className="text-sm cursor-pointer" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <Edit size={12} className="mr-2" /> Edit Role
            </DropdownMenuItem>
            {!role.isSystem && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-sm cursor-pointer text-[#dc2626]" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                  <Trash2 size={12} className="mr-2" /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
          roleColorDot[role.name] ?? "bg-primary/10 text-primary",
        )}>
          {role.isSystem ? "System Role" : "Custom Role"}
        </span>
        <ChevronRight size={13} className={isSelected ? "text-primary" : "text-muted-foreground/40 group-hover:text-muted-foreground"} />
      </div>
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers]             = useState<SDUser[]>(initialUsers);
  const [search, setSearch]           = useState("");
  const [filterRole, setFilterRole]   = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected]       = useState<string[]>([]);
  const [page, setPage]               = useState(1);
  const [inviteOpen, setInviteOpen]   = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteForm, setInviteForm]   = useState<{ candidateIds: string[]; role: UserRole }>({
    candidateIds: [], role: "Field Engineer",
  });

  const PER_PAGE = 8;

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch   = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole     = filterRole   === "all" || u.role   === filterRole;
    const matchStatus   = filterStatus === "all" || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSelect = (id: string) =>
    setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const toggleAll = () =>
    setSelected(selected.length === paged.length ? [] : paged.map((u) => u.id));

  const handleStatusChange = (id: string, status: UserStatus) =>
    setUsers((p) => p.map((u) => (u.id === id ? { ...u, status } : u)));

  const handleDelete = (id: string) => {
    setUsers((p) => p.filter((u) => u.id !== id));
    setSelected((p) => p.filter((x) => x !== id));
  };

  const existingEmails     = new Set(users.map((u) => u.email.toLowerCase()));
  const candidates         = KNOWN_CANDIDATES.filter((c) => !existingEmails.has(c.email.toLowerCase()));
  const filteredCandidates = candidates.filter(
    (c) => !inviteSearch || c.name.toLowerCase().includes(inviteSearch.toLowerCase()) || c.email.toLowerCase().includes(inviteSearch.toLowerCase()),
  );

  const handleInvite = () => {
    const picks = filteredCandidates.filter((c) => inviteForm.candidateIds.includes(c.id));
    if (!picks.length) return;
    const today = new Date().toISOString().split("T")[0];
    const newUsers: SDUser[] = picks.map((c, i) => ({
      id: `u-inv-${c.id}-${i}`, name: c.name, email: c.email,
      role: inviteForm.role, team: c.team, status: "Pending",
      joinedAt: today, lastActive: "—",
    }));
    setUsers((p) => [...newUsers, ...p]);
    setInviteOpen(false);
    setInviteForm({ candidateIds: [], role: "Field Engineer" });
    setInviteSearch("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
          <div className="relative w-full sm:w-[240px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-9 h-9 bg-background border-border text-sm"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={filterRole} onValueChange={(v) => { setFilterRole(v); setPage(1); }}>
            <SelectTrigger className="h-9 w-full sm:w-[150px] bg-background border-border text-sm">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
            <SelectTrigger className="h-9 w-full sm:w-[130px] bg-background border-border text-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <Button
              variant="outline" size="sm"
              className="h-9 text-[#dc2626] border-[#fca5a5] hover:bg-[#fef2f2]"
              onClick={() => { selected.forEach(handleDelete); setSelected([]); }}
            >
              <Trash2 size={14} className="mr-1.5" />
              Delete ({selected.length})
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-9 border-border bg-background text-sm">
            <Download size={14} className="mr-1.5" />
            Export
          </Button>
          <Button
            size="sm"
            className="h-9 bg-primary hover:bg-primary/90 text-white text-sm"
            onClick={() => setInviteOpen(true)}
          >
            <UserPlus size={14} className="mr-1.5" />
            Invite User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Users",          value: users.length,                                                                       Icon: Users,      color: "text-primary", bg: "bg-primary/10" },
          { label: "Active",               value: users.filter((u) => u.status === "Active").length,                                  Icon: UserCheck,  color: "text-[#1a8a4a]", bg: "bg-[#e6f7ee]" },
          { label: "Pending",              value: users.filter((u) => u.status === "Pending").length,                                 Icon: Clock3,     color: "text-[#b07d00]", bg: "bg-[#fff8e6]" },
          { label: "Inactive / Suspended", value: users.filter((u) => u.status === "Inactive" || u.status === "Suspended").length,    Icon: UserMinus,  color: "text-[#dc2626]", bg: "bg-[#fef2f2]" },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-background rounded-lg border border-border px-4 py-4 flex items-center gap-4">
            <div className={cn(bg, "rounded-md p-2")}>
              <Icon size={16} className={color} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={cn("font-semibold text-lg", color)}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-background rounded-lg border border-border flex-1 flex flex-col overflow-hidden">
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="w-10 px-4 py-3 text-left">
                  <Checkbox
                    checked={selected.length === paged.length && paged.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </th>
                {["User", "Role", "Team", "Status", "Last Active"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {h}
                  </th>
                ))}
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {paged.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[#f0f2f7] transition-colors hover:bg-muted/40 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selected.includes(user.id)}
                      onClick={(e) => e.stopPropagation()}
                      onCheckedChange={() => toggleSelect(user.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={cn(getAvatarColor(user.name), "text-white text-xs font-medium")}>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground hover:text-primary transition-colors">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", roleColors[user.role])}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground/70">{user.team}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[user.status].className)}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{user.lastActive}</td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal size={15} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem className="text-sm cursor-pointer">
                          <Eye size={13} className="mr-2" /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-sm cursor-pointer">
                          <Edit size={13} className="mr-2" /> Edit User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === "Active" ? (
                          <DropdownMenuItem
                            className="text-sm cursor-pointer text-[#b07d00]"
                            onClick={() => handleStatusChange(user.id, "Inactive")}
                          >
                            <UserX size={13} className="mr-2" /> Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-sm cursor-pointer text-[#1a8a4a]"
                            onClick={() => handleStatusChange(user.id, "Active")}
                          >
                            <CheckCircle2 size={13} className="mr-2" /> Activate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-sm cursor-pointer text-[#dc2626]"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 size={13} className="mr-2" /> Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    No users found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} users
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={14} />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "ghost"}
                size="icon"
                className={cn("h-7 w-7 text-xs", p === page && "bg-primary hover:bg-primary/90 text-white")}
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page === totalPages || totalPages === 0} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-h-[90vh] max-w-[calc(100%-2rem)] overflow-hidden sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <UserPlus size={18} className="text-primary" />
              Invite New User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto py-2 pr-1">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Search Known People</Label>
              <Input
                placeholder="Search by name or email"
                className="h-9 border-border"
                value={inviteSearch}
                onChange={(e) => setInviteSearch(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">Search to quickly find the right person.</p>
            </div>

            <div className="rounded-md border border-border">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <p className="text-xs text-muted-foreground">Known people ({filteredCandidates.length})</p>
                <div className="flex items-center gap-1">
                  <Button
                    type="button" variant="ghost" size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setInviteForm((f) => ({ ...f, candidateIds: filteredCandidates.map((c) => c.id) }))}
                  >
                    Select all
                  </Button>
                  {inviteForm.candidateIds.length > 0 && (
                    <Button
                      type="button" variant="ghost" size="sm"
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setInviteForm((f) => ({ ...f, candidateIds: [] }))}
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              </div>
              <div className="max-h-56 overflow-y-auto p-2 space-y-1">
                {filteredCandidates.length === 0 ? (
                  <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                    No candidates available.
                  </p>
                ) : filteredCandidates.map((c) => {
                  const isSel = inviteForm.candidateIds.includes(c.id);
                  return (
                    <button
                      key={c.id} type="button"
                      className={cn(
                        "w-full rounded-md border px-3 py-2 text-left transition-colors",
                        isSel ? "border-primary/30 bg-primary/10" : "border-transparent hover:border-border hover:bg-muted",
                      )}
                      onClick={() => setInviteForm((f) => ({
                        ...f,
                        candidateIds: isSel ? f.candidateIds.filter((id) => id !== c.id) : [...f.candidateIds, c.id],
                      }))}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                          <p className="text-xs text-muted-foreground">Team: {c.team}</p>
                        </div>
                        {isSel && <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Assign Role *</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(v) => setInviteForm((f) => ({ ...f, role: v as UserRole }))}
              >
                <SelectTrigger className="h-9 border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" size="sm" className="border-border" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm" className="bg-primary hover:bg-primary/90 text-white"
              onClick={handleInvite}
              disabled={inviteForm.candidateIds.length === 0}
            >
              Send Invite{inviteForm.candidateIds.length > 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Roles Tab ────────────────────────────────────────────────────────────────
function RolesTab() {
  const [roles, setRoles]               = useState<Role[]>(initialRoles);
  const [selectedRole, setSelectedRole] = useState<Role>(initialRoles[0]);
  const [createOpen, setCreateOpen]     = useState(false);
  const [editRole, setEditRole]         = useState<Role | null>(null);

  const emptyPerms = Object.fromEntries(
    SD_MODULES.map((m) => [m, Object.fromEntries(SD_ACTIONS.map((a) => [a, false]))]),
  );

  const [newRole, setNewRole] = useState({ name: "", description: "", permissions: emptyPerms });

  const applyModulePerms = (perms: typeof emptyPerms, mod: string, val: boolean) => ({
    ...perms, [mod]: Object.fromEntries(SD_ACTIONS.map((a) => [a, val])),
  });
  const applyAllPerms = (_: typeof emptyPerms, val: boolean) =>
    Object.fromEntries(SD_MODULES.map((m) => [m, Object.fromEntries(SD_ACTIONS.map((a) => [a, val]))]));

  const handleCreate = () => {
    const role: Role = { id: `r${Date.now()}`, ...newRole, usersCount: 0, isSystem: false };
    setRoles((p) => [...p, role]);
    setCreateOpen(false);
    setNewRole({ name: "", description: "", permissions: emptyPerms });
  };

  const handleSaveEdit = () => {
    if (!editRole) return;
    setRoles((p) => p.map((r) => (r.id === editRole.id ? editRole : r)));
    if (selectedRole.id === editRole.id) setSelectedRole(editRole);
    setEditRole(null);
  };

  const handleDeleteRole = (id: string) => {
    setRoles((p) => p.filter((r) => r.id !== id));
    if (selectedRole.id === id) setSelectedRole(roles.find((r) => r.id !== id)!);
  };

  const allChecked = SD_MODULES.every((m) => SD_ACTIONS.every((a) => newRole.permissions[m]?.[a] ?? false));

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Role selector row */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground mb-1">Roles</p>
          <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center gap-2 pb-1">
              {roles.map((role) => (
                <RoleTabButton
                  key={role.id} role={role}
                  isSelected={selectedRole?.id === role.id}
                  onClick={() => setSelectedRole(role)}
                  onEdit={() => setEditRole({ ...role })}
                  onDelete={() => handleDeleteRole(role.id)}
                />
              ))}
            </div>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 text-white h-9 flex-shrink-0"
          onClick={() => setCreateOpen(true)}
        >
          <Plus size={14} className="mr-1.5" /> Create Role
        </Button>
      </div>

      {/* Permissions panel */}
      <div className="flex-1 bg-background rounded-lg border border-border overflow-hidden flex flex-col">
        {selectedRole ? (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-foreground">{selectedRole.name}</h3>
                  {selectedRole.isSystem && (
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                      <Lock size={9} /> System Role
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{selectedRole.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
                  <Users size={14} />
                  <span>{selectedRole.usersCount} users with this role</span>
                </div>
                <Button
                  size="sm" variant="outline"
                  className="h-8 border-border text-sm"
                  onClick={() => setEditRole({ ...selectedRole })}
                >
                  <Edit size={13} className="mr-1.5" /> Edit Role
                </Button>
              </div>
            </div>
            <div className="overflow-auto flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <PermissionsMatrix permissions={selectedRole.permissions} readOnly />
            </div>
            <div className="px-5 py-3 border-t border-[#f0f2f7] bg-muted flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Check size={12} className="text-[#1a8a4a]" /> = Permission Granted</span>
              <span className="flex items-center gap-1"><X size={12} className="text-muted-foreground/40" /> = No Access</span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a role to view permissions
          </div>
        )}
      </div>

      {/* Create Role Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="flex w-[800px] max-w-[95vw] flex-col sm:!max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Shield size={18} className="text-primary" /> Create New Role
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Role Name *</Label>
                <Input placeholder="e.g. Support Lead" value={newRole.name} onChange={(e) => setNewRole((f) => ({ ...f, name: e.target.value }))} className="h-9 border-border" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Description</Label>
                <Input placeholder="Brief description of this role" value={newRole.description} onChange={(e) => setNewRole((f) => ({ ...f, description: e.target.value }))} className="h-9 border-border" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <Label className="text-xs text-muted-foreground">Permissions Matrix</Label>
                <Button
                  type="button" variant="ghost" size="sm"
                  className="h-7 px-2 text-[11px] normal-case text-primary hover:text-primary/80"
                  onClick={() => setNewRole((f) => ({ ...f, permissions: applyAllPerms(f.permissions, !allChecked) }))}
                >
                  {allChecked ? "Clear all" : "Select all"}
                </Button>
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                <PermissionsMatrix
                  permissions={newRole.permissions}
                  onToggleModule={(mod, val) => setNewRole((f) => ({ ...f, permissions: applyModulePerms(f.permissions, mod, val) }))}
                  onChange={(mod, action, val) => setNewRole((f) => ({ ...f, permissions: { ...f.permissions, [mod]: { ...f.permissions[mod], [action]: val } } }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="border-border" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white" onClick={handleCreate} disabled={!newRole.name}>
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      {editRole && (
        <Dialog open={!!editRole} onOpenChange={() => setEditRole(null)}>
          <DialogContent className="flex w-[800px] max-w-[95vw] flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <Edit size={18} className="text-primary" /> Edit Role: {editRole.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Role Name</Label>
                  <Input value={editRole.name} disabled={editRole.isSystem} onChange={(e) => setEditRole((r) => r ? { ...r, name: e.target.value } : r)} className="h-9 border-border" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <Input value={editRole.description} onChange={(e) => setEditRole((r) => r ? { ...r, description: e.target.value } : r)} className="h-9 border-border" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Permissions</Label>
                <div className="border border-border rounded-lg overflow-hidden">
                  <PermissionsMatrix
                    permissions={editRole.permissions}
                    readOnly={editRole.isSystem}
                    onChange={(mod, action, val) =>
                      setEditRole((r) => r ? { ...r, permissions: { ...r.permissions, [mod]: { ...r.permissions[mod], [action]: val } } } : r)
                    }
                  />
                </div>
                {editRole.isSystem && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Lock size={11} /> System roles have fixed permissions and cannot be modified.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" className="border-border" onClick={() => setEditRole(null)}>Cancel</Button>
              {!editRole.isSystem && (
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white" onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function UserManagement() {
  const [activeTab, setActiveTab] = useState<UMTab>("users");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page Header */}
      <div className="bg-background border-b border-border px-6 py-3 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-semibold text-foreground">User Management</h1>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="mt-4 -mb-[1px] flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              )}
            >
              <span className={activeTab === tab.id ? "text-primary" : "text-muted-foreground"}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden min-h-0 flex flex-col p-3 sm:p-5">
        {activeTab === "users" && <UsersTab />}
        {activeTab === "roles" && <RolesTab />}
      </div>
    </div>
  );
}
