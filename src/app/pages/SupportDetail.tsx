import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ChevronRight,
  LifeBuoy,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle2,
  Ticket,
  Clock,
  MessageSquare,
  Paperclip,
  Send,
  Edit2,
  Pause,
  XCircle,
  Activity,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { RowActionsMenu } from '../components/RowActionsMenu';

const engagement = {
  id: 'SUP-001',
  name: 'EPSS Technical Support Q1 2026',
  client: 'EPSS',
  type: 'Technical Support',
  team: 'END Team',
  agent: 'Wongel Wondyifraw',
  startDate: '2026-01-01',
  endDate: '2026-03-31',
  csat: 72,
  tickets: 18,
  resolved: 14,
  open: 4,
  status: 'Active',
  initials: 'EP',
  color: '#7c3aed',
  notes: 'This engagement covers full technical support for EPSS including FortiGate firewall management, Cisco switch configuration, and server infrastructure. The client requires weekly status updates and priority response within 2 hours for critical issues.',
};

const tickets = [
  { id: '#00135', subject: 'Diredawa site WiFi access issue', priority: 'High', status: 'Closed', date: '2026-01-03', agent: 'WW' },
  { id: '#00142', subject: 'FortiGate VPN connectivity drop', priority: 'Critical', status: 'Open', date: '2026-01-08', agent: 'SS' },
  { id: '#00158', subject: 'Cisco switch port configuration', priority: 'Medium', status: 'Pending', date: '2026-01-15', agent: 'WW' },
  { id: '#00163', subject: 'Server backup verification request', priority: 'Low', status: 'Closed', date: '2026-01-18', agent: 'MM' },
  { id: '#00177', subject: 'Network latency on MPLS link', priority: 'High', status: 'Open', date: '2026-01-25', agent: 'DB' },
];

const timeline = [
  { id: 1, type: 'created', author: 'Abraham Tayu', initials: 'AT', color: '#7c3aed', time: '45 days ago', content: 'Support engagement created and activated.' },
  { id: 2, type: 'comment', author: 'Wongel Wondyifraw', initials: 'WW', color: '#1d4ed8', time: '43 days ago', content: 'Kickoff call completed with EPSS team. Infrastructure assessment scheduled for next week.' },
  { id: 3, type: 'update', author: 'System', initials: 'SY', color: '#6c757d', time: '40 days ago', content: 'CSAT survey sent to EPSS. Current score: 72%.' },
  { id: 4, type: 'comment', author: 'Abraham Tayu', initials: 'AT', color: '#7c3aed', time: '30 days ago', content: 'Q1 mid-point review completed. Ticket resolution rate at 78%. Escalation protocol reviewed with client.' },
];

const priorityConfig: Record<string, { badgeClass: string }> = {
  Critical: { badgeClass: 'bg-red-50 text-red-700 border-red-200' },
  High: { badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' },
  Medium: { badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  Low: { badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const statusConfig: Record<string, { badgeClass: string; dotClass: string; textClass: string }> = {
  Open: { badgeClass: 'bg-blue-50 text-blue-700 border-blue-200', dotClass: 'bg-blue-500', textClass: 'text-blue-700' },
  Pending: { badgeClass: 'bg-amber-50 text-amber-700 border-amber-200', dotClass: 'bg-amber-500', textClass: 'text-amber-700' },
  Closed: { badgeClass: 'bg-muted text-muted-foreground border-border', dotClass: 'bg-muted-foreground', textClass: 'text-muted-foreground' },
  Active: { badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotClass: 'bg-emerald-500', textClass: 'text-emerald-700' },
};

const csatColorClass = (score: number) => {
  if (score >= 85) return 'text-emerald-600';
  if (score >= 70) return 'text-amber-600';
  return 'text-red-600';
};

export function SupportDetail() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tickets' | 'activity'>('tickets');
  const [comment, setComment] = useState('');

  const sc = statusConfig[engagement.status];
  const csatClass = csatColorClass(engagement.csat);
  const resRate = Math.round((engagement.resolved / engagement.tickets) * 100);

  const metrics = [
    { label: 'Total Tickets', value: engagement.tickets, icon: Ticket, color: '#0b2235' },
    { label: 'Resolved', value: engagement.resolved, icon: CheckCircle2, color: '#059669' },
    { label: 'Open', value: engagement.open, icon: AlertCircle, color: '#2563eb' },
    { label: 'CSAT Score', value: `${engagement.csat}%`, icon: BarChart3, color: '#d97706' },
    { label: 'Resolution Rate', value: `${resRate}%`, icon: TrendingUp, color: '#d97706' },
  ];

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Top Action Bar */}
      <div className="flex h-[48px] shrink-0 items-center gap-1 border-b bg-background px-6">
        <Button
          onClick={() => navigate('/support')}
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2.5 text-[12px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Support
        </Button>
        <Separator orientation="vertical" className="mx-1 h-4" />
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="px-1 text-[12px] text-muted-foreground">{engagement.id}</span>
        <Separator orientation="vertical" className="mx-1 h-4" />
        <Badge variant="outline" className={`gap-1.5 text-[11px] ${sc.badgeClass}`}>
          <span className={`size-1.5 rounded-full ${sc.dotClass}`} />
          {engagement.status}
        </Badge>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2.5 text-[12px]">
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2.5 text-[12px] text-amber-700 hover:text-amber-800">
            <Pause className="w-3.5 h-3.5" />
            Pause
          </Button>
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2.5 text-[12px] text-red-700 hover:text-red-800">
            <XCircle className="w-3.5 h-3.5" />
            Close
          </Button>
          <Button
            onClick={() => navigate('/tickets/new')}
            size="sm"
            className="h-7 gap-1.5 px-2.5 text-[12px]"
          >
            <Ticket className="w-3.5 h-3.5" />
            New Ticket
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Main Content */}
        <div className="min-w-0 flex-1 space-y-4 overflow-y-auto p-6">
          {/* Engagement Header */}
          <Card className="p-5">
            <div className="flex items-start gap-4">
              <Avatar className="size-11 rounded-lg">
                <AvatarFallback className="rounded-lg bg-violet-600 text-[13px] font-semibold text-white">
                  {engagement.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {engagement.id}
                  </span>
                </div>
                <h1 className="text-[17px] leading-snug font-semibold">
                  {engagement.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-[12px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {engagement.startDate} → {engagement.endDate}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {engagement.team}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <LifeBuoy className="w-3.5 h-3.5" />
                    {engagement.type}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {engagement.notes && (
              <div className="mt-4 border-t pt-4">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Scope Notes</div>
                <p className="text-[13px] leading-relaxed text-muted-foreground">{engagement.notes}</p>
              </div>
            )}
          </Card>

          {/* Metrics */}
          <div className="grid grid-cols-5 gap-3">
            {metrics.map((m) => (
              <Card key={m.label} className="px-4 py-3">
                <CardContent className="p-0">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted">
                    <m.icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                  </div>
                </div>
                <div className={`text-[18px] font-semibold ${m.label === 'CSAT Score' ? csatClass : ''}`}>{m.value}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{m.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Progress Bars */}
          <Card className="p-5">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-medium text-muted-foreground">Resolution Rate</span>
                  <span className="text-[13px] font-semibold">{resRate}%</span>
                </div>
                <Progress value={resRate} className="h-2" />
                <div className="mt-1.5 text-[11px] text-muted-foreground">{engagement.resolved} of {engagement.tickets} tickets resolved</div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-medium text-muted-foreground">CSAT Score</span>
                  <span className={`text-[13px] font-semibold ${csatClass}`}>{engagement.csat}%</span>
                </div>
                <Progress value={engagement.csat} className="h-2" />
                <div className="mt-1.5 text-[11px] text-muted-foreground">
                  {engagement.csat >= 85 ? 'Excellent' : engagement.csat >= 70 ? 'Good — room for improvement' : 'Needs immediate attention'}
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Card className="overflow-hidden p-0">
            <CardHeader className="border-b px-0 pb-0">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'tickets' | 'activity')}>
                <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
                  <TabsTrigger value="tickets" className="rounded-none border-b-2 border-transparent px-5 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent">Tickets</TabsTrigger>
                  <TabsTrigger value="activity" className="rounded-none border-b-2 border-transparent px-5 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent">Activity Log</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            {activeTab === 'tickets' && (
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">ID</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Subject</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Priority</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Date</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Agent</TableHead>
                      <TableHead className="w-10 pr-4" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((t, i) => {
                      const pc = priorityConfig[t.priority];
                      const tsc = statusConfig[t.status];
                      return (
                        <TableRow
                          key={i}
                          className="group cursor-pointer"
                          onClick={() => navigate('/tickets/1')}
                        >
                          <TableCell className="px-5 py-3.5">
                            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{t.id}</span>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <span className="text-[13px] font-medium">{t.subject}</span>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <Badge variant="outline" className={`text-[11px] ${pc.badgeClass}`}>
                              {t.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`size-1.5 rounded-full ${tsc.dotClass}`} />
                              <span className={`text-[12px] font-medium ${tsc.textClass}`}>{t.status}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <span className="text-[12px] text-muted-foreground">{t.date}</span>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <Avatar className="size-6">
                              <AvatarFallback className="text-[10px] font-semibold">{t.agent}</AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="pr-4 py-3.5" onClick={(event) => event.stopPropagation()}>
                            <RowActionsMenu
                              entityName={t.id}
                              onView={() => navigate(`/tickets/${t.id}`)}
                              onEdit={() => toast.info(`Edit ${t.id} coming soon`)}
                              onDelete={() => toast.success(`${t.id} deleted`)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            )}

            {activeTab === 'activity' && (
              <>
                <CardContent className="space-y-5 p-5">
                  {timeline.map((item, i) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <Avatar className="size-7">
                          <AvatarFallback
                            className="text-[10px] font-semibold text-white"
                            style={{ backgroundColor: item.color }}
                          >
                            {item.initials}
                          </AvatarFallback>
                        </Avatar>
                        {i < timeline.length - 1 && <div className="mt-2 w-px flex-1 bg-border" />}
                      </div>
                      <div className="flex-1 min-w-0 pb-2">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-[13px] font-medium">{item.author}</span>
                          <span className="text-[11px] text-muted-foreground">{item.time}</span>
                        </div>
                        <div className="rounded-md bg-muted p-3 text-[13px] leading-relaxed text-muted-foreground">
                          {item.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>

                {/* Reply Box */}
                <CardContent className="border-t px-5 py-4">
                  <div className="overflow-hidden rounded-md border">
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a note or update..."
                      rows={3}
                      className="resize-none border-0 px-4 py-3 text-[13px] focus-visible:ring-0"
                    />
                    <div className="flex items-center justify-between border-t bg-muted px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="size-7">
                          <Paperclip className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <Button size="sm" className="h-7 gap-1.5 px-3 text-[12px]">
                        <Send className="w-3 h-3" />
                        Post Update
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="w-[260px] shrink-0 overflow-y-auto border-l bg-background">
          <Card className="rounded-none border-0 border-b p-0">
            <CardHeader className="p-4">
              <CardTitle className="text-[11px] uppercase tracking-wider text-muted-foreground">Engagement Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4 pt-0">
              {[
                { label: 'Status', value: engagement.status },
                { label: 'Client', value: engagement.client },
                { label: 'Type', value: engagement.type },
                { label: 'Team', value: engagement.team },
                { label: 'Lead Agent', value: engagement.agent },
                { label: 'Start Date', value: engagement.startDate },
                { label: 'End Date', value: engagement.endDate },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="mb-0.5 text-[11px] text-muted-foreground">{label}</div>
                  <div className="text-[13px] font-medium">{value}</div>
                </div>
              ))}
              <Button className="mt-2 h-8 w-full text-[13px]">Update Engagement</Button>
            </CardContent>
          </Card>

          <Card className="rounded-none border-0 p-0">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-[11px] uppercase tracking-wider text-muted-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 px-4 pb-4 pt-0">
              <Button
                onClick={() => navigate('/tickets/new')}
                className="h-8 w-full justify-start gap-2 text-[12px]"
              >
                <Ticket className="w-3.5 h-3.5" />
                Create Ticket
              </Button>
              <Button variant="outline" className="h-8 w-full justify-start gap-2 text-[12px]">
                <MessageSquare className="w-3.5 h-3.5" />
                Send CSAT Survey
              </Button>
              <Button variant="outline" className="h-8 w-full justify-start gap-2 text-[12px]">
                <Clock className="w-3.5 h-3.5" />
                Log Activity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
