import React, { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Cell,
} from 'recharts';
import {
  Search, Download, AlertCircle, ArrowUpDown,
  Clock, AlertTriangle, TrendingUp, Users, Tag, Mail,
  RefreshCw, Radio,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '../components/ui/card';
import {
  ChartContainer, ChartLegend, ChartLegendContent,
  ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '../components/ui/chart';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { useServiceDesk } from '../store/serviceDeskStore';
import type { Ticket as TicketType } from '../store/types';

// ---------------------------------------------------------------------------
// Config maps
// ---------------------------------------------------------------------------

const statusConfig: Record<string, { dotClass: string; badgeClass: string; color: string }> = {
  Open: { dotClass: 'bg-blue-500', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200', color: '#2563eb' },
  'In Progress': { dotClass: 'bg-amber-500', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200', color: '#f59e0b' },
  Escalated: { dotClass: 'bg-red-500', badgeClass: 'bg-red-50 text-red-700 border-red-200', color: '#ef4444' },
  Resolved: { dotClass: 'bg-emerald-500', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', color: '#16a34a' },
  Closed: { dotClass: 'bg-slate-400', badgeClass: 'bg-muted text-muted-foreground border-border', color: '#64748b' },
};

const priorityConfig: Record<string, { dotClass: string; textClass: string }> = {
  Critical: { dotClass: 'bg-red-500', textClass: 'text-red-700' },
  High: { dotClass: 'bg-amber-500', textClass: 'text-amber-700' },
  Medium: { dotClass: 'bg-blue-500', textClass: 'text-blue-700' },
  Low: { dotClass: 'bg-emerald-500', textClass: 'text-emerald-700' },
};

const avatarColors = ['#7c3aed', '#1d4ed8', '#0891b2', '#059669', '#d97706', '#dc2626'];

// ---------------------------------------------------------------------------
// Period helpers
// ---------------------------------------------------------------------------

type Period = 'all' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';

const PERIOD_LABELS: Record<Period, string> = {
  all: 'All Time',
  daily: 'Today',
  weekly: 'This Week',
  monthly: 'This Month',
  quarterly: 'This Quarter',
  custom: 'Custom',
};

function getPeriodDates(period: Period): { from: string; to: string } | null {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  switch (period) {
    case 'daily':
      return { from: today, to: today };
    case 'weekly': {
      const d = new Date(now);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      return { from: d.toISOString().slice(0, 10), to: today };
    }
    case 'monthly':
      return { from: `${today.slice(0, 7)}-01`, to: today };
    case 'quarterly': {
      const q = Math.floor(now.getMonth() / 3);
      const qStart = new Date(now.getFullYear(), q * 3, 1);
      return { from: qStart.toISOString().slice(0, 10), to: today };
    }
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Excel (SpreadsheetML) export — opens natively in Excel, no library needed
// ---------------------------------------------------------------------------

function xmlEscape(str: string) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function makeCell(value: string, bold = false) {
  const style = bold ? ' ss:StyleID="header"' : '';
  return `<Cell${style}><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`;
}

function exportToExcel(rows: TicketType[], engineers: { id: string; name: string }[], period: Period) {
  const headers = [
    'Ticket ID', 'Project', 'Subject', 'Status', 'Priority',
    'Support Type', 'Client / Contact', 'Assigned To',
    'Created Date', 'Last Updated', 'Due Date', 'Escalated', 'Escalation Target',
    'No. of Comments', 'No. of Issues', 'Source',
  ];

  const dataRows = rows.map((t) => {
    const assigned = t.assignedEngineerIds.length
      ? t.assignedEngineerIds.map((id) => engineers.find((e) => e.id === id)?.name ?? id).join('; ')
      : 'Unassigned';
    return [
      t.id,
      t.project,
      t.subject,
      t.status,
      t.priority ?? 'None',
      t.supportType,
      t.contactName,
      assigned,
      t.createdAt.slice(0, 10),
      t.updatedAt.slice(0, 10),
      t.resolutionDueDate ?? '',
      t.escalation ? 'Yes' : 'No',
      t.escalation?.target ?? '',
      String(t.comments.length),
      String(t.issues.length),
      t.source.type,
    ];
  });

  const periodLabel = PERIOD_LABELS[period];
  const generatedAt = new Date().toLocaleString('en', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:x="urn:schemas-microsoft-com:office:excel">
  <Styles>
    <Style ss:ID="header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="meta">
      <Font ss:Italic="1" ss:Color="#6B7280"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Ticket Report">
    <Table>
      <Row>
        <Cell ss:StyleID="meta"><Data ss:Type="String">Service Desk — Ticket Report</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="meta"><Data ss:Type="String">Period: ${xmlEscape(periodLabel)}</Data></Cell>
        <Cell ss:StyleID="meta"><Data ss:Type="String">Generated: ${xmlEscape(generatedAt)}</Data></Cell>
        <Cell ss:StyleID="meta"><Data ss:Type="String">Total records: ${rows.length}</Data></Cell>
      </Row>
      <Row/>
      <Row>
        ${headers.map((h) => makeCell(h, true)).join('\n        ')}
      </Row>
      ${dataRows.map((row) => `<Row>\n        ${row.map((c) => makeCell(c)).join('\n        ')}\n      </Row>`).join('\n      ')}
    </Table>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ticket-report-${periodLabel.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Chart configs
// ---------------------------------------------------------------------------

const trendChartConfig = {
  created: { label: 'Created', color: '#0b2235' },
  resolved: { label: 'Resolved', color: '#16a34a' },
} satisfies ChartConfig;

const projectChartConfig = {
  open: { label: 'Open / In Progress', color: '#2563eb' },
  resolved: { label: 'Resolved / Closed', color: '#16a34a' },
  escalated: { label: 'Escalated', color: '#ef4444' },
} satisfies ChartConfig;

const workloadChartConfig = {
  assigned: { label: 'Assigned', color: '#7c3aed' },
  resolved: { label: 'Resolved', color: '#16a34a' },
} satisfies ChartConfig;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Reports() {
  const navigate = useNavigate();
  const { tickets, engineers } = useServiceDesk();

  // Period selector (Req 2)
  const [period, setPeriod] = useState<Period>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Table filters (Req 1)
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [engineerFilter, setEngineerFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [supportTypeFilter, setSupportTypeFilter] = useState('all');

  // Table state
  const [selected, setSelected] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'subject' | 'createdAt'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Real-time indicator (Req 4)
  const [lastRefreshed, setLastRefreshed] = useState(() => new Date());
  const refresh = useCallback(() => setLastRefreshed(new Date()), []);

  // Derive effective date range from period selection
  const { effectiveFrom, effectiveTo } = useMemo(() => {
    if (period === 'custom') return { effectiveFrom: customFrom, effectiveTo: customTo };
    const dates = getPeriodDates(period);
    return { effectiveFrom: dates?.from ?? '', effectiveTo: dates?.to ?? '' };
  }, [period, customFrom, customTo]);

  // Derived unique values for filter dropdowns
  const projects = useMemo(() => Array.from(new Set(tickets.map((t) => t.project))).sort(), [tickets]);
  const clients = useMemo(() => Array.from(new Set(tickets.map((t) => t.contactName))).sort(), [tickets]);
  const supportTypes = useMemo(() => Array.from(new Set(tickets.map((t) => t.supportType))).sort(), [tickets]);

  // Filtered + sorted rows
  const filtered = useMemo(() => {
    let rows = tickets.filter((t) => {
      if (
        search &&
        !t.subject.toLowerCase().includes(search.toLowerCase()) &&
        !t.id.includes(search) &&
        !t.project.toLowerCase().includes(search.toLowerCase()) &&
        !t.contactName.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all') {
        if (priorityFilter === 'none' && t.priority !== null) return false;
        if (priorityFilter !== 'none' && t.priority !== priorityFilter) return false;
      }
      if (projectFilter !== 'all' && t.project !== projectFilter) return false;
      if (clientFilter !== 'all' && t.contactName !== clientFilter) return false;
      if (supportTypeFilter !== 'all' && t.supportType !== supportTypeFilter) return false;
      if (engineerFilter !== 'all') {
        const ids = t.assignedEngineerIds;
        if (engineerFilter === 'unassigned' && ids.length > 0) return false;
        if (engineerFilter !== 'unassigned' && !ids.includes(engineerFilter)) return false;
      }
      if (effectiveFrom && t.createdAt.slice(0, 10) < effectiveFrom) return false;
      if (effectiveTo && t.createdAt.slice(0, 10) > effectiveTo) return false;
      return true;
    });
    rows = [...rows].sort((a, b) => {
      const va = a[sortField], vb = b[sortField];
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return rows;
  }, [tickets, search, statusFilter, priorityFilter, projectFilter, clientFilter, supportTypeFilter, engineerFilter, effectiveFrom, effectiveTo, sortField, sortDir]);

  React.useEffect(() => {
    setSelected((prev) => prev.filter((id) => filtered.some((t) => t.id === id)));
  }, [filtered]);

  const today = new Date().toISOString().slice(0, 10);

  // Values used by charts (kept separate from KPI cards)
  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === 'Open').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'In Progress').length;
  const escalatedTickets = tickets.filter((t) => t.status === 'Escalated').length;
  const resolvedTickets = tickets.filter((t) => t.status === 'Resolved').length;
  const closedTickets = tickets.filter((t) => t.status === 'Closed').length;
  const unassignedTickets = tickets.filter((t) => t.assignedEngineerIds.length === 0).length;

  // Analytical KPI values (distinct from Dashboard metrics)
  const resolvedOrClosed = resolvedTickets + closedTickets;
  const resolutionRate = totalTickets > 0 ? Math.round((resolvedOrClosed / totalTickets) * 100) : 0;
  const escalationRate = totalTickets > 0 ? Math.round((escalatedTickets / totalTickets) * 100) : 0;
  const noPriorityCount = tickets.filter((t) => t.priority === null).length;
  const emailSourceCount = tickets.filter((t) => t.source.type === 'email').length;

  const resolvedWithTimes = tickets.filter((t) => (t.status === 'Resolved' || t.status === 'Closed') && t.createdAt && t.updatedAt);
  const avgResolutionDays =
    resolvedWithTimes.length > 0
      ? Math.round(
          resolvedWithTimes.reduce((sum, t) => {
            return sum + (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          }, 0) / resolvedWithTimes.length,
        )
      : null;

  const kpis = [
    {
      key: 'resolution_rate',
      label: 'Resolution Rate',
      value: `${resolutionRate}%`,
      sub: `${resolvedOrClosed} of ${totalTickets} resolved`,
      icon: TrendingUp,
      color: resolutionRate >= 60 ? '#16a34a' : '#d97706',
    },
    {
      key: 'avg_resolution',
      label: 'Avg Resolution Time',
      value: avgResolutionDays !== null ? `${avgResolutionDays}d` : '—',
      sub: avgResolutionDays !== null ? `across ${resolvedWithTimes.length} resolved tickets` : 'No resolved tickets yet',
      icon: Clock,
      color: '#0891b2',
    },
    {
      key: 'escalation_rate',
      label: 'Escalation Rate',
      value: `${escalationRate}%`,
      sub: `${escalatedTickets} ticket${escalatedTickets !== 1 ? 's' : ''} escalated`,
      icon: AlertTriangle,
      color: escalationRate > 10 ? '#ef4444' : '#d97706',
    },
    {
      key: 'unassigned',
      label: 'Unassigned Tickets',
      value: unassignedTickets,
      sub: `${totalTickets > 0 ? Math.round((unassignedTickets / totalTickets) * 100) : 0}% of all tickets`,
      icon: Users,
      color: unassignedTickets > 0 ? '#d97706' : '#16a34a',
    },
    {
      key: 'no_priority',
      label: 'No Priority Set',
      value: noPriorityCount,
      sub: `${totalTickets > 0 ? Math.round((noPriorityCount / totalTickets) * 100) : 0}% missing priority`,
      icon: Tag,
      color: noPriorityCount > 0 ? '#64748b' : '#16a34a',
    },
    {
      key: 'email_source',
      label: 'Via Email',
      value: emailSourceCount,
      sub: `${totalTickets > 0 ? Math.round((emailSourceCount / totalTickets) * 100) : 0}% from email channel`,
      icon: Mail,
      color: '#7c3aed',
    },
  ];

  // Chart data
  const statusChartData = [
    { name: 'Open', value: openTickets, color: '#2563eb' },
    { name: 'In Progress', value: inProgressTickets, color: '#f59e0b' },
    { name: 'Escalated', value: escalatedTickets, color: '#ef4444' },
    { name: 'Resolved', value: resolvedTickets, color: '#16a34a' },
    { name: 'Closed', value: closedTickets, color: '#64748b' },
  ];

  const projectChartData = useMemo(() => {
    const counts: Record<string, { open: number; resolved: number; escalated: number }> = {};
    tickets.forEach((t) => {
      if (!counts[t.project]) counts[t.project] = { open: 0, resolved: 0, escalated: 0 };
      if (t.status === 'Open' || t.status === 'In Progress') counts[t.project].open++;
      else if (t.status === 'Resolved' || t.status === 'Closed') counts[t.project].resolved++;
      else if (t.status === 'Escalated') counts[t.project].escalated++;
    });
    return Object.entries(counts).map(([name, v]) => ({ name, ...v }));
  }, [tickets]);

  const trendData = useMemo(() => {
    if (tickets.length === 0) return [];
    const monthCounts: Record<string, { created: number; resolved: number }> = {};
    tickets.forEach((t) => {
      const month = t.createdAt.slice(0, 7);
      if (!monthCounts[month]) monthCounts[month] = { created: 0, resolved: 0 };
      monthCounts[month].created++;
      if (t.status === 'Resolved' || t.status === 'Closed') {
        const rm = t.updatedAt.slice(0, 7);
        if (!monthCounts[rm]) monthCounts[rm] = { created: 0, resolved: 0 };
        monthCounts[rm].resolved++;
      }
    });
    return Object.entries(monthCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({
        month: new Date(month + '-01').toLocaleString('en', { month: 'short', year: '2-digit' }),
        ...v,
      }));
  }, [tickets]);

  const engineerWorkload = useMemo(() => {
    return engineers.map((eng) => {
      const assigned = tickets.filter((t) => t.assignedEngineerIds.includes(eng.id));
      const resolved = assigned.filter((t) => t.status === 'Resolved' || t.status === 'Closed');
      return { name: eng.name.split(' ')[0], assigned: assigned.length, resolved: resolved.length };
    });
  }, [engineers, tickets]);

  const toggleSort = (field: 'subject' | 'createdAt') => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const allSelected = filtered.length > 0 && selected.length === filtered.length;
  const someSelected = selected.length > 0;

  const hasFilters = search || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all'
    || clientFilter !== 'all' || supportTypeFilter !== 'all' || engineerFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setProjectFilter('all');
    setClientFilter('all');
    setSupportTypeFilter('all');
    setEngineerFilter('all');
  };

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
    if (p !== 'custom') { setCustomFrom(''); setCustomTo(''); }
  };

  const lastRefreshedStr = lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex h-full flex-col bg-muted/30">

      {/* ── Page Header ── */}
      <div className="border-b bg-background px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">Reports</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Analytics and reporting for all support tickets · {totalTickets} total
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time indicator (Req 4) */}
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <Radio className="w-3 h-3 text-emerald-500" />
              <span>Live · Updated {lastRefreshedStr}</span>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-[13px]" onClick={refresh}>
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>

            {/* Export buttons (Req 3) */}
            {someSelected && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-[13px]"
                onClick={() => exportToExcel(filtered.filter((t) => selected.includes(t.id)), engineers, period)}
              >
                <Download className="w-3.5 h-3.5" />
                Export {selected.length} selected
              </Button>
            )}
            <Button
              size="sm"
              className="gap-1.5 text-[13px]"
              onClick={() => exportToExcel(filtered, engineers, period)}
            >
              <Download className="w-3.5 h-3.5" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* ── Period selector (Req 2) ── */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mr-1">Period:</span>
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? 'default' : 'ghost'}
              onClick={() => handlePeriodChange(p)}
              className="h-7 px-3 text-[12px]"
            >
              {PERIOD_LABELS[p]}
            </Button>
          ))}
          {period === 'custom' && (
            <div className="flex items-center gap-2 ml-2">
              <Input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-7 w-[130px] text-[12px]"
              />
              <span className="text-[12px] text-muted-foreground">to</span>
              <Input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-7 w-[130px] text-[12px]"
              />
            </div>
          )}
          {period !== 'all' && (
            <span className="text-[11px] text-muted-foreground ml-1">
              {effectiveFrom && effectiveTo ? `${effectiveFrom} → ${effectiveTo}` : effectiveFrom || effectiveTo || ''}
            </span>
          )}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* ── Analytical KPI Row ── */}
        <div className="grid grid-cols-6 gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.key} className="cursor-default gap-0 p-4 transition-all hover:shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <kpi.icon className="h-4 w-4" style={{ color: kpi.color }} />
              </div>
              <div className="mb-1 text-[26px] leading-none font-semibold">{kpi.value}</div>
              <div className="text-[12px] font-medium text-foreground mt-1">{kpi.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{kpi.sub}</div>
            </Card>
          ))}
        </div>

        {/* ── Charts Row 1: Trend + Status ── */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="col-span-2 gap-0 p-0">
            <CardHeader>
              <CardTitle className="text-[14px]">Ticket Volume Trend</CardTitle>
              <CardDescription className="text-[12px]">Created vs. Resolved over time</CardDescription>
            </CardHeader>
            <CardContent className="pb-5">
              {trendData.length > 0 ? (
                <ChartContainer config={trendChartConfig} className="h-[200px] w-full">
                  <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gCreatedRep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0b2235" stopOpacity={0.08} />
                        <stop offset="100%" stopColor="#0b2235" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gResolvedRep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#16a34a" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area type="monotone" dataKey="created" stroke="#0b2235" strokeWidth={2} fill="url(#gCreatedRep)" dot={false} />
                    <Area type="monotone" dataKey="resolved" stroke="#16a34a" strokeWidth={2} fill="url(#gResolvedRep)" dot={false} />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-[13px] text-muted-foreground">No trend data available</div>
              )}
            </CardContent>
          </Card>

          <Card className="gap-0 p-0">
            <CardHeader>
              <CardTitle className="text-[14px]">Status Distribution</CardTitle>
              <CardDescription className="text-[12px]">{totalTickets} tickets across all statuses</CardDescription>
            </CardHeader>
            <CardContent className="pb-5">
              <ChartContainer config={{ value: { label: 'Tickets', color: '#2563eb' } }} className="h-[180px] w-full">
                <BarChart data={statusChartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(v) => <span className="font-medium">{v} tickets</span>} />} />
                  <Bar dataKey="value" radius={4}>
                    {statusChartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ChartContainer>
              <div className="mt-3 space-y-1.5 border-t pt-3">
                {statusChartData.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-[12px] text-muted-foreground">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium">{s.value}</span>
                      <span className="text-[11px] text-muted-foreground w-8 text-right">
                        {totalTickets > 0 ? Math.round((s.value / totalTickets) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Charts Row 2: By Project + Engineer Workload ── */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="gap-0 p-0">
            <CardHeader>
              <CardTitle className="text-[14px]">Tickets by Project</CardTitle>
              <CardDescription className="text-[12px]">Open, resolved, and escalated per project</CardDescription>
            </CardHeader>
            <CardContent className="pb-5">
              {projectChartData.length > 0 ? (
                <ChartContainer config={projectChartConfig} className="h-[200px] w-full">
                  <BarChart data={projectChartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="open" stackId="a" fill="#2563eb" />
                    <Bar dataKey="resolved" stackId="a" fill="#16a34a" />
                    <Bar dataKey="escalated" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-[13px] text-muted-foreground">No project data</div>
              )}
            </CardContent>
          </Card>

          <Card className="gap-0 p-0">
            <CardHeader>
              <CardTitle className="text-[14px]">Engineer Workload</CardTitle>
              <CardDescription className="text-[12px]">
                Assigned vs. resolved per engineer · {unassignedTickets} unassigned
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-5">
              {engineerWorkload.length > 0 ? (
                <ChartContainer config={workloadChartConfig} className="h-[200px] w-full">
                  <BarChart data={engineerWorkload} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="assigned" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resolved" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-[13px] text-muted-foreground">No engineer data</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Table Card ── */}
        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between mb-3">
              <div>
                <CardTitle className="text-[14px]">Ticket Data</CardTitle>
                <CardDescription className="text-[12px]">
                  {filtered.length} of {tickets.length} tickets
                  {someSelected && ` · ${selected.length} selected`}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {someSelected && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-[12px] h-7 px-2.5"
                    onClick={() => exportToExcel(filtered.filter((t) => selected.includes(t.id)), engineers, period)}
                  >
                    <Download className="w-3 h-3" />
                    Export selected
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-[12px] h-7 px-2.5"
                  onClick={() => exportToExcel(filtered, engineers, period)}
                >
                  <Download className="w-3 h-3" />
                  Export Excel
                </Button>
              </div>
            </div>

            {/* ── Filters (Req 1) ── */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative min-w-[180px] max-w-xs flex-1">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 bg-muted pl-9 pr-3 text-[13px]"
                />
              </div>

              {/* Status */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[130px] text-[13px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Escalated">Escalated</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority */}
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-8 w-[130px] text-[13px]">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="none">No Priority</SelectItem>
                </SelectContent>
              </Select>

              {/* Project */}
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="h-8 w-[130px] text-[13px]">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>

              {/* Client (Req 1) */}
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="h-8 w-[140px] text-[13px]">
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>

              {/* Team / Support Type (Req 1) */}
              <Select value={supportTypeFilter} onValueChange={setSupportTypeFilter}>
                <SelectTrigger className="h-8 w-[160px] text-[13px]">
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {supportTypes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>

              {/* Engineer (Req 1) */}
              <Select value={engineerFilter} onValueChange={setEngineerFilter}>
                <SelectTrigger className="h-8 w-[150px] text-[13px]">
                  <SelectValue placeholder="All Engineers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Engineers</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {engineers.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button variant="ghost" size="sm" className="h-8 text-[12px] text-muted-foreground" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          </CardHeader>

          {/* ── Table ── */}
          <CardContent className="p-0">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead className="w-10 pl-5 py-3">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(checked) => setSelected(checked ? filtered.map((t) => t.id) : [])}
                    />
                  </TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <div className="flex cursor-pointer items-center gap-1 hover:text-foreground" onClick={() => toggleSort('subject')}>
                      Subject <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Priority</TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Client</TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Team</TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Assigned To</TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <div className="flex cursor-pointer items-center gap-1 hover:text-foreground" onClick={() => toggleSort('createdAt')}>
                      Created <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Due Date</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="bg-background">
                {filtered.map((ticket, i) => {
                  const sc = statusConfig[ticket.status];
                  const pc = ticket.priority ? priorityConfig[ticket.priority] : null;
                  const isSelected = selected.includes(ticket.id);
                  const assignedEngineers = ticket.assignedEngineerIds
                    .map((id) => engineers.find((e) => e.id === id))
                    .filter((e): e is (typeof engineers)[number] => Boolean(e));
                  const isOverdue =
                    ticket.resolutionDueDate &&
                    ticket.resolutionDueDate < today &&
                    ticket.status !== 'Resolved' &&
                    ticket.status !== 'Closed';

                  return (
                    <TableRow
                      key={ticket.id}
                      data-state={isSelected ? 'selected' : undefined}
                      className="group cursor-pointer"
                      onClick={() => navigate(`/reports/${ticket.id}`)}
                    >
                      <TableCell className="w-10 pl-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(ticket.id)} />
                      </TableCell>
                      <TableCell className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8 rounded-md">
                            <AvatarFallback
                              className="rounded-md text-[11px] font-semibold text-white"
                              style={{ backgroundColor: avatarColors[i % avatarColors.length] }}
                            >
                              {ticket.project.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="max-w-xs truncate text-[13px] font-medium">{ticket.subject}</div>
                            <div className="mt-0.5 text-[11px] text-muted-foreground">
                              #{ticket.id} · {ticket.project}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3.5">
                        <Badge variant="outline" className={`gap-1.5 ${sc?.badgeClass}`}>
                          <span className={`size-1.5 rounded-full ${sc?.dotClass}`} />
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3.5">
                        {pc ? (
                          <div className="flex items-center gap-1.5">
                            <span className={`size-1.5 rounded-full ${pc.dotClass}`} />
                            <span className={`text-[12px] ${pc.textClass}`}>{ticket.priority}</span>
                          </div>
                        ) : (
                          <span className="text-[12px] text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3.5">
                        <span className="text-[12px]">{ticket.contactName}</span>
                      </TableCell>
                      <TableCell className="px-4 py-3.5">
                        <span className="text-[12px] text-muted-foreground">{ticket.supportType}</span>
                      </TableCell>
                      <TableCell className="px-4 py-3.5">
                        {assignedEngineers.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="size-6">
                              <AvatarFallback
                                className="text-[10px] font-semibold text-white"
                                style={{ backgroundColor: avatarColors[(i + 2) % avatarColors.length] }}
                              >
                                {assignedEngineers[0].initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[12px] text-muted-foreground truncate max-w-[120px]">
                              {assignedEngineers[0].name}
                              {assignedEngineers.length > 1 ? ` +${assignedEngineers.length - 1}` : ''}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[12px] text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3.5">
                        <div className="text-[12px] text-muted-foreground">{ticket.createdAt.slice(0, 10)}</div>
                        <div className="text-[11px] text-muted-foreground/60">{ticket.updatedAt.slice(0, 10)}</div>
                      </TableCell>
                      <TableCell className="px-4 py-3.5">
                        {ticket.resolutionDueDate ? (
                          <span className={`text-[12px] ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                            {ticket.resolutionDueDate}
                            {isOverdue && (
                              <span className="ml-1 text-[10px] bg-red-50 text-red-600 border border-red-200 rounded px-1 py-0.5">overdue</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-[12px] text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="w-8 h-8 text-muted-foreground" />
                        <div>
                          <div className="text-[14px] font-medium">No tickets found</div>
                          <div className="mt-1 text-[13px] text-muted-foreground">
                            Try adjusting your search or filters
                          </div>
                        </div>
                        {hasFilters && (
                          <Button variant="outline" size="sm" onClick={clearFilters} className="text-[13px]">
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          <div className="flex items-center justify-between border-t bg-background px-6 py-3">
            <span className="text-[12px] text-muted-foreground">
              Showing {filtered.length} of {tickets.length} tickets
              {period !== 'all' && ` · ${PERIOD_LABELS[period]}`}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-[12px] h-7 px-2.5"
              onClick={() => exportToExcel(filtered, engineers, period)}
            >
              <Download className="w-3 h-3" />
              Export all
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
