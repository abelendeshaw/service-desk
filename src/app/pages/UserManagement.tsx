import { useState, useMemo, useEffect, useRef } from "react";
import {
  ArrowLeft, BarChart3, BookOpen, Building2, Check, CheckCircle2,
  ChevronDown, ChevronLeft, ChevronRight, Clock, Crown, Download, Edit,
  Globe, Inbox, Mail, MoreHorizontal, MoreVertical, Package, Pencil,
  Plus, Search, Settings as SettingsIcon, Shield, Ticket, Trash2,
  Upload, User, UserCheck, UserMinus, UserPlus, UserX, Users, X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "../components/ui/tooltip";
import { cn } from "../components/ui/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserStatus = "Active" | "Inactive" | "Invited" | "Pending";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  branch: string;
  department: string;
  division: string;
  status: UserStatus;
  lastLogin: string;
  dateJoined: string;
  roles: string[];
  teamIds: string[];
};

type TeamRecord = {
  id: string;
  name: string;
  description: string;
  function: string;
  members: Array<{ userId: string; role: "Leader" | "Member" }>;
  createdAt: string;
};

type InvitationRecord = {
  id: string;
  email: string;
  name?: string;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: "Pending" | "Accepted" | "Declined" | "Expired";
  roles: string[];
  source: "internal" | "external";
};

type CrossProductInvitation = {
  id: string;
  fromProduct: string;
  fromProductColor: string;
  fromUser: string;
  fromUserInitials: string;
  fromOrg: string;
  role: string;
  invitedAt: string;
  status: "Pending" | "Accepted" | "Declined";
  description: string;
};

type ModuleKey = "Tickets" | "Contacts" | "Reports" | "Knowledge Base" | "Settings";
type ActionKey = "view" | "create" | "edit" | "delete" | "export";
type ModulePermissions = Record<ActionKey, boolean>;
type RolePermissions = Record<ModuleKey, ModulePermissions>;

type SDRole = {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  color: string;
  permissions: RolePermissions;
  userCount: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_MODULES: ModuleKey[] = ["Tickets", "Contacts", "Reports", "Knowledge Base", "Settings"];
const ALL_ACTIONS: ActionKey[] = ["view", "create", "edit", "delete", "export"];

const MODULE_ICONS: Record<ModuleKey, React.ElementType> = {
  Tickets: Ticket,
  Contacts: Users,
  Reports: BarChart3,
  "Knowledge Base": BookOpen,
  Settings: SettingsIcon,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatJoinDate(iso: string): string {
  if (!iso || iso === "—") return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  const mi = parseInt(m, 10) - 1;
  if (mi < 0 || mi > 11) return iso;
  return `${parseInt(d, 10)} ${MONTH_NAMES[mi]}, ${y}`;
}

function statusColor(s: UserStatus) {
  if (s === "Active")   return "bg-emerald-100 text-emerald-700";
  if (s === "Inactive") return "bg-slate-100 text-slate-600";
  if (s === "Invited")  return "bg-amber-100 text-amber-700";
  return "bg-blue-100 text-blue-700";
}

function roleColor(r: string) {
  const k = r.toLowerCase();
  if (k === "admin")          return "bg-primary/10 text-primary";
  if (k === "field engineer") return "bg-emerald-100 text-emerald-700";
  if (k === "client")         return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

const AVATAR_COLORS = [
  "bg-primary", "bg-emerald-500", "bg-amber-500", "bg-violet-500",
  "bg-red-400", "bg-cyan-500", "bg-orange-400", "bg-pink-500",
];

function avatarColor(name: string) {
  const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function makeAllPerms(v: boolean): ModulePermissions {
  return { view: v, create: v, edit: v, delete: v, export: v };
}

function orMergePerms(a: ModulePermissions, b: ModulePermissions): ModulePermissions {
  return {
    view:   a.view   || b.view,
    create: a.create || b.create,
    edit:   a.edit   || b.edit,
    delete: a.delete || b.delete,
    export: a.export || b.export,
  };
}

function makeRolePerms(overrides: Partial<Record<ModuleKey, Partial<ModulePermissions>>>): RolePermissions {
  const base = Object.fromEntries(ALL_MODULES.map((m) => [m, makeAllPerms(false)])) as RolePermissions;
  for (const [mod, perms] of Object.entries(overrides)) {
    base[mod as ModuleKey] = { ...base[mod as ModuleKey], ...perms };
  }
  return base;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SD_USER_POOL: Omit<UserRecord, "roles" | "teamIds" | "status" | "lastLogin" | "dateJoined">[] = [
  { id: "sp-1", name: "Hana Tadesse",    email: "hana.t@ienetworks.co",    phone: "+251 911 001 001", jobTitle: "Support Engineer",      branch: "HQ",        department: "Support",    division: "Operations" },
  { id: "sp-2", name: "Bereket Alemu",   email: "bereket@ienetworks.co",   phone: "+251 911 002 002", jobTitle: "Field Technician",       branch: "HQ",        department: "Field Ops",  division: "Operations" },
  { id: "sp-3", name: "Selam Getachew",  email: "selam@ienetworks.co",     phone: "+251 911 003 003", jobTitle: "NOC Analyst",            branch: "Branch A",  department: "NOC",        division: "Operations" },
  { id: "sp-4", name: "Yohannes Tesfay", email: "yohannes@ienetworks.co",  phone: "+251 911 004 004", jobTitle: "Helpdesk Specialist",    branch: "HQ",        department: "Support",    division: "Operations" },
  { id: "sp-5", name: "Tigist Hailu",    email: "tigist.h@ienetworks.co",  phone: "+251 911 005 005", jobTitle: "Network Engineer",       branch: "Branch B",  department: "Field Ops",  division: "Operations" },
];

const INITIAL_USERS: UserRecord[] = [
  {
    id: "u1", name: "Abraham Tayu", email: "abreham.t@ienetworks.co",
    phone: "+251 911 100 001", jobTitle: "System Administrator", branch: "HQ",
    department: "IT", division: "Corporate",
    status: "Active", lastLogin: "2026-06-09 08:45", dateJoined: "2024-01-10",
    roles: ["Admin"], teamIds: ["t1"],
  },
  {
    id: "u2", name: "Wongel Wondyifraw", email: "wongel@ienetworks.co",
    phone: "+251 911 100 002", jobTitle: "Senior Field Engineer", branch: "HQ",
    department: "Field Ops", division: "Operations",
    status: "Active", lastLogin: "2026-06-09 07:30", dateJoined: "2024-03-15",
    roles: ["Field Engineer"], teamIds: ["t2"],
  },
  {
    id: "u3", name: "Sisay Shiferaw", email: "sisay@ienetworks.co",
    phone: "+251 911 100 003", jobTitle: "ICT Field Engineer", branch: "HQ",
    department: "Field Ops", division: "Operations",
    status: "Active", lastLogin: "2026-06-08 16:20", dateJoined: "2024-04-01",
    roles: ["Field Engineer"], teamIds: ["t2"],
  },
  {
    id: "u4", name: "Dawit Bekele", email: "dawit@ienetworks.co",
    phone: "+251 911 100 004", jobTitle: "CSD Engineer", branch: "Branch A",
    department: "Support", division: "Operations",
    status: "Active", lastLogin: "2026-06-09 09:15", dateJoined: "2024-02-20",
    roles: ["Field Engineer"], teamIds: ["t1"],
  },
  {
    id: "u5", name: "Mebrate Degu", email: "mebrate@ienetworks.co",
    phone: "+251 911 100 005", jobTitle: "NOC Engineer", branch: "HQ",
    department: "NOC", division: "Operations",
    status: "Active", lastLogin: "2026-06-07 14:00", dateJoined: "2024-05-05",
    roles: ["Field Engineer"], teamIds: ["t3"],
  },
  {
    id: "u6", name: "Masresha Melese", email: "masresha@ienetworks.co",
    phone: "+251 911 100 006", jobTitle: "Field Engineer", branch: "HQ",
    department: "Field Ops", division: "Operations",
    status: "Inactive", lastLogin: "2026-05-25 11:00", dateJoined: "2024-06-12",
    roles: ["Field Engineer"], teamIds: [],
  },
  {
    id: "u7", name: "EPSS Client", email: "epss@gmail.com",
    phone: "", jobTitle: "Client Contact", branch: "External",
    department: "—", division: "—",
    status: "Active", lastLogin: "2026-06-08 10:30", dateJoined: "2024-01-20",
    roles: ["Client"], teamIds: [],
  },
  {
    id: "u8", name: "IE Networks Client", email: "ie@gmail.com",
    phone: "", jobTitle: "Client Contact", branch: "External",
    department: "—", division: "—",
    status: "Active", lastLogin: "2026-06-09 08:00", dateJoined: "2024-02-10",
    roles: ["Client"], teamIds: [],
  },
  {
    id: "u9", name: "MinT Client", email: "mint@gmail.com",
    phone: "", jobTitle: "Client Contact", branch: "External",
    department: "—", division: "—",
    status: "Inactive", lastLogin: "2026-05-10 09:00", dateJoined: "2024-03-18",
    roles: ["Client"], teamIds: [],
  },
  {
    id: "u10", name: "ERA/MOTL Client", email: "eramotl@gmail.com",
    phone: "", jobTitle: "Client Contact", branch: "External",
    department: "—", division: "—",
    status: "Active", lastLogin: "2026-06-09 07:00", dateJoined: "2024-04-22",
    roles: ["Client"], teamIds: [],
  },
  {
    id: "u11", name: "MoTI Client", email: "moti@gmail.com",
    phone: "", jobTitle: "Client Contact", branch: "External",
    department: "—", division: "—",
    status: "Invited", lastLogin: "—", dateJoined: "2024-06-30",
    roles: ["Client"], teamIds: [],
  },
];

const INITIAL_TEAMS: TeamRecord[] = [
  {
    id: "t1", name: "Support Team",
    description: "Handles all incoming client tickets, escalations, and SLA management",
    function: "Support",
    members: [{ userId: "u1", role: "Leader" }, { userId: "u4", role: "Member" }],
    createdAt: "2024-01-10",
  },
  {
    id: "t2", name: "Field Engineering",
    description: "Handles on-site installations, maintenance, and field-level troubleshooting",
    function: "Field Ops",
    members: [{ userId: "u2", role: "Leader" }, { userId: "u3", role: "Member" }],
    createdAt: "2024-03-01",
  },
  {
    id: "t3", name: "NOC Team",
    description: "Network Operations Center — 24/7 monitoring, alerting, and incident response",
    function: "NOC",
    members: [{ userId: "u5", role: "Leader" }],
    createdAt: "2024-05-01",
  },
];

const INITIAL_ROLES: SDRole[] = [
  {
    id: "role-1", name: "Admin", description: "Full access to all modules, user management, and system configuration",
    isDefault: true, color: "#7c3aed", userCount: 1,
    permissions: {
      Tickets: makeAllPerms(true), Contacts: makeAllPerms(true), Reports: makeAllPerms(true),
      "Knowledge Base": makeAllPerms(true), Settings: makeAllPerms(true),
    },
  },
  {
    id: "role-2", name: "Field Engineer", description: "Handles assigned tickets and updates knowledge base articles",
    isDefault: true, color: "#10b981", userCount: 5,
    permissions: makeRolePerms({
      Tickets:          { view: true, create: true, edit: true, delete: false, export: false },
      Contacts:         { view: true },
      Reports:          { view: true },
      "Knowledge Base": { view: true, create: true, edit: true },
    }),
  },
  {
    id: "role-3", name: "Client", description: "Submit and track support tickets. Read-only access to the knowledge base",
    isDefault: true, color: "#f59e0b", userCount: 5,
    permissions: makeRolePerms({
      Tickets:          { view: true, create: true },
      "Knowledge Base": { view: true },
    }),
  },
];

const INITIAL_INVITATIONS: InvitationRecord[] = [
  {
    id: "inv-1", email: "hana.t@ienetworks.co", name: "Hana Tadesse",
    invitedBy: "Abraham Tayu", invitedAt: "2026-06-04", expiresAt: "2026-06-18",
    status: "Pending", roles: ["Field Engineer"], source: "internal",
  },
  {
    id: "inv-2", email: "vendor@partnerco.com",
    invitedBy: "Abraham Tayu", invitedAt: "2026-06-02", expiresAt: "2026-06-16",
    status: "Pending", roles: ["Client"], source: "external",
  },
  {
    id: "inv-3", email: "bereket@ienetworks.co", name: "Bereket Alemu",
    invitedBy: "Abraham Tayu", invitedAt: "2026-05-20", expiresAt: "2026-06-03",
    status: "Accepted", roles: ["Field Engineer"], source: "internal",
  },
  {
    id: "inv-4", email: "tigist.h@ienetworks.co", name: "Tigist Hailu",
    invitedBy: "Abraham Tayu", invitedAt: "2026-05-10", expiresAt: "2026-05-24",
    status: "Expired", roles: ["Field Engineer"], source: "internal",
  },
];

const CROSS_PRODUCT_INVITATIONS: CrossProductInvitation[] = [
  {
    id: "cp-1", fromProduct: "Selamnew CRM", fromProductColor: "#6366f1",
    fromUser: "Sara Mulugeta", fromUserInitials: "SM", fromOrg: "IE Networks",
    role: "CRM Viewer", invitedAt: "2026-06-07", status: "Pending",
    description: "Join the CRM workspace to view customer accounts linked to your support tickets.",
  },
  {
    id: "cp-2", fromProduct: "IE HR System", fromProductColor: "#f59e0b",
    fromUser: "HR Administrator", fromUserInitials: "HR", fromOrg: "IE Networks",
    role: "Employee Directory Viewer", invitedAt: "2026-06-05", status: "Pending",
    description: "Access the HR employee directory to look up user contact details for ticket assignment.",
  },
  {
    id: "cp-3", fromProduct: "Selamnew Finance", fromProductColor: "#10b981",
    fromUser: "Amanuel Bekele", fromUserInitials: "AB", fromOrg: "IE Networks",
    role: "Billing Reviewer", invitedAt: "2026-06-01", status: "Accepted",
    description: "Review SLA billing summaries and cost reports from the Finance module.",
  },
  {
    id: "cp-4", fromProduct: "Selamnew Operations", fromProductColor: "#0D9488",
    fromUser: "Operations Admin", fromUserInitials: "OA", fromOrg: "IE Networks Logistics",
    role: "Ops Viewer", invitedAt: "2026-05-28", status: "Declined",
    description: "Cross-department operational visibility for shared infrastructure projects.",
  },
];

// ─── DetailField ──────────────────────────────────────────────────────────────

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-normal text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm text-foreground">{value || "—"}</div>
    </div>
  );
}

// ─── User Detail Page ─────────────────────────────────────────────────────────

function UserDetailPage({
  user,
  onBack,
  onRemove,
  onUpdateUser,
  roleDefinitions,
}: {
  user: UserRecord;
  onBack: () => void;
  onRemove: () => void;
  onUpdateUser: (next: UserRecord) => void;
  roleDefinitions: SDRole[];
}) {
  const role = user.roles[0];
  const [editingCard, setEditingCard] = useState<"roles" | null>(null);
  const [draft, setDraft] = useState<UserRecord>(user);

  const initialPermissions = (roleName: string | undefined): RolePermissions => {
    const found = roleName ? roleDefinitions.find((r) => r.name === roleName) : undefined;
    if (found) return JSON.parse(JSON.stringify(found.permissions)) as RolePermissions;
    return Object.fromEntries(ALL_MODULES.map((m) => [m, makeAllPerms(false)])) as RolePermissions;
  };

  const [draftPermissions, setDraftPermissions] = useState<RolePermissions>(() => initialPermissions(role));

  useEffect(() => {
    if (editingCard === null) setDraft(user);
  }, [user, editingCard]);

  const startEditRoles = () => {
    setDraft(user);
    setDraftPermissions(initialPermissions(user.roles[0]));
    setEditingCard("roles");
  };
  const cancelEdit = () => { setEditingCard(null); setDraft(user); };
  const saveEdit = () => { onUpdateUser(draft); setEditingCard(null); };
  const toggleDraftPerm = (mod: ModuleKey, action: ActionKey) => {
    setDraftPermissions((prev) => ({
      ...prev,
      [mod]: { ...prev[mod], [action]: !prev[mod][action] },
    }));
  };

  const detailRoleOptions = useMemo(() => {
    const current = draft.roles[0];
    if (!current || roleDefinitions.some((r) => r.name === current)) return roleDefinitions;
    return [
      ...roleDefinitions,
      { id: "__legacy__", name: current, description: "", isDefault: false, color: "#94a3b8", userCount: 0, permissions: Object.fromEntries(ALL_MODULES.map((m) => [m, makeAllPerms(false)])) as RolePermissions },
    ];
  }, [roleDefinitions, draft.roles]);

  const [avatarOpen, setAvatarOpen] = useState(false);
  const [draggedOver, setDraggedOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const resetAvatar = () => { setSelectedFile(null); setDraggedOver(false); if (fileRef.current) fileRef.current.value = ""; };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={onBack} aria-label="Back to users list">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <p className="text-base font-semibold">User detail</p>
        </div>
        <Button
          variant="outline" size="sm"
          className="h-8 border-destructive/40 text-destructive hover:bg-transparent hover:text-destructive"
          onClick={onRemove}
        >
          Remove
        </Button>
      </div>

      {/* Hero card */}
      <section className="rounded-xl border border-border bg-background p-5">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 flex-1 flex-wrap items-start gap-4">
            <div className="relative">
              <Avatar className="h-11 w-11">
                <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                aria-label="Change profile image"
                onClick={() => setAvatarOpen(true)}
                className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card text-primary shadow-sm transition-colors hover:bg-primary hover:text-white focus-visible:outline-none"
              >
                <Pencil className="h-2.5 w-2.5" />
              </button>
            </div>
            <div className="flex-1 min-w-0 space-y-0.5 pt-0.5">
              <h2 className="text-base font-semibold leading-tight text-foreground">{user.name}</h2>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex h-6 cursor-pointer items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-medium transition-opacity hover:opacity-90",
                  statusColor(user.status),
                )}
              >
                {user.status}
                <ChevronDown className="size-3 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem className="text-xs" onClick={() => onUpdateUser({ ...user, status: "Active" })}>Active</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs" onClick={() => onUpdateUser({ ...user, status: "Inactive" })}>Inactive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator className="my-5" />

        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
          <div>
            <p className="text-[11px] font-normal text-muted-foreground">Joined at</p>
            <p className="mt-1 text-sm text-foreground">{formatJoinDate(user.dateJoined)}</p>
          </div>
          <div>
            <p className="text-[11px] font-normal text-muted-foreground">Role</p>
            <p className="mt-1 text-sm text-foreground">{role ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] font-normal text-muted-foreground">Branch</p>
            <p className="mt-1 text-sm text-foreground">{user.branch || "—"}</p>
          </div>
        </div>
      </section>

      {/* Info cards grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Personal Info */}
        <section className="rounded-xl border border-border bg-background p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Personal Information</h3>
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <DetailField label="Name" value={user.name} />
            <DetailField label="Email" value={user.email} />
            <DetailField label="Phone" value={user.phone} />
            <DetailField label="Job Title" value={user.jobTitle} />
          </div>
        </section>

        {/* Organization */}
        <section className="rounded-xl border border-border bg-background p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Organization</h3>
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <DetailField label="Branch" value={user.branch} />
            <DetailField label="Department" value={user.department} />
            <DetailField label="Division" value={user.division} />
            <DetailField label="Last Login" value={user.lastLogin} />
          </div>
        </section>

        {/* Role & Permission */}
        <section className="rounded-xl border border-border bg-background p-5 md:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-foreground">Role &amp; Permission</h3>
            {editingCard === "roles" ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={cancelEdit}>Cancel</Button>
                <Button size="sm" className="h-7 text-xs" onClick={saveEdit}>Save</Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5" onClick={startEditRoles}>
                <Edit className="h-3 w-3" /> Edit
              </Button>
            )}
          </div>

          {editingCard === "roles" ? (
            <div className="space-y-4">
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Each user can have only one role. Select a role to update this user&apos;s permissions.
              </p>
              <div className="flex flex-wrap gap-2">
                {detailRoleOptions.map((rec) => {
                  const checked = draft.roles[0] === rec.name;
                  return (
                    <label
                      key={rec.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors",
                        checked ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40",
                      )}
                    >
                      <input
                        type="radio" name="detail-role" className="sr-only" checked={checked}
                        onChange={() => {
                          setDraft({ ...draft, roles: [rec.name] });
                          setDraftPermissions(initialPermissions(rec.name));
                        }}
                      />
                      <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors", checked ? "border-primary bg-primary" : "border-muted-foreground/35 bg-transparent")} aria-hidden>
                        {checked ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                      </span>
                      <span className={cn("font-medium", checked ? "text-foreground" : "text-muted-foreground")}>{rec.name}</span>
                    </label>
                  );
                })}
              </div>
              {draft.roles[0] && (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-foreground">Permissions</p>
                  <div className="overflow-x-auto rounded-lg border border-border bg-muted/10">
                    <table className="w-full text-xs">
                      <thead className="border-b border-border bg-muted/30">
                        <tr>
                          <th className="w-40 px-3 py-2.5 text-left font-medium text-muted-foreground">Module</th>
                          {ALL_ACTIONS.map((a) => (
                            <th key={a} className="px-2 py-2.5 text-center font-medium capitalize text-muted-foreground">{a}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {ALL_MODULES.map((mod) => {
                          const perms = draftPermissions[mod];
                          return (
                            <tr key={mod}>
                              <td className="px-3 py-2.5 font-medium text-foreground">{mod}</td>
                              {ALL_ACTIONS.map((action) => (
                                <td key={action} className="px-2 py-2.5 text-center">
                                  <div className="flex justify-center">
                                    <Checkbox
                                      checked={perms[action]}
                                      onCheckedChange={() => toggleDraftPerm(mod, action)}
                                      className="h-4 w-4"
                                    />
                                  </div>
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : role ? (
            <div className="space-y-2">
              <Badge className={cn("text-[10px] hover:opacity-100", roleColor(role))}>{role}</Badge>
              <p className="text-[11px] text-muted-foreground">
                Each user can have only one role. Use the edit action to change this user&apos;s role and permissions.
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No role assigned.</p>
          )}
        </section>
      </div>

      {/* Avatar dialog */}
      <Dialog open={avatarOpen} onOpenChange={(o) => { setAvatarOpen(o); if (!o) resetAvatar(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Change Profile Image</DialogTitle></DialogHeader>
          <div
            role="button" tabIndex={0}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileRef.current?.click(); } }}
            onDragOver={(e) => { e.preventDefault(); setDraggedOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDraggedOver(false); }}
            onDrop={(e) => { e.preventDefault(); setDraggedOver(false); const f = e.dataTransfer.files?.[0]; if (f?.type.startsWith("image/")) setSelectedFile(f); }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
              draggedOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30",
            )}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setSelectedFile(f); }} />
            <Inbox className="h-10 w-10 text-primary" />
            <p className="text-sm font-medium text-foreground">
              {selectedFile ? selectedFile.name : "Drag and drop your image here or click to upload."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { resetAvatar(); setAvatarOpen(false); }}>Cancel</Button>
            <Button size="sm" disabled={!selectedFile} onClick={() => { resetAvatar(); setAvatarOpen(false); }}>Change</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Users Screen ─────────────────────────────────────────────────────────────

function UsersScreen({
  users,
  setUsers,
  teams,
  roles,
  viewingUserId,
  setViewingUserId,
}: {
  users: UserRecord[];
  setUsers: React.Dispatch<React.SetStateAction<UserRecord[]>>;
  teams: TeamRecord[];
  roles: SDRole[];
  viewingUserId: string | null;
  setViewingUserId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [addOpen, setAddOpen] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [selectedPoolUser, setSelectedPoolUser] = useState<string | null>(null);
  const [addRole, setAddRole] = useState<string>(roles.find((r) => r.name === "Field Engineer")?.name ?? roles[0]?.name ?? "");
  const [comboOpen, setComboOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const viewingUser = useMemo(() => (viewingUserId ? users.find((u) => u.id === viewingUserId) ?? null : null), [users, viewingUserId]);

  const existingIds = useMemo(() => new Set(users.map((u) => u.id)), [users]);
  const poolCandidates = useMemo(
    () => SD_USER_POOL.filter((u) => !existingIds.has(u.id) && (u.name.toLowerCase().includes(addSearch.toLowerCase()) || u.email.toLowerCase().includes(addSearch.toLowerCase()))),
    [existingIds, addSearch],
  );

  const looksLikeEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const canAdd = !!selectedPoolUser || looksLikeEmail(addSearch);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all" && !u.roles.includes(roleFilter)) return false;
      if (statusFilter && statusFilter !== "all" && u.status !== statusFilter) return false;
      const q = search.toLowerCase();
      return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.jobTitle.toLowerCase().includes(q);
    });
  }, [users, roleFilter, statusFilter, search]);

  useEffect(() => { setPage(1); }, [search, roleFilter, statusFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(() => filtered.slice((safePage - 1) * pageSize, safePage * pageSize), [filtered, safePage, pageSize]);

  function handleAddUser() {
    let newUser: UserRecord | null = null;
    if (selectedPoolUser) {
      const pool = SD_USER_POOL.find((u) => u.id === selectedPoolUser);
      if (!pool) return;
      newUser = { ...pool, status: "Invited", lastLogin: "—", dateJoined: new Date().toISOString().slice(0, 10), roles: [addRole], teamIds: [] };
    } else if (looksLikeEmail(addSearch)) {
      const email = addSearch.trim();
      const localPart = email.split("@")[0] ?? "";
      const derivedName = localPart.split(/[._-]+/).filter(Boolean).map((p) => p[0]!.toUpperCase() + p.slice(1)).join(" ") || "Invited User";
      newUser = {
        id: `inv-${Date.now()}`, name: derivedName, email,
        phone: "", jobTitle: "—", branch: "", department: "—", division: "",
        status: "Invited", lastLogin: "—", dateJoined: new Date().toISOString().slice(0, 10),
        roles: [addRole], teamIds: [],
      };
    }
    if (!newUser) return;
    setUsers((prev) => [newUser!, ...prev]);
    setAddOpen(false); setSelectedPoolUser(null); setAddSearch(""); setComboOpen(false);
    setAddRole(roles.find((r) => r.name === "Field Engineer")?.name ?? roles[0]?.name ?? "");
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const wasViewing = viewingUserId === deleteTarget.id;
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setDeleteTarget(null);
    if (wasViewing) setViewingUserId(null);
  }

  if (viewingUser) {
    return (
      <UserDetailPage
        user={viewingUser}
        roleDefinitions={roles}
        onBack={() => setViewingUserId(null)}
        onRemove={() => { setDeleteTarget(viewingUser); setViewingUserId(null); }}
        onUpdateUser={(next) => setUsers((prev) => prev.map((u) => (u.id === next.id ? next : u)))}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">Team Members</h2>
          <Button size="sm" className="h-9 gap-1.5" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add User
          </Button>
        </div>
        <div className="flex min-h-9 flex-wrap items-center justify-between gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-2.5 left-3 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className="h-9 w-56 pl-8 text-xs shadow-none" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-9 w-40 text-xs shadow-none"><SelectValue placeholder="All roles" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All roles</SelectItem>
                {roles.map((r) => <SelectItem key={r.id} value={r.name} className="text-xs">{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-32 text-xs shadow-none"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All</SelectItem>
                <SelectItem value="Active" className="text-xs">Active</SelectItem>
                <SelectItem value="Inactive" className="text-xs">Inactive</SelectItem>
                <SelectItem value="Invited" className="text-xs">Invited</SelectItem>
                <SelectItem value="Pending" className="text-xs">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Users", value: users.length, icon: Users },
          { label: "Active",      value: users.filter((u) => u.status === "Active").length,   icon: UserCheck },
          { label: "Invited",     value: users.filter((u) => u.status === "Invited").length,  icon: Mail },
          { label: "Inactive",    value: users.filter((u) => u.status === "Inactive").length, icon: UserX },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-border shadow-none hover:bg-muted/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xl font-semibold tabular-nums leading-tight">{value}</p>
                <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              </div>
              <p className="text-xs font-medium text-muted-foreground leading-snug">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-background">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-xs">User</TableHead>
              <TableHead className="text-xs">Job Title</TableHead>
              <TableHead className="text-xs">Department</TableHead>
              <TableHead className="text-xs">Role</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Last Login</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-xs text-muted-foreground">No users match the current filter.</TableCell>
              </TableRow>
            )}
            {paged.map((user) => (
              <TableRow key={user.id} className="group cursor-pointer" onClick={() => setViewingUserId(user.id)}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className={cn(avatarColor(user.name), "text-[10px] font-semibold text-white")}>{initials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-xs font-medium leading-tight">{user.name}</div>
                      <div className="text-[10px] text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{user.jobTitle}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{user.department}</TableCell>
                <TableCell>
                  {user.roles[0] && (
                    <Badge className={cn("text-[10px] hover:opacity-100", roleColor(user.roles[0]))}>{user.roles[0]}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={cn("text-[10px] hover:opacity-100", statusColor(user.status))}>{user.status}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">{user.lastLogin}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem className="text-xs gap-2" onClick={() => setViewingUserId(user.id)}>
                        <User className="h-3.5 w-3.5" /> View Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.status === "Active" ? (
                        <DropdownMenuItem className="text-xs gap-2" onClick={() => setUsers((p) => p.map((u) => u.id === user.id ? { ...u, status: "Inactive" } : u))}>
                          <UserX className="h-3.5 w-3.5" /> Deactivate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="text-xs gap-2" onClick={() => setUsers((p) => p.map((u) => u.id === user.id ? { ...u, status: "Active" } : u))}>
                          <UserCheck className="h-3.5 w-3.5" /> Activate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-xs gap-2 text-destructive focus:text-destructive" onClick={() => setDeleteTarget(user)}>
                        <Trash2 className="h-3.5 w-3.5" /> Remove User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="h-7 w-16 text-xs shadow-none"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[10, 25, 50].map((n) => <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <span>{(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={safePage === 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={safePage === totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add User dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) { setSelectedPoolUser(null); setAddSearch(""); setComboOpen(false); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add User</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium">Employee <span className="text-destructive">*</span></label>
              <div
                className="relative"
                onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) window.setTimeout(() => setComboOpen(false), 120); }}
              >
                <Input
                  value={addSearch}
                  placeholder="Search or type an email to invite"
                  className="h-9 pr-8 text-xs shadow-none"
                  onFocus={() => setComboOpen(true)}
                  onClick={() => setComboOpen(true)}
                  onChange={(e) => { setAddSearch(e.target.value); setSelectedPoolUser(null); setComboOpen(true); }}
                />
                <Search className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                {comboOpen && (
                  <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md">
                    {poolCandidates.length === 0 ? (
                      <div className="px-2 py-2 text-xs text-muted-foreground">
                        {looksLikeEmail(addSearch) ? `Press "Add User" to invite ${addSearch.trim()}.` : "No matching users. Type an email to invite."}
                      </div>
                    ) : poolCandidates.map((u) => (
                      <button
                        key={u.id} type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { setSelectedPoolUser(u.id); setAddSearch(u.name); setComboOpen(false); }}
                        className={cn("flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted/50", selectedPoolUser === u.id && "bg-primary/10 ring-1 ring-primary/30")}
                      >
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className={cn(avatarColor(u.name), "text-[10px] font-semibold text-white")}>{initials(u.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="text-xs font-medium leading-tight">{u.name}</div>
                          <div className="text-[10px] text-muted-foreground">{u.email} · {u.department}</div>
                        </div>
                        {selectedPoolUser === u.id && <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">Pick a team member or type an email address to invite a new user.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium">Assign Role</label>
              <Select value={addRole} onValueChange={setAddRole}>
                <SelectTrigger className="h-9 w-full text-xs shadow-none"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map((r) => <SelectItem key={r.id} value={r.name} className="text-xs">{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button size="sm" disabled={!canAdd} onClick={handleAddUser}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      {deleteTarget && (
        <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-sm">Remove user</DialogTitle></DialogHeader>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to remove <span className="font-medium text-foreground">{deleteTarget.name}</span>? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>Remove</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Invite Users Screen ──────────────────────────────────────────────────────

function InviteUsersScreen({ users, roles }: { users: UserRecord[]; roles: SDRole[] }) {
  const defaultRole = useMemo(() => roles.find((r) => r.name === "Field Engineer")?.name ?? roles[0]?.name ?? "", [roles]);

  const [inviteTab, setInviteTab] = useState<"internal" | "external">("internal");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [role, setRole] = useState(defaultRole);
  const [sent, setSent] = useState(false);

  const [extMode, setExtMode] = useState<"email" | "csv" | "outside">("email");
  const [extEmail, setExtEmail] = useState("");
  const [extName, setExtName] = useState("");
  const [extNote, setExtNote] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [extSent, setExtSent] = useState(false);

  const existingIds = useMemo(() => new Set(users.map((u) => u.id)), [users]);
  const candidates = useMemo(
    () => SD_USER_POOL.filter((u) => !existingIds.has(u.id) && (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))),
    [existingIds, search],
  );

  function toggleId(id: string) {
    setSelectedIds((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  function handleInternalInvite() {
    setSent(true);
    setTimeout(() => { setSent(false); setSelectedIds(new Set()); }, 3000);
  }

  function handleExternalInvite() {
    setExtSent(true);
    setTimeout(() => { setExtSent(false); setExtEmail(""); setExtName(""); setExtNote(""); setCsvFile(null); }, 3000);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Invite Users</h2>
        <p className="mt-1 text-xs text-muted-foreground">Add people to this Service Desk workspace by finding existing team members or inviting from outside.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { key: "internal", icon: UserCheck, title: "From IE Networks", desc: "Search existing IE Networks team members" },
          { key: "external", icon: Globe,     title: "External Invite",  desc: "Invite by email, CSV, or outside your org" },
        ].map((opt) => (
          <button
            key={opt.key} type="button"
            onClick={() => setInviteTab(opt.key as "internal" | "external")}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
              inviteTab === opt.key ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:border-primary/30 hover:bg-muted/30",
            )}
          >
            <div className={cn("rounded-lg p-2", inviteTab === opt.key ? "bg-primary/20" : "bg-muted")}>
              <opt.icon className={cn("h-4 w-4", inviteTab === opt.key ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div>
              <div className="text-sm font-medium">{opt.title}</div>
              <div className="text-[11px] text-muted-foreground">{opt.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {inviteTab === "internal" && (
        <Card className="border-border shadow-none">
          <CardContent className="space-y-3 pt-4">
            <div className="relative">
              <Search className="pointer-events-none absolute top-2.5 left-3 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search IE Networks team members…" className="h-9 pl-8 text-xs shadow-none" />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1 rounded-lg border border-border p-1">
              {candidates.length === 0 && (
                <div className="py-6 text-center text-xs text-muted-foreground">All available team members are already in this workspace.</div>
              )}
              {candidates.map((u) => (
                <div
                  key={u.id} role="button" tabIndex={0}
                  onClick={() => toggleId(u.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleId(u.id); } }}
                  className={cn("flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left outline-none transition-colors hover:bg-muted/50", selectedIds.has(u.id) && "bg-primary/5")}
                >
                  <span className="inline-flex shrink-0 items-center" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={selectedIds.has(u.id)} onCheckedChange={() => toggleId(u.id)} />
                  </span>
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className={cn(avatarColor(u.name), "text-[10px] font-semibold text-white")}>{initials(u.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-xs font-medium">{u.name}</div>
                    <div className="text-[10px] text-muted-foreground">{u.email} · {u.department}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium">Assign Role</label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-9 text-xs shadow-none"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => <SelectItem key={r.id} value={r.name} className="text-xs">{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="h-9 gap-1.5" disabled={selectedIds.size === 0} onClick={handleInternalInvite}>
                {sent ? <><Check className="h-3.5 w-3.5" /> Sent!</> : <><Mail className="h-3.5 w-3.5" /> Send Invite ({selectedIds.size})</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {inviteTab === "external" && (
        <Card className="border-border shadow-none">
          <CardContent className="space-y-4 pt-4">
            <div className="flex gap-2">
              {[
                { key: "email",   label: "Email Invite", icon: Mail },
                { key: "csv",     label: "Bulk CSV",     icon: Upload },
                { key: "outside", label: "Outside Org",  icon: Globe },
              ].map((m) => (
                <button
                  key={m.key} type="button"
                  onClick={() => setExtMode(m.key as typeof extMode)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    extMode === m.key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30",
                  )}
                >
                  <m.icon className="h-3.5 w-3.5" /> {m.label}
                </button>
              ))}
            </div>

            {extMode === "email" && (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">Full Name <span className="text-muted-foreground">(optional)</span></label>
                  <Input value={extName} onChange={(e) => setExtName(e.target.value)} placeholder="Jane Smith" className="h-9 text-xs shadow-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Email Address</label>
                  <Input type="email" value={extEmail} onChange={(e) => setExtEmail(e.target.value)} placeholder="user@company.com" className="h-9 text-xs shadow-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Assign Role</label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="h-9 text-xs shadow-none"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => <SelectItem key={r.id} value={r.name} className="text-xs">{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Personal Note <span className="text-muted-foreground">(optional)</span></label>
                  <Textarea value={extNote} onChange={(e) => setExtNote(e.target.value)} placeholder="Add a note to include in the invitation email…" className="text-xs shadow-none resize-none" rows={2} />
                </div>
              </div>
            )}

            {extMode === "csv" && (
              <div className="space-y-3">
                <div className="rounded-xl border-2 border-dashed border-border p-6 text-center">
                  <Upload className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground">Drop a CSV file here or click to browse</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">Columns: name, email, role</p>
                  <input type="file" accept=".csv" className="hidden" id="csv-upload" onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)} />
                  <label htmlFor="csv-upload">
                    <Button variant="outline" size="sm" className="mt-3 text-xs" asChild><span>Browse File</span></Button>
                  </label>
                  {csvFile && <div className="mt-2 text-xs text-primary font-medium">{csvFile.name}</div>}
                </div>
                <a href="#" className="flex items-center gap-1 text-[11px] text-primary hover:underline" onClick={(e) => e.preventDefault()}>
                  <Download className="h-3 w-3" /> Download CSV template
                </a>
              </div>
            )}

            {extMode === "outside" && (
              <div className="space-y-3">
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                  <p className="text-[11px] text-amber-700">External users (vendors, contractors) will get limited <strong>Client</strong> access by default. A manual role review is required after they join.</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Email Address</label>
                  <Input type="email" value={extEmail} onChange={(e) => setExtEmail(e.target.value)} placeholder="vendor@partnercompany.com" className="h-9 text-xs shadow-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Company / Organization</label>
                  <Input placeholder="e.g. ABC Solutions Ltd." className="h-9 text-xs shadow-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Reason for Access</label>
                  <Textarea value={extNote} onChange={(e) => setExtNote(e.target.value)} placeholder="Briefly describe why this person needs access…" className="text-xs shadow-none resize-none" rows={2} />
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button size="sm" className="h-9 gap-1.5" disabled={extMode === "email" && !extEmail} onClick={handleExternalInvite}>
                {extSent ? <><Check className="h-3.5 w-3.5" /> Invitation Sent!</> : <><Mail className="h-3.5 w-3.5" /> Send Invitation</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Teams Screen ─────────────────────────────────────────────────────────────

function TeamsScreen({
  users, teams, setTeams,
}: {
  users: UserRecord[];
  teams: TeamRecord[];
  setTeams: React.Dispatch<React.SetStateAction<TeamRecord[]>>;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addMemberTeamId, setAddMemberTeamId] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [newTeam, setNewTeam] = useState({ name: "", description: "", function: "" });

  const getUserById = (id: string) => users.find((u) => u.id === id);
  const selectedTeam = teams.find((t) => t.id === selectedTeamId);
  const addMemberTeam = teams.find((t) => t.id === addMemberTeamId);
  const memberCandidates = users.filter((u) => {
    if (!addMemberTeam) return false;
    if (addMemberTeam.members.some((m) => m.userId === u.id)) return false;
    const q = memberSearch.toLowerCase();
    return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  function handleCreateTeam() {
    if (!newTeam.name.trim()) return;
    setTeams((prev) => [...prev, { id: uid(), name: newTeam.name.trim(), description: newTeam.description.trim(), function: newTeam.function.trim(), members: [], createdAt: new Date().toISOString().slice(0, 10) }]);
    setNewTeam({ name: "", description: "", function: "" });
    setCreateOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">Teams</h2>
        <Button size="sm" className="h-9 gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Create Team
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => {
          const leader = team.members.find((m) => m.role === "Leader");
          const leaderUser = leader ? getUserById(leader.userId) : null;
          return (
            <Card
              key={team.id}
              className="cursor-pointer border-border shadow-none transition-all hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => setSelectedTeamId(team.id)}
            >
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm font-semibold">{team.name}</CardTitle>
                    <Badge className="mt-1 text-[10px] bg-primary/10 text-primary hover:opacity-100">{team.function}</Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem className="text-xs gap-2" onClick={(e) => { e.stopPropagation(); setAddMemberTeamId(team.id); setAddMemberOpen(true); }}>
                        <UserPlus className="h-3.5 w-3.5" /> Add Member
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-xs gap-2 text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); setTeams((prev) => prev.filter((t) => t.id !== team.id)); }}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-[11px] text-muted-foreground line-clamp-2">{team.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex -space-x-1.5">
                    {team.members.slice(0, 4).map((m) => {
                      const u = getUserById(m.userId);
                      return u ? (
                        <Avatar key={m.userId} className="h-6 w-6 ring-2 ring-background">
                          <AvatarFallback className={cn("text-[9px] font-semibold", m.role === "Leader" ? "bg-primary text-white" : "bg-primary/15 text-primary")}>{initials(u.name)}</AvatarFallback>
                        </Avatar>
                      ) : null;
                    })}
                    {team.members.length > 4 && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[9px] font-medium ring-2 ring-background">+{team.members.length - 4}</div>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{team.members.length} member{team.members.length !== 1 ? "s" : ""}</span>
                </div>
                {leaderUser && (
                  <div className="mt-2 flex items-center gap-1.5 border-t border-border/50 pt-2">
                    <Crown className="h-3 w-3 text-amber-500" />
                    <span className="text-[10px] text-muted-foreground">{leaderUser.name}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {teams.length === 0 && (
          <div className="col-span-full py-16 text-center text-xs text-muted-foreground">No teams yet. Create one to get started.</div>
        )}
      </div>

      {/* Team detail dialog */}
      {selectedTeam && (
        <Dialog open={!!selectedTeamId} onOpenChange={() => setSelectedTeamId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-sm">
                {selectedTeam.name}
                <Badge className="text-[10px] bg-primary/10 text-primary hover:opacity-100">{selectedTeam.function}</Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {selectedTeam.members.length === 0 && <p className="py-4 text-center text-xs text-muted-foreground">No members yet.</p>}
              {selectedTeam.members.map((m) => {
                const u = getUserById(m.userId);
                if (!u) return null;
                return (
                  <div key={m.userId} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className={cn("text-[10px] font-semibold", m.role === "Leader" ? "bg-primary text-white" : "bg-primary/15 text-primary")}>{initials(u.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium">{u.name}</div>
                      <div className="text-[10px] text-muted-foreground">{u.jobTitle}</div>
                    </div>
                    {m.role === "Leader" && <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0"><MoreVertical className="h-3 w-3" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        {m.role !== "Leader" && (
                          <DropdownMenuItem className="text-xs gap-2" onClick={() => setTeams((prev) => prev.map((t) => t.id !== selectedTeam.id ? t : { ...t, members: t.members.map((mb) => ({ ...mb, role: mb.userId === m.userId ? "Leader" : "Member" })) }))}>
                            <Crown className="h-3.5 w-3.5 text-amber-500" /> Set as Leader
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-xs gap-2 text-destructive focus:text-destructive" onClick={() => setTeams((prev) => prev.map((t) => t.id !== selectedTeam.id ? t : { ...t, members: t.members.filter((mb) => mb.userId !== m.userId) }))}>
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => { setAddMemberTeamId(selectedTeam.id); setAddMemberOpen(true); }}>
                <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Add Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add member dialog */}
      <Dialog open={addMemberOpen} onOpenChange={(o) => { setAddMemberOpen(o); if (!o) setMemberSearch(""); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-sm">Add Member to {addMemberTeam?.name}</DialogTitle></DialogHeader>
          <div className="relative">
            <Search className="pointer-events-none absolute top-2.5 left-3 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} placeholder="Search users…" className="h-9 pl-8 text-xs shadow-none" />
          </div>
          <div className="max-h-52 overflow-y-auto space-y-1 rounded-lg border border-border p-1">
            {memberCandidates.length === 0 && <div className="py-5 text-center text-xs text-muted-foreground">All users are already in this team.</div>}
            {memberCandidates.map((u) => (
              <button
                key={u.id} type="button"
                onClick={() => { setTeams((prev) => prev.map((t) => t.id !== addMemberTeamId ? t : { ...t, members: [...t.members, { userId: u.id, role: "Member" }] })); setAddMemberOpen(false); setMemberSearch(""); }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className={cn(avatarColor(u.name), "text-[10px] font-semibold text-white")}>{initials(u.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-[10px] text-muted-foreground">{u.department}</div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create team dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-primary" /> New Team</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Team Name</label>
              <Input value={newTeam.name} onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })} placeholder="e.g. Support Team" className="h-9 text-xs shadow-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Function</label>
              <Select value={newTeam.function} onValueChange={(v) => setNewTeam({ ...newTeam, function: v })}>
                <SelectTrigger className="h-9 text-xs shadow-none"><SelectValue placeholder="Select function" /></SelectTrigger>
                <SelectContent>
                  {["Support", "Field Ops", "NOC", "Sales", "Operations", "Management", "Other"].map((f) => (
                    <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Description</label>
              <Textarea value={newTeam.description} onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })} placeholder="Team purpose…" className="text-xs shadow-none resize-none" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" disabled={!newTeam.name.trim()} onClick={handleCreateTeam}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Roles & Permissions Screen ───────────────────────────────────────────────

function RolesPermissionsScreen({
  users, roles, setRoles,
}: {
  users: UserRecord[];
  roles: SDRole[];
  setRoles: React.Dispatch<React.SetStateAction<SDRole[]>>;
}) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id ?? "");
  const [createOpen, setCreateOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newPerms, setNewPerms] = useState<RolePermissions>(() => Object.fromEntries(ALL_MODULES.map((m) => [m, makeAllPerms(false)])) as RolePermissions);

  useEffect(() => {
    if (!createOpen) return;
    setNewRoleName(""); setNewRoleDesc("");
    setNewPerms(Object.fromEntries(ALL_MODULES.map((m) => [m, makeAllPerms(false)])) as RolePermissions);
  }, [createOpen]);

  useEffect(() => {
    if (roles.length === 0) return;
    if (!selectedRoleId || !roles.some((r) => r.id === selectedRoleId)) setSelectedRoleId(roles[0]!.id);
  }, [roles, selectedRoleId]);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? roles[0];

  const userCountByRole = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const u of users) for (const r of u.roles) counts[r] = (counts[r] ?? 0) + 1;
    return counts;
  }, [users]);

  function togglePerm(mod: ModuleKey, action: ActionKey) {
    setRoles((prev) => prev.map((r) => r.id !== selectedRoleId ? r : {
      ...r, permissions: { ...r.permissions, [mod]: { ...r.permissions[mod], [action]: !r.permissions[mod][action] } },
    }));
  }

  function handleCreateRole() {
    if (!newRoleName.trim()) return;
    const newRole: SDRole = {
      id: uid(), name: newRoleName.trim(), description: newRoleDesc.trim(),
      isDefault: false, color: "#94a3b8", userCount: 0, permissions: newPerms,
    };
    setRoles((prev) => [...prev, newRole]);
    setSelectedRoleId(newRole.id);
    setCreateOpen(false);
  }

  if (!selectedRole) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">Roles &amp; Permissions</h2>
        <Button size="sm" className="h-9 gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Create Role
        </Button>
      </div>

      <div className="grid grid-cols-[220px_1fr] gap-4">
        {/* Role list */}
        <div className="space-y-1.5">
          {roles.map((role) => (
            <button
              key={role.id} type="button"
              onClick={() => setSelectedRoleId(role.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
                selectedRoleId === role.id ? "border-primary/40 bg-primary/5 shadow-sm" : "border-border hover:border-primary/20 hover:bg-muted/40",
              )}
            >
              <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: role.color }} />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold leading-tight">{role.name}</div>
                <div className="text-[10px] text-muted-foreground">{userCountByRole[role.name] ?? role.userCount} users</div>
              </div>
              {role.isDefault && <Badge className="shrink-0 text-[9px] bg-slate-100 text-slate-500 hover:opacity-100">Default</Badge>}
            </button>
          ))}
        </div>

        {/* Permission matrix */}
        <div className="rounded-xl border border-border bg-background overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedRole.color }} />
              <span className="text-sm font-semibold">{selectedRole.name}</span>
              {selectedRole.isDefault && <Badge className="text-[10px] bg-slate-100 text-slate-500 hover:opacity-100">Default</Badge>}
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{selectedRole.description}</p>
          </div>
          <div className="p-4">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="w-40 pb-2 text-left font-medium text-muted-foreground">Module</th>
                  {ALL_ACTIONS.map((a) => (
                    <th key={a} className="pb-2 text-center capitalize font-medium text-muted-foreground">{a}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ALL_MODULES.map((mod) => {
                  const Icon = MODULE_ICONS[mod];
                  const perms = selectedRole.permissions[mod];
                  return (
                    <tr key={mod} className="group">
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{mod}</span>
                        </div>
                      </td>
                      {ALL_ACTIONS.map((action) => (
                        <td key={action} className="py-2.5 text-center">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={perms[action]}
                              onCheckedChange={() => togglePerm(mod, action)}
                              disabled={selectedRole.isDefault && selectedRole.name === "Admin"}
                              className="h-4 w-4"
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {selectedRole.isDefault && selectedRole.name === "Admin" && (
            <div className="border-t border-border px-5 py-2.5">
              <p className="text-[10px] text-muted-foreground">Admin permissions cannot be modified.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create role dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="text-base font-semibold">Create Role</DialogTitle></DialogHeader>
          <div className="max-h-[min(70vh,520px)] space-y-5 overflow-y-auto py-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium">Role name</label>
                <Input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="e.g. Tier 2 Support" className="h-9 text-xs shadow-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium">Description</label>
                <Textarea value={newRoleDesc} onChange={(e) => setNewRoleDesc(e.target.value)} placeholder="Describe this role's responsibilities…" className="min-h-[72px] resize-none text-xs shadow-none" rows={3} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-foreground">Permissions</p>
              <div className="overflow-hidden rounded-lg border border-border bg-muted/10">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="w-40 px-3 py-2.5 text-left font-medium text-muted-foreground">Module</th>
                      {ALL_ACTIONS.map((a) => (
                        <th key={a} className="px-2 py-2.5 text-center font-medium capitalize text-muted-foreground">{a}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ALL_MODULES.map((mod) => (
                      <tr key={mod}>
                        <td className="px-3 py-2.5 font-medium text-foreground">{mod}</td>
                        {ALL_ACTIONS.map((action) => (
                          <td key={action} className="px-2 py-2.5 text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={newPerms[mod][action]}
                                onCheckedChange={() => setNewPerms((prev) => ({ ...prev, [mod]: { ...prev[mod], [action]: !prev[mod][action] } }))}
                                className="h-4 w-4"
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" disabled={!newRoleName.trim()} onClick={handleCreateRole}>Create role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Invitations Screen ───────────────────────────────────────────────────────

function InvitationsScreen() {
  const [invitations, setInvitations] = useState<InvitationRecord[]>(INITIAL_INVITATIONS);
  const [crossProduct, setCrossProduct] = useState<CrossProductInvitation[]>(CROSS_PRODUCT_INVITATIONS);
  const [tab, setTab] = useState<"cross-product" | "sent">("cross-product");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  function handleCrossAction(id: string, action: "Accepted" | "Declined") {
    setCrossProduct((prev) => prev.map((inv) => inv.id === id ? { ...inv, status: action } : inv));
  }

  function handleResend(id: string) {
    setInvitations((prev) => prev.map((i) => i.id === id ? { ...i, status: "Pending", expiresAt: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10) } : i));
  }

  const filteredInvitations = useMemo(
    () => invitations.filter((i) => !statusFilter || statusFilter === "all" || i.status === statusFilter),
    [invitations, statusFilter],
  );

  const pendingCrossCount = crossProduct.filter((c) => c.status === "Pending").length;

  const invStatusColor = (s: string) => {
    if (s === "Accepted") return "bg-emerald-100 text-emerald-700";
    if (s === "Declined") return "bg-red-100 text-red-600";
    if (s === "Expired")  return "bg-slate-100 text-slate-600";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground">Invitations</h2>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="h-9">
          <TabsTrigger value="cross-product" className="relative text-xs">
            From Other Products
            {pendingCrossCount > 0 && (
              <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">{pendingCrossCount}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="text-xs">Sent Invitations</TabsTrigger>
        </TabsList>

        {/* Cross-product invitations */}
        <TabsContent value="cross-product" className="mt-4">
          {crossProduct.length === 0 && (
            <div className="py-16 text-center text-xs text-muted-foreground">No invitations from other products.</div>
          )}
          <div className="space-y-3">
            {crossProduct.map((inv) => (
              <div
                key={inv.id}
                className={cn(
                  "rounded-xl border p-4 transition-all",
                  inv.status === "Pending" ? "border-primary/20 bg-primary/5 shadow-sm" : "border-border bg-muted/20",
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm" style={{ backgroundColor: inv.fromProductColor + "20", border: `1.5px solid ${inv.fromProductColor}40` }}>
                    <Package className="h-5 w-5" style={{ color: inv.fromProductColor }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{inv.fromProduct}</span>
                      <Badge className={cn("text-[10px] hover:opacity-100", invStatusColor(inv.status))}>{inv.status}</Badge>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{inv.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-4 w-4"><AvatarFallback className="bg-slate-200 text-[8px]">{inv.fromUserInitials}</AvatarFallback></Avatar>
                        <span>Invited by <span className="font-medium text-foreground">{inv.fromUser}</span></span>
                      </div>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {inv.fromOrg}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> {inv.role}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {inv.invitedAt}</span>
                    </div>
                  </div>
                  {inv.status === "Pending" && (
                    <div className="flex shrink-0 gap-2">
                      <Button size="sm" className="h-8 gap-1 text-xs" onClick={() => handleCrossAction(inv.id, "Accepted")}>
                        <Check className="h-3.5 w-3.5" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={() => handleCrossAction(inv.id, "Declined")}>
                        <X className="h-3.5 w-3.5" /> Decline
                      </Button>
                    </div>
                  )}
                  {inv.status === "Accepted" && (
                    <Badge className="shrink-0 bg-emerald-100 text-emerald-700 hover:opacity-100 text-[10px]">
                      <Check className="mr-1 h-3 w-3" /> Joined
                    </Badge>
                  )}
                  {inv.status === "Declined" && (
                    <Badge className="shrink-0 bg-slate-100 text-slate-500 hover:opacity-100 text-[10px]">Declined</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Sent invitations */}
        <TabsContent value="sent" className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-36 text-xs shadow-none"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All</SelectItem>
                <SelectItem value="Pending" className="text-xs">Pending</SelectItem>
                <SelectItem value="Accepted" className="text-xs">Accepted</SelectItem>
                <SelectItem value="Declined" className="text-xs">Declined</SelectItem>
                <SelectItem value="Expired" className="text-xs">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-xl border border-border bg-background">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs">Invitee</TableHead>
                  <TableHead className="text-xs">Roles</TableHead>
                  <TableHead className="text-xs">Source</TableHead>
                  <TableHead className="text-xs">Invited By</TableHead>
                  <TableHead className="text-xs">Sent</TableHead>
                  <TableHead className="text-xs">Expires</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvitations.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <div>
                        {inv.name && <div className="text-xs font-medium">{inv.name}</div>}
                        <div className="text-[10px] text-muted-foreground">{inv.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {inv.roles.map((r) => <Badge key={r} className={cn("text-[10px] hover:opacity-100", roleColor(r))}>{r}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[10px] hover:opacity-100", inv.source === "internal" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700")}>
                        {inv.source === "internal" ? "Internal" : "External"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{inv.invitedBy}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{inv.invitedAt}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{inv.expiresAt}</TableCell>
                    <TableCell>
                      <Badge className={cn("text-[10px] hover:opacity-100", invStatusColor(inv.status))}>{inv.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {(inv.status === "Expired" || inv.status === "Declined") && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleResend(inv.id)}>
                                <Mail className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">Resend invitation</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredInvitations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-xs text-muted-foreground">No invitations found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const ROOT_TABS = [
  { value: "users",        label: "Users" },
  // { value: "invite",       label: "Invite Users" },
  { value: "teams",        label: "Teams" },
  { value: "roles",        label: "Roles & Permissions" },
  // { value: "invitations",  label: "Invitations" },
] as const;

type RootTab = typeof ROOT_TABS[number]["value"];

export function UserManagement() {
  const [users, setUsers]   = useState<UserRecord[]>(INITIAL_USERS);
  const [teams, setTeams]   = useState<TeamRecord[]>(INITIAL_TEAMS);
  const [roles, setRoles]   = useState<SDRole[]>(INITIAL_ROLES);
  const [activeTab, setActiveTab] = useState<RootTab>("users");
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);

  const isViewingUser = !!viewingUserId && users.some((u) => u.id === viewingUserId);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab bar — hidden when viewing a user detail */}
      {!isViewingUser && (
        <div className="flex-shrink-0 border-b border-border bg-background px-5">
          <div className="flex gap-6 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {ROOT_TABS.map((t) => {
              const active = activeTab === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setActiveTab(t.value)}
                  className={cn(
                    "shrink-0 border-b-2 py-3 text-sm transition-colors whitespace-nowrap",
                    active
                      ? "border-primary font-semibold text-primary"
                      : "border-transparent font-normal text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === "users" && (
          <UsersScreen
            users={users}
            setUsers={setUsers}
            teams={teams}
            roles={roles}
            viewingUserId={viewingUserId}
            setViewingUserId={setViewingUserId}
          />
        )}
        {/* {activeTab === "invite" && !isViewingUser && (
          <InviteUsersScreen users={users} roles={roles} />
        )} */}
        {activeTab === "teams" && !isViewingUser && (
          <TeamsScreen users={users} teams={teams} setTeams={setTeams} />
        )}
        {activeTab === "roles" && !isViewingUser && (
          <RolesPermissionsScreen users={users} roles={roles} setRoles={setRoles} />
        )}
        {/* {activeTab === "invitations" && !isViewingUser && (
          <InvitationsScreen />
        )} */}
      </div>
    </div>
  );
}
