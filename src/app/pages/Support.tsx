import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Plus, LifeBuoy, TrendingUp, Users, CheckCircle2, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { RowActionsMenu } from '../components/RowActionsMenu';

const engagements = [
  {
    id: 'SUP-001',
    name: 'EPSS Technical Support Q1 2026',
    client: 'EPSS',
    type: 'Technical Support',
    team: 'END Team',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    csat: 72,
    tickets: 18,
    resolved: 14,
    status: 'Active',
    initials: 'EP',
    color: '#7c3aed',
  },
  {
    id: 'SUP-002',
    name: 'IE Innovation Ethiopia Maintenance',
    client: 'IE',
    type: 'Maintenance',
    team: 'ITF Team',
    startDate: '2026-01-15',
    endDate: '2026-06-30',
    csat: 89,
    tickets: 38,
    resolved: 35,
    status: 'Active',
    initials: 'IE',
    color: '#0891b2',
  },
  {
    id: 'SUP-003',
    name: 'ERA/MOTL Infrastructure Support',
    client: 'ERA/MOTL',
    type: 'Technical Support',
    team: 'END Team',
    startDate: '2025-07-01',
    endDate: '2026-06-30',
    csat: 83,
    tickets: 16,
    resolved: 13,
    status: 'Active',
    initials: 'ER',
    color: '#059669',
  },
  {
    id: 'SUP-004',
    name: 'MinT Ministry Network Support',
    client: 'MinT',
    type: 'Network Support',
    team: 'NOC Team',
    startDate: '2025-10-01',
    endDate: '2026-09-30',
    csat: 77,
    tickets: 17,
    resolved: 12,
    status: 'Active',
    initials: 'MI',
    color: '#6b7280',
  },
  {
    id: 'SUP-005',
    name: 'ESLSE Shipping Logistics IT Support',
    client: 'ESLSE',
    type: 'Technical Support',
    team: 'CSD Team',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    csat: 95,
    tickets: 6,
    resolved: 6,
    status: 'Completed',
    initials: 'ES',
    color: '#1d4ed8',
  },
  {
    id: 'SUP-006',
    name: 'MoTI Trade Ministry General Support',
    client: 'MoTI',
    type: 'General Support',
    team: 'CSD Team',
    startDate: '2026-02-01',
    endDate: '2026-07-31',
    csat: 68,
    tickets: 10,
    resolved: 6,
    status: 'Active',
    initials: 'MO',
    color: '#6366f1',
  },
];

const csatColorClass = (score: number) => {
  if (score >= 85) return 'text-emerald-600';
  if (score >= 70) return 'text-amber-600';
  return 'text-red-600';
};

const statusConfig: Record<string, { badgeClass: string; dotClass: string }> = {
  Active: { badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotClass: 'bg-emerald-500' },
  Completed: { badgeClass: 'bg-muted text-muted-foreground border-border', dotClass: 'bg-muted-foreground' },
  Paused: { badgeClass: 'bg-amber-50 text-amber-700 border-amber-200', dotClass: 'bg-amber-500' },
};

export function Support() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = engagements.filter(e => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.client.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    return true;
  });

  const avgCsat = Math.round(engagements.reduce((a, b) => a + b.csat, 0) / engagements.length);
  const activeCount = engagements.filter(e => e.status === 'Active').length;
  const totalTickets = engagements.reduce((a, b) => a + b.tickets, 0);
  const totalResolved = engagements.reduce((a, b) => a + b.resolved, 0);

  const stats = [
    { label: 'Total Engagements', value: engagements.length, icon: LifeBuoy, color: '#0b2235' },
    { label: 'Active', value: activeCount, icon: Activity, color: '#059669' },
    { label: 'Avg. CSAT', value: `${avgCsat}%`, icon: TrendingUp, color: '#2563eb' },
    { label: 'Resolution Rate', value: `${Math.round((totalResolved / totalTickets) * 100)}%`, icon: CheckCircle2, color: '#d97706' },
  ];

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">Support</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Client support engagements and CSAT tracking</p>
          </div>
          <Button
            onClick={() => navigate('/support/new')}
            size="sm"
            className="text-[13px]"
          >
            <Plus className="w-3.5 h-3.5" />
            New Support
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {stats.map((s) => (
            <Card key={s.label} className="gap-0 px-4 py-3">
              <CardContent className="flex items-center gap-3 px-0 pb-0">
                <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <div>
                  <div className="text-[18px] font-semibold">{s.value}</div>
                  <div className="text-[11px] text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search engagements..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 bg-muted pl-9 pr-3 text-[13px]"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-[180px] text-[13px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Technical Support">Technical Support</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Network Support">Network Support</SelectItem>
              <SelectItem value="General Support">General Support</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[150px] text-[13px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Engagements */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-3">
          {filtered.map((eng) => {
            const sc = statusConfig[eng.status];
            const csatClass = csatColorClass(eng.csat);
            const resRate = Math.round((eng.resolved / eng.tickets) * 100);
            return (
              <Card
                key={eng.id}
                className="cursor-pointer p-4 transition-all hover:shadow-sm"
                onClick={() => navigate(`/support/${eng.id}`)}
              >
                <CardContent className="p-0">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="size-10 rounded-lg">
                      <AvatarFallback
                        className="rounded-lg text-[12px] font-semibold text-white"
                        style={{ backgroundColor: eng.color }}
                      >
                        {eng.initials}
                      </AvatarFallback>
                    </Avatar>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{eng.id}</span>
                            <Badge variant="outline" className={`gap-1.5 text-[11px] ${sc.badgeClass}`}>
                              <span className={`size-1.5 rounded-full ${sc.dotClass}`} />
                              {eng.status}
                            </Badge>
                          </div>
                          <h3 className="text-[14px] font-semibold">{eng.name}</h3>
                          <div className="mt-1.5 flex items-center gap-4 text-[12px] text-muted-foreground">
                            <span>{eng.client}</span>
                            <span>·</span>
                            <span>{eng.type}</span>
                            <span>·</span>
                            <div className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {eng.team}
                            </div>
                          </div>
                        </div>

                        {/* Right Metrics */}
                        <div className="flex flex-shrink-0 items-center gap-6">
                          {/* Dates */}
                          <div className="text-right">
                            <div className="text-[11px] text-muted-foreground">Duration</div>
                            <div className="mt-0.5 text-[12px] text-muted-foreground">{eng.startDate} to {eng.endDate}</div>
                          </div>

                          {/* Tickets */}
                          <div className="text-center">
                            <div className="text-[11px] text-muted-foreground">Tickets</div>
                            <div className="text-[15px] font-semibold">{eng.tickets}</div>
                          </div>

                          {/* Resolution */}
                          <div className="w-24">
                            <div className="mb-1 flex items-center justify-between">
                              <div className="text-[11px] text-muted-foreground">Resolution</div>
                              <div className="text-[11px] font-semibold">{resRate}%</div>
                            </div>
                            <Progress value={resRate} className="h-1.5" />
                          </div>

                          {/* CSAT */}
                          <div className="w-24">
                            <div className="mb-1 flex items-center justify-between">
                              <div className="text-[11px] text-muted-foreground">CSAT</div>
                              <div className={`text-[11px] font-semibold ${csatClass}`}>{eng.csat}%</div>
                            </div>
                            <Progress value={eng.csat} className="h-1.5" />
                          </div>

                          <div onClick={(e) => e.stopPropagation()}>
                            <RowActionsMenu
                              entityName={eng.id}
                              onView={() => navigate(`/support/${eng.id}`)}
                              onEdit={() => toast.info(`Edit ${eng.id} coming soon`)}
                              onDelete={() => toast.success(`${eng.id} deleted`)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <Card className="py-16 text-center">
              <CardContent className="p-0">
                <LifeBuoy className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <div className="text-[14px] font-medium">No support engagements found</div>
                <div className="mt-1 text-[13px] text-muted-foreground">Create a new support engagement to get started</div>
                <Button
                  onClick={() => navigate('/support/new')}
                  size="sm"
                  className="mx-auto mt-4 gap-1.5 text-[13px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Support
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}