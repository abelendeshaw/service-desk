import { useMemo } from "react";
import { useNavigate } from "react-router";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  Ticket, CheckCircle2, Clock, BookOpen, ChevronRight, Plus,
  TrendingUp, TrendingDown, ArrowUpRight, Star,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../components/ui/card";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "../components/ui/chart";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import { useAuth } from "../store/authStore";
import { useServiceDesk } from "../store/serviceDeskStore";

const activityTrendData = [
  { month: "Jan", submitted: 3, resolved: 2 },
  { month: "Feb", submitted: 5, resolved: 4 },
  { month: "Mar", submitted: 4, resolved: 5 },
  { month: "Apr", submitted: 6, resolved: 4 },
  { month: "May", submitted: 8, resolved: 6 },
  { month: "Jun", submitted: 5, resolved: 7 },
];

const trendChartConfig = {
  submitted: { label: "Submitted", color: "#7c3aed" },
  resolved: { label: "Resolved", color: "#059669" },
} satisfies ChartConfig;

const statusConfig: Record<string, { dot: string; bg: string; text: string }> = {
  Open: { dot: "#2563eb", bg: "#eff6ff", text: "#1d4ed8" },
  "In Progress": { dot: "#7c3aed", bg: "#f5f3ff", text: "#6d28d9" },
  Escalated: { dot: "#dc2626", bg: "#fef2f2", text: "#dc2626" },
  Resolved: { dot: "#059669", bg: "#f0fdf4", text: "#059669" },
  Closed: { dot: "#6c757d", bg: "#f8fafc", text: "#6c757d" },
};

const priorityConfig: Record<string, { text: string }> = {
  Critical: { text: "#dc2626" },
  High: { text: "#d97706" },
  Medium: { text: "#2563eb" },
  Low: { text: "#6c757d" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function daysSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  return days === 0 ? "Today" : days === 1 ? "1d ago" : `${days}d ago`;
}

export function ClientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tickets, clientArticles } = useServiceDesk();

  const myTickets = useMemo(
    () => tickets.filter((t) => t.project === user?.company),
    [tickets, user?.company],
  );

  const myArticles = useMemo(
    () => clientArticles.filter((a) => a.company === user?.company && a.status === "Published"),
    [clientArticles, user?.company],
  );

  const open = myTickets.filter((t) => t.status === "Open" || t.status === "In Progress");
  const escalated = myTickets.filter((t) => t.status === "Escalated");
  const resolved = myTickets.filter((t) => t.status === "Resolved" || t.status === "Closed");
  const pending = myTickets.filter((t) => t.assignedEngineerId === null && t.status === "Open");

  const recentTickets = [...myTickets]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const kpis = [
    { key: "open", label: "Open Tickets", value: open.length, change: "+2", up: true, icon: Ticket, color: "#2563eb" },
    { key: "pending", label: "Awaiting Response", value: pending.length, change: "-1", up: false, icon: Clock, color: "#d97706" },
    { key: "resolved", label: "Resolved", value: resolved.length, change: "+5", up: true, icon: CheckCircle2, color: "#059669" },
    { key: "escalated", label: "Escalated", value: escalated.length, change: escalated.length > 0 ? `+${escalated.length}` : "0", up: false, icon: ArrowUpRight, color: "#dc2626" },
  ];

  if (!user) return null;

  return (
    <div className="min-h-full space-y-5 bg-muted/30 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-[13px] font-semibold text-white">
            {user.initials}
          </div>
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">Client Portal</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Welcome back, {user.name} · {user.company}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate("/client/tickets/new")} size="sm" className="gap-1.5 bg-violet-600 text-[13px] hover:bg-violet-700">
            <Plus className="h-3.5 w-3.5" />
            Create Ticket
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.key} className="cursor-default gap-3 p-4 transition-all hover:shadow-sm">
            <div className="mb-1 flex items-start justify-between">
              <kpi.icon className="h-4 w-4" style={{ color: kpi.color }} />
              <Badge variant="outline" className={`gap-0.5 border-transparent bg-transparent p-0 text-[11px] shadow-none ${kpi.up ? "text-emerald-600" : "text-red-500"}`}>
                {kpi.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {kpi.change}
              </Badge>
            </div>
            <div className="mb-1 text-[26px] font-semibold leading-none">{kpi.value}</div>
            <div className="text-[12px] text-muted-foreground">{kpi.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2 gap-0 overflow-hidden p-0">
          <CardHeader className="flex items-center justify-between border-b">
            <div>
              <CardTitle className="text-[14px]">My Tickets</CardTitle>
              <CardDescription className="mt-0.5 text-[12px]">{myTickets.length} total</CardDescription>
            </div>
            <Button onClick={() => navigate("/client/tickets")} variant="ghost" size="sm" className="gap-1 text-[12px]">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">Ticket</TableHead>
                  <TableHead className="px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">Priority</TableHead>
                  <TableHead className="px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="px-5 py-8 text-center text-[13px] text-muted-foreground">
                      No tickets found for {user.company}.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentTickets.map((t) => {
                    const sc = statusConfig[t.status];
                    return (
                      <TableRow key={t.id} onClick={() => navigate(`/client/tickets/${t.id}`)} className="cursor-pointer">
                        <TableCell className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-violet-100 text-[11px] font-semibold text-violet-700">
                              {t.project.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="max-w-[260px] truncate text-[13px] font-medium">{t.subject}</div>
                              <div className="text-[11px] text-muted-foreground">#{t.id} · {formatDate(t.createdAt)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: sc?.bg, color: sc?.text }}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sc?.dot }} />
                            {t.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          {t.priority ? (
                            <span className="text-[12px] font-medium" style={{ color: priorityConfig[t.priority]?.text }}>{t.priority}</span>
                          ) : (
                            <span className="text-[12px] text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          <span className="text-[12px] text-muted-foreground">{daysSince(t.updatedAt)}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="gap-0 p-0">
            <CardHeader className="border-b">
              <CardTitle className="text-[14px]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="flex flex-col gap-1.5">
                {[
                  { label: "Create Ticket", icon: Plus, href: "/client/tickets/new", color: "#7c3aed" },
                  { label: "View My Tickets", icon: Ticket, href: "/client/tickets", color: "#2563eb" },
                  { label: "Knowledge Base", icon: BookOpen, href: "/client/knowledge", color: "#059669" },
                  { label: "Account Settings", icon: Clock, href: "/client/account", color: "#6c757d" },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.href)}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted"
                  >
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: `${action.color}18` }}>
                      <action.icon className="h-3.5 w-3.5" style={{ color: action.color }} />
                    </div>
                    <span className="text-[13px] font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2 gap-0 p-0">
          <CardHeader className="border-b">
            <CardTitle className="text-[14px]">Ticket Activity</CardTitle>
            <CardDescription className="mt-0.5 text-[12px]">Submitted vs. Resolved — last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="pb-5 pt-4">
            <ChartContainer config={trendChartConfig} className="h-[180px] w-full">
              <AreaChart data={activityTrendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cg-submitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cg-resolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Area type="monotone" dataKey="submitted" stroke="#7c3aed" strokeWidth={2} fill="url(#cg-submitted)" dot={false} />
                <Area type="monotone" dataKey="resolved" stroke="#059669" strokeWidth={2} fill="url(#cg-resolved)" dot={false} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="flex items-center justify-between border-b">
            <div>
              <CardTitle className="text-[14px]">Knowledge Base</CardTitle>
              <CardDescription className="mt-0.5 text-[12px]">Your published articles</CardDescription>
            </div>
            <Button onClick={() => navigate("/client/knowledge")} variant="ghost" size="sm" className="gap-1 text-[12px]">
              Browse <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {myArticles.slice(0, 4).map((article) => (
                <div
                  key={article.id}
                  onClick={() => navigate(`/client/knowledge/${article.id}`)}
                  className="flex cursor-pointer items-start gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-violet-100">
                    <BookOpen className="h-3 w-3 text-violet-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium">{article.title}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="rounded bg-muted px-1.5 py-0.5">{article.category}</span>
                      <Star className="h-3 w-3" />
                      <span>{article.views} views</span>
                    </div>
                  </div>
                </div>
              ))}
              {myArticles.length === 0 && (
                <div className="px-5 py-8 text-center text-[13px] text-muted-foreground">
                  No published articles yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
