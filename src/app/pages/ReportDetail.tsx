import React from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, AlertTriangle, MessageSquare, ChevronRight,
  Layers, User, Activity, GitBranch,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useServiceDesk } from '../store/serviceDeskStore';

// ── Config ──────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { dotClass: string; badgeClass: string }> = {
  Open:          { dotClass: 'bg-blue-500',    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  'In Progress': { dotClass: 'bg-amber-500',   badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  Escalated:     { dotClass: 'bg-red-500',     badgeClass: 'bg-red-50 text-red-700 border-red-200' },
  Resolved:      { dotClass: 'bg-emerald-500', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Closed:        { dotClass: 'bg-slate-400',   badgeClass: 'bg-muted text-muted-foreground border-border' },
};

const priorityConfig: Record<string, { dotClass: string; badgeClass: string }> = {
  Critical: { dotClass: 'bg-red-500',    badgeClass: 'bg-red-50 text-red-700 border-red-200' },
  High:     { dotClass: 'bg-amber-500',  badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  Medium:   { dotClass: 'bg-blue-500',   badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  Low:      { dotClass: 'bg-emerald-500',badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const activityConfig: Record<string, { color: string; icon: React.ElementType }> = {
  created:   { color: '#7c3aed', icon: GitBranch },
  status:    { color: '#2563eb', icon: Activity },
  assigned:  { color: '#0891b2', icon: User },
  escalated: { color: '#ef4444', icon: AlertTriangle },
  comment:   { color: '#64748b', icon: MessageSquare },
};

const avatarColors = ['#7c3aed', '#1d4ed8', '#0891b2', '#059669', '#d97706', '#dc2626'];

// ── Helpers ──────────────────────────────────────────────────────────────────

function daysAgo(isoStr: string) {
  const days = Math.floor((Date.now() - new Date(isoStr).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function fmt(isoStr: string) {
  return new Date(isoStr).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Reusable label/value row used inside section cards
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b last:border-0">
      <span className="text-[12px] text-muted-foreground font-medium flex-shrink-0 w-32">{label}</span>
      <div className="flex-1 text-right text-[13px]">{children}</div>
    </div>
  );
}

// Section label above a card
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold px-1 mb-2">
      {children}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

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
  const publicComments = ticket.comments.filter((c) => !c.internal).length;
  const internalComments = ticket.comments.filter((c) => c.internal).length;

  return (
    <div className="flex h-full flex-col bg-muted/30">

      {/* ── Page header ── */}
      <div className="border-b bg-background px-6 py-4 flex-shrink-0">
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

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-3 gap-5">

          {/* ════════════════════════════════════════
              LEFT — structured detail sections
          ════════════════════════════════════════ */}
          <div className="col-span-2 space-y-6">

            {/* Section 1 — Ticket info */}
            <div>
              <SectionLabel>Ticket Information</SectionLabel>
              <Card className="gap-0 p-0">
                <CardContent className="px-5 py-0">
                  <Row label="Status">
                    <Badge variant="outline" className={`gap-1.5 ${sc?.badgeClass}`}>
                      <span className={`size-1.5 rounded-full ${sc?.dotClass}`} />
                      {ticket.status}
                    </Badge>
                  </Row>
                  <Row label="Priority">
                    {pc ? (
                      <Badge variant="outline" className={`gap-1.5 ${pc.badgeClass}`}>
                        <span className={`size-1.5 rounded-full ${pc.dotClass}`} />
                        {ticket.priority}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </Row>
                  <Row label="Project">
                    <div className="flex items-center justify-end gap-2">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-semibold"
                        style={{ backgroundColor: avatarColors[ticket.project.charCodeAt(0) % avatarColors.length] }}
                      >
                        {ticket.project.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{ticket.project}</span>
                    </div>
                  </Row>
                  <Row label="Support Type">
                    <span>{ticket.supportType}</span>
                  </Row>
                  <Row label="Client">
                    <span>{ticket.contactName}</span>
                  </Row>
                  <Row label="Source">
                    <span className="capitalize">{ticket.source.type}</span>
                  </Row>
                  <Row label="Ticket ID">
                    <span className="font-mono text-muted-foreground">#{ticket.id}</span>
                  </Row>
                </CardContent>
              </Card>
            </div>

            {/* Section 2 — Assignment */}
            <div>
              <SectionLabel>Assignment</SectionLabel>
              <Card className="gap-0 p-0">
                <CardContent className="px-5 py-4">
                  {assignedEngineers.length > 0 ? (
                    <div className="divide-y">
                      {assignedEngineers.map((eng, i) => (
                        <div key={eng.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                          <Avatar className="size-8">
                            <AvatarFallback
                              className="text-[11px] font-semibold text-white"
                              style={{ backgroundColor: avatarColors[i % avatarColors.length] }}
                            >
                              {eng.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium">{eng.name}</div>
                            <div className="text-[12px] text-muted-foreground">{eng.email}</div>
                          </div>
                          {ticket.assignedAt && i === 0 && (
                            <div className="text-[11px] text-muted-foreground flex-shrink-0">
                              Assigned {daysAgo(ticket.assignedAt)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-2 text-[13px] text-muted-foreground">
                      This ticket has not been assigned to an engineer.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Section 3 — Dates */}
            <div>
              <SectionLabel>Dates</SectionLabel>
              <Card className="gap-0 p-0">
                <CardContent className="px-5 py-0">
                  <Row label="Created">
                    <div>
                      <div>{fmt(ticket.createdAt)}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{daysAgo(ticket.createdAt)}</div>
                    </div>
                  </Row>
                  <Row label="Last Updated">
                    <div>
                      <div>{fmt(ticket.updatedAt)}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{daysAgo(ticket.updatedAt)}</div>
                    </div>
                  </Row>
                  <Row label="Due Date">
                    {ticket.resolutionDueDate ? (
                      <div>
                        <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
                          {fmt(ticket.resolutionDueDate)}
                        </div>
                        {isOverdue && (
                          <div className="text-[11px] text-red-500 mt-0.5">Past due</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </Row>
                </CardContent>
              </Card>
            </div>

            {/* Section 4 — Escalation (conditional) */}
            {ticket.escalation && (
              <div>
                <SectionLabel>Escalation</SectionLabel>
                <Card className="gap-0 p-0 border-red-200">
                  <CardHeader className="border-b border-red-100 bg-red-50/50 rounded-t-xl py-3 px-5">
                    <CardTitle className="text-[13px] text-red-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      This ticket has been escalated
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 py-0">
                    <Row label="Escalated To">
                      <span className="font-medium">{ticket.escalation.target}</span>
                    </Row>
                    <Row label="Date">
                      <span>{fmt(ticket.escalation.escalatedAt)}</span>
                    </Row>
                    <Row label="Reason">
                      <span className="text-muted-foreground leading-relaxed">{ticket.escalation.reason}</span>
                    </Row>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════
              RIGHT — secondary content
          ════════════════════════════════════════ */}
          <div className="space-y-5">

            {/* Description */}
            <Card className="gap-0 p-0">
              <CardHeader className="border-b py-3 px-5">
                <CardTitle className="text-[13px]">Description</CardTitle>
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
                <CardHeader className="border-b py-3 px-5">
                  <CardTitle className="text-[13px]">Issues</CardTitle>
                  <CardDescription className="text-[11px]">
                    {ticket.issues.length} logged
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {ticket.issues.map((issue, i) => (
                      <div key={issue.id} className="flex items-start gap-3 px-5 py-3">
                        <div className="mt-0.5 w-5 h-5 rounded bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium">{issue.title}</div>
                          <div className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">
                            {issue.description}
                          </div>
                          {issue.attachments.length > 0 && (
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Layers className="w-3 h-3" />
                              {issue.attachments.length} attachment{issue.attachments.length !== 1 ? 's' : ''}
                            </div>
                          )}
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
                <CardHeader className="border-b py-3 px-5">
                  <CardTitle className="text-[13px]">Comments</CardTitle>
                  <CardDescription className="text-[11px]">
                    {publicComments} public · {internalComments} internal
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {ticket.comments.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3 px-5 py-3">
                        <Avatar className="size-6 flex-shrink-0">
                          <AvatarFallback
                            className="text-[10px] font-semibold text-white"
                            style={{
                              backgroundColor:
                                avatarColors[comment.author.name.charCodeAt(0) % avatarColors.length],
                            }}
                          >
                            {comment.author.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[12px] font-medium">{comment.author.name}</span>
                            {comment.internal && (
                              <Badge
                                variant="outline"
                                className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 h-4 px-1.5"
                              >
                                Internal
                              </Badge>
                            )}
                            <span className="text-[11px] text-muted-foreground ml-auto">
                              {new Date(comment.createdAt).toLocaleDateString('en', {
                                month: 'short', day: 'numeric',
                              })}
                            </span>
                          </div>
                          <p className="text-[12px] text-muted-foreground leading-relaxed">
                            {comment.body}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Timeline */}
            <Card className="gap-0 p-0">
              <CardHeader className="border-b py-3 px-5">
                <CardTitle className="text-[13px]">Activity</CardTitle>
                <CardDescription className="text-[11px]">
                  {ticket.activity.length} event{ticket.activity.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-5 py-3 divide-y">
                  {ticket.activity.length === 0 && (
                    <div className="py-6 text-center text-[13px] text-muted-foreground">
                      No activity recorded
                    </div>
                  )}
                  {[...ticket.activity].reverse().map((event, i) => {
                    const cfg = activityConfig[event.type];
                    const Icon = cfg?.icon ?? Activity;
                    return (
                      <div key={event.id ?? i} className="flex items-start gap-2.5 py-3 first:pt-0 last:pb-0">
                        <div
                          className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: (cfg?.color ?? '#9ca3af') + '18' }}
                        >
                          <Icon className="w-3 h-3" style={{ color: cfg?.color ?? '#9ca3af' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[12px] font-medium leading-snug">
                              {event.type === 'created' && (
                                <>Ticket created{event.author?.name ? ` by ${event.author.name}` : ''}</>
                              )}
                              {event.type === 'status' && (
                                <>
                                  Status{' '}
                                  <Badge variant="outline" className={`gap-1 text-[10px] ${statusConfig[event.from]?.badgeClass}`}>
                                    {event.from}
                                  </Badge>
                                  {' → '}
                                  <Badge variant="outline" className={`gap-1 text-[10px] ${statusConfig[event.to]?.badgeClass}`}>
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
                            <span className="text-[10px] text-muted-foreground flex-shrink-0 mt-0.5">
                              {new Date(event.createdAt).toLocaleString('en', {
                                month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {event.type === 'status' && event.reason && (
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {event.reason}
                            </div>
                          )}
                          {event.type === 'escalated' && (
                            <div className="text-[11px] text-muted-foreground mt-0.5">{event.reason}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
