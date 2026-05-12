import React from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
  PieChart, Pie, Tooltip as RechartsTooltip,
} from 'recharts';
import {
  ArrowLeft, AlertTriangle, CheckCircle2, Clock, MessageSquare,
  ChevronRight, Layers, User, Calendar, Tag, Activity,
  GitBranch, TrendingUp,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '../components/ui/card';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '../components/ui/chart';
import { Separator } from '../components/ui/separator';
import { useServiceDesk } from '../store/serviceDeskStore';

const statusConfig: Record<string, { dotClass: string; badgeClass: string; color: string; label: string }> = {
  Open: { dotClass: 'bg-blue-500', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200', color: '#2563eb', label: 'Open' },
  'In Progress': { dotClass: 'bg-amber-500', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200', color: '#f59e0b', label: 'In Progress' },
  Escalated: { dotClass: 'bg-red-500', badgeClass: 'bg-red-50 text-red-700 border-red-200', color: '#ef4444', label: 'Escalated' },
  Resolved: { dotClass: 'bg-emerald-500', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', color: '#16a34a', label: 'Resolved' },
  Closed: { dotClass: 'bg-slate-400', badgeClass: 'bg-muted text-muted-foreground border-border', color: '#64748b', label: 'Closed' },
};

const priorityConfig: Record<string, { dotClass: string; badgeClass: string; color: string }> = {
  Critical: { dotClass: 'bg-red-500', badgeClass: 'bg-red-50 text-red-700 border-red-200', color: '#ef4444' },
  High: { dotClass: 'bg-amber-500', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200', color: '#f59e0b' },
  Medium: { dotClass: 'bg-blue-500', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200', color: '#3b82f6' },
  Low: { dotClass: 'bg-emerald-500', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', color: '#10b981' },
};

const activityTypeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  created: { label: 'Created', color: '#7c3aed', icon: GitBranch },
  status: { label: 'Status Changed', color: '#2563eb', icon: Activity },
  assigned: { label: 'Assigned', color: '#0891b2', icon: User },
  escalated: { label: 'Escalated', color: '#ef4444', icon: AlertTriangle },
  comment: { label: 'Comment', color: '#64748b', icon: MessageSquare },
};

function daysAgo(isoStr: string) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function durationDays(from: string, to: string) {
  const diff = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

const avatarColors = ['#7c3aed', '#1d4ed8', '#0891b2', '#059669', '#d97706', '#dc2626'];

export function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tickets, engineers } = useServiceDesk();

  const ticket = tickets.find((t) => t.id === id);

  if (!ticket) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-muted/30">
        <AlertTriangle className="w-10 h-10 text-muted-foreground" />
        <div className="text-center">
          <div className="text-[16px] font-semibold">Ticket not found</div>
          <div className="text-[13px] text-muted-foreground mt-1">
            No ticket with ID <span className="font-mono">#{id}</span> exists.
          </div>
        </div>
        <Button onClick={() => navigate('/reports')} variant="outline" size="sm" className="gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Reports
        </Button>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const ageDays = durationDays(ticket.createdAt, new Date().toISOString());
  const isOverdue =
    ticket.resolutionDueDate &&
    ticket.resolutionDueDate < today &&
    ticket.status !== 'Resolved' &&
    ticket.status !== 'Closed';

  const assignedEngineers = ticket.assignedEngineerIds
    .map((eid) => engineers.find((e) => e.id === eid))
    .filter((e): e is (typeof engineers)[number] => Boolean(e));

  const sc = statusConfig[ticket.status];
  const pc = ticket.priority ? priorityConfig[ticket.priority] : null;

  // Activity type breakdown for pie chart
  const activityTypeCounts = ticket.activity.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] ?? 0) + 1;
    return acc;
  }, {});

  const activityPieData = Object.entries(activityTypeCounts).map(([type, count]) => ({
    name: activityTypeConfig[type]?.label ?? type,
    value: count,
    color: activityTypeConfig[type]?.color ?? '#9ca3af',
  }));

  // Status history timeline
  const statusHistory = ticket.activity
    .filter((a): a is Extract<typeof ticket.activity[number], { type: 'status' }> => a.type === 'status')
    .map((a) => ({ from: a.from, to: a.to, at: a.createdAt, author: a.author.name }));

  // Time spent in each status (approximate)
  const statusTimeline: Array<{ status: string; days: number; color: string }> = [];
  const orderedEvents = [
    { status: ticket.activity.find((a) => a.type === 'created')
        ? 'Open'
        : ticket.status,
      at: ticket.createdAt },
    ...statusHistory.map((h) => ({ status: h.to, at: h.at })),
  ];

  for (let i = 0; i < orderedEvents.length; i++) {
    const from = orderedEvents[i].at;
    const to = orderedEvents[i + 1]?.at ?? new Date().toISOString();
    const days = durationDays(from, to);
    const st = orderedEvents[i].status;
    statusTimeline.push({
      status: st,
      days: Math.max(days, 1),
      color: statusConfig[st]?.color ?? '#9ca3af',
    });
  }

  // Comment count by type
  const publicComments = ticket.comments.filter((c) => !c.internal).length;
  const internalComments = ticket.comments.filter((c) => c.internal).length;

  const activityChartConfig = {
    value: { label: 'Events', color: '#7c3aed' },
  } satisfies ChartConfig;

  const statusTimelineConfig = {
    days: { label: 'Days in status', color: '#7c3aed' },
  } satisfies ChartConfig;

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4 flex-shrink-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground mb-3">
          <button
            onClick={() => navigate('/reports')}
            className="hover:text-foreground transition-colors"
          >
            Reports
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">#{ticket.id}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-[13px] text-muted-foreground font-mono">#{ticket.id}</span>
              <Badge variant="outline" className={`gap-1.5 ${sc?.badgeClass}`}>
                <span className={`size-1.5 rounded-full ${sc?.dotClass}`} />
                {ticket.status}
              </Badge>
              {pc && (
                <Badge variant="outline" className={`gap-1.5 ${pc.badgeClass}`}>
                  <span className={`size-1.5 rounded-full ${pc.dotClass}`} />
                  {ticket.priority}
                </Badge>
              )}
              {ticket.escalation && (
                <Badge variant="outline" className="gap-1.5 bg-red-50 text-red-700 border-red-200">
                  <AlertTriangle className="w-3 h-3" />
                  Escalated · {ticket.escalation.target}
                </Badge>
              )}
              {isOverdue && (
                <Badge variant="outline" className="gap-1.5 bg-amber-50 text-amber-700 border-amber-200">
                  <Clock className="w-3 h-3" />
                  Overdue
                </Badge>
              )}
            </div>
            <h1 className="text-[20px] font-semibold tracking-tight leading-snug">{ticket.subject}</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {ticket.project} · {ticket.supportType} · {ticket.contactName}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/reports')}
            className="gap-1.5 text-[13px] flex-shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="gap-3 p-4">
            <div className="mb-1 flex items-start justify-between">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className={`text-[11px] ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                {isOverdue ? 'overdue' : ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'resolved' : 'open'}
              </span>
            </div>
            <div className="mb-1 text-[26px] leading-none font-semibold">{ageDays}</div>
            <div className="text-[12px] text-muted-foreground">Days since created</div>
          </Card>

          <Card className="gap-3 p-4">
            <div className="mb-1 flex items-start justify-between">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">
                {internalComments > 0 ? `${internalComments} internal` : 'all public'}
              </span>
            </div>
            <div className="mb-1 text-[26px] leading-none font-semibold">{ticket.comments.length}</div>
            <div className="text-[12px] text-muted-foreground">
              Comments · {publicComments} public
            </div>
          </Card>

          <Card className="gap-3 p-4">
            <div className="mb-1 flex items-start justify-between">
              <Layers className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mb-1 text-[26px] leading-none font-semibold">{ticket.issues.length}</div>
            <div className="text-[12px] text-muted-foreground">Issues logged</div>
          </Card>

          <Card className="gap-3 p-4">
            <div className="mb-1 flex items-start justify-between">
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mb-1 text-[26px] leading-none font-semibold">{ticket.activity.length}</div>
            <div className="text-[12px] text-muted-foreground">Activity events</div>
          </Card>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-3 gap-5">
          {/* Left col: Charts + Timeline */}
          <div className="col-span-2 space-y-5">

            {/* Charts row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Time in each status */}
              <Card className="gap-0 p-0">
                <CardHeader>
                  <CardTitle className="text-[14px]">Time Per Status</CardTitle>
                  <CardDescription className="text-[12px]">Approximate days spent in each status</CardDescription>
                </CardHeader>
                <CardContent className="pb-5">
                  {statusTimeline.length > 0 ? (
                    <ChartContainer config={statusTimelineConfig} className="h-[160px] w-full">
                      <BarChart
                        data={statusTimeline}
                        layout="vertical"
                        margin={{ top: 0, right: 8, left: 8, bottom: 0 }}
                      >
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                        <XAxis type="number" hide allowDecimals={false} />
                        <YAxis
                          type="category"
                          dataKey="status"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 11 }}
                          width={72}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(value) => (
                                <span className="font-medium">{value} day{value !== 1 ? 's' : ''}</span>
                              )}
                            />
                          }
                        />
                        <Bar dataKey="days" radius={4}>
                          {statusTimeline.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-[160px] flex items-center justify-center text-[13px] text-muted-foreground">
                      No status history
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Activity breakdown pie */}
              <Card className="gap-0 p-0">
                <CardHeader>
                  <CardTitle className="text-[14px]">Activity Breakdown</CardTitle>
                  <CardDescription className="text-[12px]">{ticket.activity.length} total events</CardDescription>
                </CardHeader>
                <CardContent className="pb-5">
                  {activityPieData.length > 0 ? (
                    <div className="flex items-center gap-4">
                      <div style={{ width: 120, height: 120, flexShrink: 0 }}>
                        <PieChart width={120} height={120}>
                          <Pie
                            data={activityPieData}
                            cx={55}
                            cy={55}
                            innerRadius={30}
                            outerRadius={52}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                          >
                            {activityPieData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            formatter={(value, name) => [`${value} event${Number(value) !== 1 ? 's' : ''}`, name]}
                          />
                        </PieChart>
                      </div>
                      <div className="flex flex-col gap-1.5 min-w-0">
                        {activityPieData.map((d) => (
                          <div key={d.name} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                            <span className="text-[11px] text-muted-foreground truncate">{d.name}</span>
                            <span className="text-[11px] font-medium ml-auto">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-[120px] flex items-center justify-center text-[13px] text-muted-foreground">
                      No activity yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Activity Timeline */}
            <Card className="gap-0 p-0">
              <CardHeader className="border-b">
                <CardTitle className="text-[14px]">Activity Timeline</CardTitle>
                <CardDescription className="text-[12px]">{ticket.activity.length} events in chronological order</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-5 py-4 divide-y">
                  {ticket.activity.length === 0 && (
                    <div className="py-8 text-center text-[13px] text-muted-foreground">No activity recorded</div>
                  )}
                  {[...ticket.activity].reverse().map((event, i) => {
                    const cfg = activityTypeConfig[event.type];
                    const Icon = cfg?.icon ?? Activity;
                    return (
                      <div key={event.id ?? i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                        <div
                          className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: (cfg?.color ?? '#9ca3af') + '18' }}
                        >
                          <Icon className="w-3.5 h-3.5" style={{ color: cfg?.color ?? '#9ca3af' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[13px] font-medium">
                              {event.type === 'created' && (
                                <>Ticket created{event.author?.name ? ` by ${event.author.name}` : ''}</>
                              )}
                              {event.type === 'status' && (
                                <>
                                  Status changed{' '}
                                  <Badge variant="outline" className={`gap-1 text-[11px] ${statusConfig[event.from]?.badgeClass}`}>
                                    {event.from}
                                  </Badge>{' '}
                                  →{' '}
                                  <Badge variant="outline" className={`gap-1 text-[11px] ${statusConfig[event.to]?.badgeClass}`}>
                                    {event.to}
                                  </Badge>
                                </>
                              )}
                              {event.type === 'assigned' && (
                                <>Assigned to <span className="font-semibold">{event.engineer?.name}</span></>
                              )}
                              {event.type === 'escalated' && (
                                <>Escalated to <span className="font-semibold">{event.target}</span></>
                              )}
                              {event.type === 'comment' && <>Comment added</>}
                            </span>
                            <span className="text-[11px] text-muted-foreground flex-shrink-0">
                              {new Date(event.createdAt).toLocaleString('en', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {event.type === 'status' && event.reason && (
                            <div className="text-[12px] text-muted-foreground mt-0.5">
                              Reason: {event.reason}
                            </div>
                          )}
                          {event.type === 'escalated' && (
                            <div className="text-[12px] text-muted-foreground mt-0.5">{event.reason}</div>
                          )}
                          {event.type === 'created' && event.detail && (
                            <div className="text-[12px] text-muted-foreground mt-0.5">{event.detail}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="gap-0 p-0">
              <CardHeader className="border-b">
                <CardTitle className="text-[14px]">Description</CardTitle>
              </CardHeader>
              <CardContent className="px-5 py-4">
                <p className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {ticket.description || 'No description provided.'}
                </p>
              </CardContent>
            </Card>

            {/* Issues */}
            {ticket.issues.length > 0 && (
              <Card className="gap-0 p-0">
                <CardHeader className="border-b">
                  <CardTitle className="text-[14px]">Issues Logged</CardTitle>
                  <CardDescription className="text-[12px]">{ticket.issues.length} issue{ticket.issues.length !== 1 ? 's' : ''}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {ticket.issues.map((issue, i) => (
                      <div key={issue.id} className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 w-6 h-6 rounded-md bg-muted flex items-center justify-center text-[11px] font-semibold text-muted-foreground flex-shrink-0">
                            {i + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-medium">{issue.title}</div>
                            <div className="text-[12px] text-muted-foreground mt-0.5">{issue.description}</div>
                            {issue.attachments.length > 0 && (
                              <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Layers className="w-3 h-3" />
                                {issue.attachments.length} attachment{issue.attachments.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments */}
            {ticket.comments.length > 0 && (
              <Card className="gap-0 p-0">
                <CardHeader className="border-b">
                  <CardTitle className="text-[14px]">Comments</CardTitle>
                  <CardDescription className="text-[12px]">
                    {publicComments} public · {internalComments} internal
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {ticket.comments.map((comment) => (
                      <div key={comment.id} className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="size-7 flex-shrink-0">
                            <AvatarFallback
                              className="text-[10px] font-semibold text-white"
                              style={{ backgroundColor: avatarColors[comment.author.name.charCodeAt(0) % avatarColors.length] }}
                            >
                              {comment.author.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[13px] font-medium">{comment.author.name}</span>
                              <span className="text-[11px] text-muted-foreground">{comment.author.role}</span>
                              {comment.internal && (
                                <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 h-4 px-1.5">
                                  Internal
                                </Badge>
                              )}
                              <span className="text-[11px] text-muted-foreground ml-auto">
                                {new Date(comment.createdAt).toLocaleDateString('en', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            <p className="text-[13px] text-muted-foreground leading-relaxed">{comment.body}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Ticket Details */}
            <Card className="gap-0 p-0">
              <CardHeader className="border-b">
                <CardTitle className="text-[14px]">Ticket Details</CardTitle>
              </CardHeader>
              <CardContent className="px-5 py-4 space-y-4">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Status</div>
                  <Badge variant="outline" className={`gap-1.5 ${sc?.badgeClass}`}>
                    <span className={`size-1.5 rounded-full ${sc?.dotClass}`} />
                    {ticket.status}
                  </Badge>
                </div>

                {pc && (
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Priority</div>
                    <Badge variant="outline" className={`gap-1.5 ${pc.badgeClass}`}>
                      <span className={`size-1.5 rounded-full ${pc.dotClass}`} />
                      {ticket.priority}
                    </Badge>
                  </div>
                )}

                <Separator />

                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Project</div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-semibold"
                      style={{ backgroundColor: avatarColors[ticket.project.charCodeAt(0) % avatarColors.length] }}
                    >
                      {ticket.project.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[13px]">{ticket.project}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Support Type</div>
                  <div className="text-[13px]">{ticket.supportType}</div>
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Contact</div>
                  <div className="text-[13px]">{ticket.contactName}</div>
                </div>

                <Separator />

                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Assigned To</div>
                  {assignedEngineers.length > 0 ? (
                    <div className="space-y-2">
                      {assignedEngineers.map((eng, i) => (
                        <div key={eng.id} className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback
                              className="text-[10px] font-semibold text-white"
                              style={{ backgroundColor: avatarColors[i % avatarColors.length] }}
                            >
                              {eng.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-[12px] font-medium">{eng.name}</div>
                            <div className="text-[11px] text-muted-foreground">{eng.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[13px] text-muted-foreground">Unassigned</div>
                  )}
                </div>

                <Separator />

                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Created</div>
                  <div className="text-[13px]">
                    {new Date(ticket.createdAt).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{daysAgo(ticket.createdAt)}</div>
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Last Updated</div>
                  <div className="text-[13px]">
                    {new Date(ticket.updatedAt).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{daysAgo(ticket.updatedAt)}</div>
                </div>

                {ticket.resolutionDueDate && (
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Due Date</div>
                    <div className={`text-[13px] ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                      {new Date(ticket.resolutionDueDate).toLocaleDateString('en', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </div>
                    {isOverdue && (
                      <div className="text-[11px] text-red-500 mt-0.5">Past due</div>
                    )}
                  </div>
                )}

                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Source</div>
                  <div className="text-[13px] capitalize">{ticket.source.type}</div>
                </div>
              </CardContent>
            </Card>

            {/* Escalation info */}
            {ticket.escalation && (
              <Card className="gap-0 p-0 border-red-200">
                <CardHeader className="border-b border-red-100 bg-red-50/50 rounded-t-xl">
                  <CardTitle className="text-[14px] text-red-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Escalation Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 py-4 space-y-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Escalated To</div>
                    <div className="text-[13px] font-medium">{ticket.escalation.target}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Escalated At</div>
                    <div className="text-[13px]">
                      {new Date(ticket.escalation.escalatedAt).toLocaleDateString('en', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Reason</div>
                    <div className="text-[13px] text-muted-foreground">{ticket.escalation.reason}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick actions */}
            <Card className="gap-0 p-0">
              <CardHeader className="border-b">
                <CardTitle className="text-[14px]">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="px-5 py-4 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-[13px]"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Open in Tickets
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-[13px]"
                  onClick={() => navigate('/reports')}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
