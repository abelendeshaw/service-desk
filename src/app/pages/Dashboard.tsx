import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Cell
} from 'recharts';
import {
  Ticket, CheckCircle2, Clock, AlertTriangle, TrendingUp,
  TrendingDown, ChevronRight, Activity, Zap, RefreshCw
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../components/ui/chart';
import { Progress } from '../components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

const kpis = [
  {
    key: 'total',
    label: 'Total Tickets',
    value: 135,
    change: '+8',
    changeLabel: 'this month',
    up: true,
    icon: Ticket,
    color: '#0b2235',
    bgColor: '#f0f4f8',
  },
  {
    key: 'open',
    label: 'Open',
    value: 85,
    change: '+12%',
    changeLabel: 'vs last week',
    up: true,
    icon: Zap,
    color: '#2563eb',
    bgColor: '#eff6ff',
  },
  {
    key: 'resolved',
    label: 'Resolved Today',
    value: 47,
    change: '+8%',
    changeLabel: 'vs yesterday',
    up: true,
    icon: CheckCircle2,
    color: '#059669',
    bgColor: '#f0fdf4',
  },
  {
    key: 'overdue',
    label: 'Overdue',
    value: 12,
    change: '-3',
    changeLabel: 'since last week',
    up: false,
    icon: Clock,
    color: '#d97706',
    bgColor: '#fffbeb',
  },
  {
    key: 'sla',
    label: 'SLA Breaches',
    value: 2,
    change: '-1',
    changeLabel: 'this week',
    up: false,
    icon: AlertTriangle,
    color: '#dc2626',
    bgColor: '#fef2f2',
  },
];

const trendData = [
  { day: 'Mon', created: 12, resolved: 15, pending: 8 },
  { day: 'Tue', created: 19, resolved: 13, pending: 12 },
  { day: 'Wed', created: 15, resolved: 18, pending: 10 },
  { day: 'Thu', created: 22, resolved: 16, pending: 14 },
  { day: 'Fri', created: 18, resolved: 20, pending: 9 },
  { day: 'Sat', created: 8, resolved: 12, pending: 5 },
  { day: 'Sun', created: 6, resolved: 9, pending: 4 },
];

const statusData = [
  { name: 'Open', value: 77, color: '#2563eb' },
  { name: 'Pending', value: 5, color: '#d97706' },
  { name: 'Escalated', value: 8, color: '#dc2626' },
  { name: 'Closed', value: 35, color: '#6c757d' },
  { name: 'Unassigned', value: 10, color: '#059669' },
];

const priorityData = [
  { name: 'Critical', value: 2, color: '#dc2626' },
  { name: 'High', value: 3, color: '#d97706' },
  { name: 'Low', value: 3, color: '#2563eb' },
  { name: 'Unassigned', value: 127, color: '#e2e8f0' },
];

const recentTickets = [
  { id: '#00135', subject: 'FortiGate & Cisco Switch WiFi Access — Diredawa', status: 'Open', priority: null, age: '41d', company: 'EPSS', initials: 'EP', color: '#7c3aed' },
  { id: '#00134', subject: 'MoWS site UPS failure', status: 'Escalated', priority: 'High', age: '41d', company: 'MoWS', initials: 'MW', color: '#1d4ed8' },
  { id: '#00133', subject: 'OPO site Power issue and wall paint', status: 'Pending', priority: 'Low', age: '41d', company: 'OPO', initials: 'OP', color: '#059669' },
  { id: '#00132', subject: 'MoCS site Cabinet and cabling work', status: 'Open', priority: null, age: '41d', company: 'MoCS', initials: 'MC', color: '#dc2626' },
  { id: '#00131', subject: 'MOTI Virtual machine access issue', status: 'Open', priority: null, age: '41d', company: 'MoTI', initials: 'MT', color: '#0891b2' },
  { id: '#00130', subject: 'MOTI power issue at main data center', status: 'Open', priority: null, age: '42d', company: 'MoTI', initials: 'MT', color: '#0891b2' },
];

const agentPerformance = [
  { name: 'Sisay Shiferaw', email: 'sisay@ienetworks.co', assigned: 1, resolved: 0, rate: 0, initials: 'SS', color: '#7c3aed' },
  { name: 'Wongel Wondyifraw', email: 'wongel@ienetworks.co', assigned: 2, resolved: 0, rate: 0, initials: 'WW', color: '#1d4ed8' },
  { name: 'Masresha Melese', email: 'masresha@ienetworks.co', assigned: 1, resolved: 0, rate: 0, initials: 'MM', color: '#0891b2' },
  { name: 'Mebrate Degu', email: 'mebrate@ienetworks.co', assigned: 1, resolved: 0, rate: 0, initials: 'MD', color: '#059669' },
];

const statusConfig: Record<string, { label: string; dot: string; text: string }> = {
  Open: { label: 'Open', dot: '#2563eb', text: '#1d4ed8' },
  Escalated: { label: 'Escalated', dot: '#dc2626', text: '#dc2626' },
  Pending: { label: 'Pending', dot: '#d97706', text: '#b45309' },
  Closed: { label: 'Closed', dot: '#6c757d', text: '#6c757d' },
};

const trendChartConfig = {
  created: {
    label: 'Created',
    color: '#0b2235',
  },
  resolved: {
    label: 'Resolved',
    color: '#059669',
  },
} satisfies ChartConfig;

const statusChartConfig = {
  value: { label: 'Tickets', color: '#2563eb' },
  Open: { label: 'Open', color: '#2563eb' },
  Pending: { label: 'Pending', color: '#d97706' },
  Escalated: { label: 'Escalated', color: '#dc2626' },
  Closed: { label: 'Closed', color: '#6c757d' },
  Unassigned: { label: 'Unassigned', color: '#059669' },
} satisfies ChartConfig;

const priorityChartConfig = {
  value: { label: 'Tickets', color: '#0b2235' },
  Critical: { label: 'Critical', color: '#dc2626' },
  High: { label: 'High', color: '#d97706' },
  Low: { label: 'Low', color: '#2563eb' },
  Unassigned: { label: 'Unassigned', color: '#e2e8f0' },
} satisfies ChartConfig;

export function Dashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('7d');
  const totalStatusTickets = statusData.reduce((a, b) => a + b.value, 0);

  return (
    <div className="min-h-full space-y-5 bg-muted/30 p-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Service Desk Overview · Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-[13px]">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <Button
            onClick={() => navigate('/tickets/new')}
            size="sm"
            className="text-[13px]"
          >
            Create Ticket
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.key} className="cursor-default gap-3 p-4 transition-all hover:shadow-sm">
            <div className="mb-1 flex items-start justify-between">
              <kpi.icon className="h-4 w-4" style={{ color: kpi.color }} />
              <Badge variant="outline" className={`gap-0.5 border-transparent bg-transparent p-0 text-[11px] shadow-none ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.change}
              </Badge>
            </div>
            <div className="mb-1 text-[26px] leading-none font-semibold">{kpi.value}</div>
            <div className="text-[12px] text-muted-foreground">{kpi.label}</div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Trend Chart */}
        <Card className="col-span-2 gap-0 p-0">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[14px]">Ticket Activity</CardTitle>
              <CardDescription className="mt-0.5 text-[12px]">Created vs. Resolved</CardDescription>
            </div>
            <div className="flex items-center gap-1 p-0.5 bg-[#f8f9fa] rounded-md border border-[#e1e4e8]">
              {['7d', '30d', '90d'].map((p) => (
                <Button
                  key={p}
                  onClick={() => setPeriod(p)}
                  variant={period === p ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-2.5 text-[12px]"
                >
                  {p}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pb-5">
          <ChartContainer config={trendChartConfig} className="h-[220px] w-full">
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0b2235" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#0b2235" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area type="monotone" dataKey="created" stroke="#0b2235" strokeWidth={2} fill="url(#gCreated)" name="Created" dot={false} />
              <Area type="monotone" dataKey="resolved" stroke="#059669" strokeWidth={2} fill="url(#gResolved)" name="Resolved" dot={false} />
            </AreaChart>
          </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="gap-0 p-0">
          <CardHeader>
            <CardTitle className="text-[14px]">Status Distribution</CardTitle>
            <CardDescription className="text-[12px]">{totalStatusTickets} total tickets</CardDescription>
          </CardHeader>
          <CardContent>

          <ChartContainer config={statusChartConfig} className="h-[170px] w-full">
            <BarChart data={statusData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(value) => <span className="font-medium">{value} tickets</span>} />}
              />
              <Bar dataKey="value" radius={4}>
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>

          <div className="mt-5 border-t pt-4">
            <h4 className="mb-3 text-[13px] font-semibold">Priority Breakdown</h4>
            <ChartContainer config={priorityChartConfig} className="h-[140px] w-full">
              <BarChart data={priorityData} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={72} />
                <ChartTooltip
                  content={<ChartTooltipContent formatter={(value) => <span className="font-medium">{value} tickets</span>} />}
                />
                <Bar dataKey="value" radius={4}>
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recent Tickets */}
        <Card className="col-span-2 gap-0 overflow-hidden p-0">
          <CardHeader className="flex items-center justify-between border-b">
            <div>
              <CardTitle className="text-[14px]">Recent Tickets</CardTitle>
              <CardDescription className="mt-0.5 text-[12px]">Latest {recentTickets.length} tickets</CardDescription>
            </div>
            <Button
              onClick={() => navigate('/tickets')}
              variant="ghost"
              size="sm"
              className="gap-1 text-[12px]"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">Ticket</TableHead>
                <TableHead className="px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">Priority</TableHead>
                <TableHead className="px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">Age</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTickets.map((t) => {
                const sc = statusConfig[t.status];
                return (
                  <TableRow
                    key={t.id}
                    onClick={() => navigate(`/tickets/${t.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0"
                          style={{ backgroundColor: t.color }}
                        >
                          {t.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium truncate max-w-xs">{t.subject}</div>
                          <div className="text-[11px] text-muted-foreground">{t.id} · {t.company}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc?.dot }} />
                        <span className="text-[12px]">{t.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3">
                      {t.priority ? (
                        <span className="text-[12px]">{t.priority}</span>
                      ) : (
                        <span className="text-[12px] text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-3">
                      <span className="text-[12px] text-muted-foreground">{t.age}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          </CardContent>
        </Card>

        {/* Agent Performance */}
        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="border-b">
            <CardTitle className="text-[14px]">Agent Performance</CardTitle>
            <CardDescription className="mt-0.5 text-[12px]">{agentPerformance.length} agents tracked</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
          <div className="divide-y">
            {agentPerformance.map((agent) => (
              <div key={agent.name} className="px-5 py-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0"
                    style={{ backgroundColor: agent.color }}
                  >
                    {agent.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium truncate">{agent.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{agent.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <div>
                    <div className="text-[11px] text-muted-foreground">Assigned</div>
                    <div className="text-[13px] font-semibold">{agent.assigned}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">Resolved</div>
                    <div className="text-[13px] font-semibold text-emerald-600">{agent.resolved}</div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-0.5 text-[11px] text-muted-foreground">Rate</div>
                    <Progress value={agent.rate || 2} className="h-1.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          </CardContent>

          {/* CSAT Summary */}
          <CardContent className="border-t bg-muted/40 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12px] text-muted-foreground">Customer Satisfaction</div>
                <div className="text-[20px] font-semibold">72%</div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-primary">
                <Activity className="h-4 w-4 text-primary" />
              </div>
            </div>
            <Progress value={72} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
