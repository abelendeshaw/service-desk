import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts';
import {
  Ticket, CheckCircle2, Clock, AlertTriangle, TrendingUp,
  TrendingDown, ChevronRight, Wrench, Activity, Flame,
  CalendarClock,
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '../components/ui/card';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '../components/ui/chart';
import { Progress } from '../components/ui/progress';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { filterTicketsForEngineer } from '../lib/engineerTickets';
import { useAuth } from '../store/authStore';
import { useServiceDesk } from '../store/serviceDeskStore';

const statusConfig: Record<string, { dot: string; bg: string; text: string }> = {
  Open:          { dot: '#2563eb', bg: '#eff6ff', text: '#1d4ed8' },
  'In Progress': { dot: '#7c3aed', bg: '#f5f3ff', text: '#6d28d9' },
  Escalated:     { dot: '#dc2626', bg: '#fef2f2', text: '#dc2626' },
  Resolved:      { dot: '#059669', bg: '#f0fdf4', text: '#059669' },
  Closed:        { dot: '#6c757d', bg: '#f8fafc', text: '#6c757d' },
};

const priorityConfig: Record<string, { color: string; bg: string }> = {
  Critical: { color: '#dc2626', bg: '#fef2f2' },
  High:     { color: '#d97706', bg: '#fffbeb' },
  Medium:   { color: '#2563eb', bg: '#eff6ff' },
  Low:      { color: '#6c757d', bg: '#f8fafc' },
};

const workloadChartConfig = {
  count: { label: 'Tickets', color: '#7c3aed' },
} satisfies ChartConfig;

const typeBreakdown = [
  { type: 'Technical', count: 4 },
  { type: 'Network', count: 3 },
  { type: 'Hardware', count: 2 },
  { type: 'Software', count: 2 },
  { type: 'Other', count: 1 },
];

const typeColors = ['#7c3aed', '#2563eb', '#0891b2', '#059669', '#9ca3af'];

function daysSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  return days === 0 ? 'Today' : days === 1 ? '1d ago' : `${days}d ago`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function isDueToday(iso: string | null) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
}

function isOverdue(iso: string | null) {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

export function EngineerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tickets, notifications } = useServiceDesk();

  const myTickets = useMemo(
    () => filterTicketsForEngineer(tickets, user?.engineerId),
    [tickets, user?.engineerId],
  );

  const active    = myTickets.filter((t) => t.status === 'Open' || t.status === 'In Progress');
  const escalated = myTickets.filter((t) => t.status === 'Escalated');
  const resolved  = myTickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed');
  const dueToday  = myTickets.filter((t) => isDueToday(t.resolutionDueDate));
  const overdue   = myTickets.filter((t) => isOverdue(t.resolutionDueDate) && t.status !== 'Resolved' && t.status !== 'Closed');

  const priorityOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  const workQueue = [...active, ...escalated]
    .sort((a, b) => (priorityOrder[a.priority ?? 'Low'] ?? 3) - (priorityOrder[b.priority ?? 'Low'] ?? 3))
    .slice(0, 8);

  const recentNotifications = notifications.slice(0, 5);

  const resolutionRate = myTickets.length > 0
    ? Math.round((resolved.length / myTickets.length) * 100)
    : 0;

  const kpis = [
    {
      key: 'assigned',
      label: 'My Queue',
      value: active.length,
      change: `${myTickets.length} total`,
      up: true,
      icon: Ticket,
      color: '#7c3aed',
    },
    {
      key: 'dueToday',
      label: 'Due Today',
      value: dueToday.length,
      change: dueToday.length > 0 ? 'Action needed' : 'All clear',
      up: dueToday.length === 0,
      icon: CalendarClock,
      color: '#d97706',
    },
    {
      key: 'overdue',
      label: 'Overdue',
      value: overdue.length,
      change: overdue.length > 0 ? 'Needs attention' : 'None overdue',
      up: overdue.length === 0,
      icon: Clock,
      color: '#dc2626',
    },
    {
      key: 'escalated',
      label: 'Escalated',
      value: escalated.length,
      change: escalated.length > 0 ? 'Requires follow-up' : 'None escalated',
      up: escalated.length === 0,
      icon: AlertTriangle,
      color: '#ef4444',
    },
    {
      key: 'resolved',
      label: 'Resolved',
      value: resolved.length,
      change: `${resolutionRate}% rate`,
      up: resolutionRate >= 50,
      icon: CheckCircle2,
      color: '#059669',
    },
  ];

  return (
    <div className="min-h-full space-y-5 bg-muted/30 p-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-[13px] font-semibold text-primary-foreground">
            {user?.initials ?? "FE"}
          </div>
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">Field Engineer Workspace</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {user?.name ?? "Field Engineer"} · {user?.email ?? ""} ·{' '}
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/engineer/tickets')} size="sm" className="gap-1.5 text-[13px]">
            <Ticket className="h-3.5 w-3.5" />
            My Tickets
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.key} className="cursor-default gap-3 p-4 transition-all hover:shadow-sm">
            <div className="mb-1 flex items-start justify-between">
              <kpi.icon className="h-4 w-4" style={{ color: kpi.color }} />
              <Badge
                variant="outline"
                className={`gap-0.5 border-transparent bg-transparent p-0 text-[11px] shadow-none ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}
              >
                {kpi.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              </Badge>
            </div>
            <div className="mb-1 text-[26px] font-semibold leading-none">{kpi.value}</div>
            <div className="text-[12px] text-muted-foreground">{kpi.label}</div>
            <div className="text-[11px]" style={{ color: kpi.color }}>{kpi.change}</div>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-4">

        {/* Work Queue */}
        <Card className="col-span-2 gap-0 overflow-hidden p-0">
          <CardHeader className="flex items-center justify-between border-b">
            <div>
              <CardTitle className="flex items-center gap-2 text-[14px]">
                <Flame className="h-4 w-4 text-orange-500" />
                Priority Work Queue
              </CardTitle>
              <CardDescription className="mt-0.5 text-[12px]">
                {workQueue.length} active · sorted by priority
              </CardDescription>
            </div>
            <Button
              onClick={() => navigate('/engineer/tickets')}
              variant="ghost"
              size="sm"
              className="gap-1 text-[12px]"
            >
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
                  <TableHead className="px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">Due</TableHead>
                  <TableHead className="px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">Age</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workQueue.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-5 py-10 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                        <div className="text-[13px] font-medium">Queue is clear!</div>
                        <div className="text-[12px] text-muted-foreground">No active tickets assigned to you.</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  workQueue.map((t) => {
                    const sc = statusConfig[t.status];
                    const pc = t.priority ? priorityConfig[t.priority] : null;
                    const overdueSince = isOverdue(t.resolutionDueDate);
                    return (
                      <TableRow
                        key={t.id}
                        onClick={() => navigate(`/engineer/tickets/${t.id}`)}
                        className="cursor-pointer"
                      >
                        <TableCell className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-[11px] font-semibold text-white"
                              style={{ backgroundColor: pc?.color ?? '#6c757d' }}
                            >
                              {t.project.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="max-w-[220px] truncate text-[13px] font-medium">{t.subject}</div>
                              <div className="text-[11px] text-muted-foreground">#{t.id} · {t.project}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
                            style={{ backgroundColor: sc?.bg, color: sc?.text }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sc?.dot }} />
                            {t.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          {t.priority ? (
                            <span
                              className="rounded px-1.5 py-0.5 text-[11px] font-semibold"
                              style={{ backgroundColor: pc?.bg, color: pc?.color }}
                            >
                              {t.priority}
                            </span>
                          ) : (
                            <span className="text-[12px] text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          {t.resolutionDueDate ? (
                            <span className={`text-[12px] font-medium ${overdueSince ? 'text-red-500' : 'text-muted-foreground'}`}>
                              {overdueSince ? '⚠ ' : ''}{formatDate(t.resolutionDueDate)}
                            </span>
                          ) : (
                            <span className="text-[12px] text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          <span className="text-[12px] text-muted-foreground">{daysSince(t.createdAt)}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Performance */}
          <Card className="gap-0 p-0">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-[14px]">
                <Activity className="h-4 w-4 text-primary" />
                My Performance
              </CardTitle>
              <CardDescription className="text-[12px]">This month</CardDescription>
            </CardHeader>
            <CardContent className="px-5 py-4">
              <div className="space-y-4">
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[12px] text-muted-foreground">Resolution Rate</span>
                    <span className="text-[13px] font-semibold text-emerald-600">{resolutionRate}%</span>
                  </div>
                  <Progress value={resolutionRate || 2} className="h-1.5" />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[12px] text-muted-foreground">SLA Compliance</span>
                    <span className="text-[13px] font-semibold text-primary">92%</span>
                  </div>
                  <Progress value={92} className="h-1.5" />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[12px] text-muted-foreground">Avg Response Time</span>
                    <span className="text-[13px] font-semibold">2.4h</span>
                  </div>
                  <Progress value={70} className="h-1.5" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4">
                {[
                  { label: 'Resolved', value: resolved.length, color: '#059669' },
                  { label: 'Active', value: active.length, color: '#7c3aed' },
                  { label: 'Escalated', value: escalated.length, color: '#dc2626' },
                  { label: 'Total', value: myTickets.length, color: '#0b2235' },
                ].map((s) => (
                  <div key={s.label} className="rounded-md bg-muted/50 px-3 py-2">
                    <div className="text-[11px] text-muted-foreground">{s.label}</div>
                    <div className="text-[18px] font-semibold" style={{ color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card className="gap-0 overflow-hidden p-0">
            <CardHeader className="border-b">
              <CardTitle className="text-[14px]">Recent Activity</CardTitle>
              <CardDescription className="text-[12px]">Latest notifications</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {recentNotifications.length === 0 ? (
                <div className="px-5 py-6 text-center text-[13px] text-muted-foreground">No recent activity.</div>
              ) : (
                <div className="divide-y">
                  {recentNotifications.map((n) => {
                    const kindColors: Record<string, string> = {
                      assignment: '#7c3aed',
                      status: '#2563eb',
                      escalation: '#dc2626',
                      email: '#0891b2',
                      system: '#6c757d',
                    };
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          const href = n.href?.startsWith('/tickets/')
                            ? n.href.replace('/tickets/', '/engineer/tickets/')
                            : n.href;
                          if (href) navigate(href);
                        }}
                        className={`flex items-start gap-3 px-5 py-3 transition-colors hover:bg-muted/50 ${n.href ? 'cursor-pointer' : ''}`}
                      >
                        <div
                          className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: kindColors[n.kind] ?? '#6c757d', marginTop: '6px' }}
                        />
                        <div className="min-w-0">
                          <div className={`truncate text-[13px] font-medium ${n.unread ? '' : 'text-muted-foreground'}`}>
                            {n.title}
                          </div>
                          {n.detail && (
                            <div className="mt-0.5 text-[11px] text-muted-foreground">{n.detail}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Workload Chart */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2 gap-0 p-0">
          <CardHeader className="flex items-center justify-between border-b">
            <div>
              <CardTitle className="flex items-center gap-2 text-[14px]">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                Workload by Support Type
              </CardTitle>
              <CardDescription className="mt-0.5 text-[12px]">Ticket distribution across categories</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pb-5 pt-4">
            <ChartContainer config={workloadChartConfig} className="h-[180px] w-full">
              <BarChart data={typeBreakdown} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" vertical={false} />
                <XAxis dataKey="type" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <ChartTooltip
                  content={<ChartTooltipContent formatter={(value) => <span className="font-medium">{value} tickets</span>} />}
                />
                <Bar dataKey="count" radius={4}>
                  {typeBreakdown.map((_, i) => (
                    <Cell key={i} fill={typeColors[i % typeColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Escalated Tickets */}
        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-[14px]">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Escalated Tickets
            </CardTitle>
            <CardDescription className="text-[12px]">{escalated.length} require attention</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {escalated.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-5 py-8">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                <div className="text-[13px] font-medium text-emerald-600">No escalations</div>
                <div className="text-center text-[12px] text-muted-foreground">All tickets are progressing normally.</div>
              </div>
            ) : (
              <div className="divide-y">
                {escalated.slice(0, 4).map((t) => (
                  <div
                    key={t.id}
                    onClick={() => navigate(`/engineer/tickets/${t.id}`)}
                    className="cursor-pointer px-5 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="max-w-[180px] truncate text-[13px] font-medium">{t.subject}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">#{t.id} · {t.project}</div>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0 border-red-200 bg-red-50 text-[10px] text-red-600">
                        {t.escalation?.target ?? 'Escalated'}
                      </Badge>
                    </div>
                    {t.escalation?.reason && (
                      <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">{t.escalation.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
