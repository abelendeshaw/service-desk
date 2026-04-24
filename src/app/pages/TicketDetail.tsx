import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, MessageSquare, StickyNote, TrendingUp,
  X, Trash2, BookOpen, Plus, Users, UserPlus,
  ChevronDown, Pencil, Clock,
  Building2, AlertTriangle, CheckCircle2, Send,
  Paperclip, ChevronRight
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { useServiceDesk } from '../store/serviceDeskStore';

const iconMap: Record<string, any> = {
  created: MessageSquare,
  assigned: Users,
  comment: MessageSquare,
  status: CheckCircle2,
};

export function TicketDetail() {
  const navigate = useNavigate();
  const params = useParams();
  const ticketId = (params.id ?? '').replace('#', '');
  const { tickets, engineers, assignTicket, updateTicketStatus, escalateTicket, addTicketComment } = useServiceDesk();
  const ticket = tickets.find((t) => t.id === ticketId);
  const [activeTab, setActiveTab] = useState<'activity' | 'notes'>('activity');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('Open');
  const [priority, setPriority] = useState('');

  const statusOptions = ['Open', 'In Progress', 'Escalated', 'Resolved', 'Closed'];
  const priorityOptions = ['Critical', 'High', 'Medium', 'Low'];

  const statusColors: Record<string, { className: string; dotClass: string }> = {
    Open: { className: 'bg-blue-50 text-blue-700 border-blue-200', dotClass: 'bg-blue-500' },
    "In Progress": { className: 'bg-amber-50 text-amber-700 border-amber-200', dotClass: 'bg-amber-500' },
    Escalated: { className: 'bg-red-50 text-red-700 border-red-200', dotClass: 'bg-red-500' },
    Resolved: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotClass: 'bg-emerald-500' },
    Closed: { className: 'bg-muted text-muted-foreground border-border', dotClass: 'bg-muted-foreground' },
  };

  React.useEffect(() => {
    if (!ticket) return;
    setStatus(ticket.status);
    setPriority(ticket.priority ?? '');
  }, [ticket]);

  const sc = statusColors[status] ?? statusColors.Open;

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {!ticket ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-[13px] text-muted-foreground">Ticket not found.</div>
        </div>
      ) : (
      <>
      {/* Top Action Bar */}
      <div className="flex h-[48px] shrink-0 items-center gap-1 border-b bg-background px-6">
        <Button
          onClick={() => navigate('/tickets')}
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2.5 text-[12px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Tickets
        </Button>

        <Separator orientation="vertical" className="mx-1 h-4" />

        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="px-1 text-[12px] text-muted-foreground">#{ticket.id}</span>

        <Separator orientation="vertical" className="mx-1 h-4" />

        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2.5 text-[12px]"
          onClick={() => {
            const reason = window.prompt("Escalation reason?");
            if (!reason) return;
            escalateTicket({ ticketId: ticket.id, target: "Support Manager", reason });
            setStatus("Escalated");
          }}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Escalate
        </Button>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2.5 text-[12px] text-red-600 hover:text-red-700">
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </Button>
          <Button size="sm" className="h-7 gap-1.5 px-2.5 text-[12px]">
            <Plus className="w-3.5 h-3.5" />
            Create Article
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Main Content */}
        <div className="min-w-0 flex-1 space-y-4 overflow-y-auto p-6">

          {/* Ticket Header */}
          <Card className="p-5">
            <div className="flex items-start gap-4">
              <Avatar className="size-10 rounded-lg">
                <AvatarFallback className="rounded-lg bg-violet-600 text-[13px] font-semibold text-white">
                  {ticket.project.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">#{ticket.id}</span>
                  <Badge variant="outline" className={`gap-1.5 text-[11px] ${sc.className}`}>
                    <span className={`size-1.5 rounded-full ${sc.dotClass}`} />
                    {status}
                  </Badge>
                </div>
                <h1 className="text-[16px] leading-snug font-semibold">{ticket.subject}</h1>
                <div className="mt-2 flex items-center gap-4 text-[12px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Created {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {ticket.project}
                  </div>
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {ticket.resolutionDueDate ? `Resolution due ${ticket.resolutionDueDate}` : 'No due date'}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Description */}
          <Card className="p-5">
            <h3 className="mb-3 text-[13px] font-semibold">Description</h3>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              {ticket.description}
            </p>
          </Card>

          {/* Teams & Agents */}
          <Card className="p-5">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[12px] font-semibold">TEAMS</span>
                    <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px]">1</Badge>
                  </div>
                  <Button variant="link" className="h-auto p-0 text-[11px]">Manage</Button>
                </div>
                <div className="space-y-2">
                  {['Wongel Wondyifraw', 'Sisay Shiferaw', 'Masresha Melese'].map((name, i) => (
                    <div key={name} className="flex items-center gap-2.5">
                      <Avatar className="size-7">
                        <AvatarFallback
                          className="text-[11px] font-semibold text-white"
                          style={{ backgroundColor: ['#1d4ed8', '#7c3aed', '#0891b2'][i] }}
                        >
                          {name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[13px] text-muted-foreground">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[12px] font-semibold">AGENTS</span>
                    <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px]">3</Badge>
                  </div>
                  <Button variant="link" className="h-auto gap-0.5 p-0 text-[11px]">
                    Assign <ChevronDown className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-2 text-[13px] text-muted-foreground">
                  <div className="flex items-center gap-2 rounded-md border border-dashed p-2.5">
                    <UserPlus className="w-3.5 h-3.5" />
                    No agents assigned yet
                  </div>
                  <Button variant="link" className="h-auto gap-0.5 p-0 text-[12px]">
                    Assign teams & agents <ChevronDown className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Issues */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold">Ticket Issues</h3>
              <Button variant="link" className="h-auto gap-1 p-0 text-[12px]">
                <Plus className="w-3.5 h-3.5" /> Add Issue
              </Button>
            </div>
            <div className="rounded-md border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">Issue Name</div>
                  <div className="text-[13px] font-medium">FortiGate, Cisco Switch and server access through WiFi issue</div>
                  <Button variant="link" className="mt-2 h-auto gap-1 p-0 text-[12px]">
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                </div>
                <div className="flex-shrink-0">
                  <div className="mb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">Teams</div>
                  <div className="text-[12px] italic text-muted-foreground">No teams assigned</div>
                </div>
              </div>
              <div className="mt-4 border-t pt-4">
                <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">Issue Description</div>
                <div className="text-[13px] text-muted-foreground">
                  All active devices are accessed through only through cables so, now we want to access through WIFI.
                </div>
              </div>
            </div>
          </Card>

          {/* Activity Timeline */}
          <Card className="overflow-hidden p-0">
            <CardHeader className="border-b px-0 pb-0">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'activity' | 'notes')}>
                <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
                  <TabsTrigger value="activity" className="rounded-none border-b-2 border-transparent px-5 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent">activity</TabsTrigger>
                  <TabsTrigger value="notes" className="rounded-none border-b-2 border-transparent px-5 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent">notes</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <div className="p-5 space-y-5">
              {[...ticket.activity].slice(0, 30).map((item, i) => {
                const Icon = iconMap[item.type] || MessageSquare;
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <Avatar className="size-7">
                        <AvatarFallback
                          className="text-[10px] font-semibold text-white"
                          style={{ backgroundColor: '#6c757d' }}
                        >
                          SY
                        </AvatarFallback>
                      </Avatar>
                      {i < ticket.activity.length - 1 && <div className="mt-2 w-px flex-1 bg-border" />}
                    </div>
                    <div className="flex-1 min-w-0 pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-medium">{item.type}</span>
                        <span className="text-[11px] text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                      {"detail" in item && item.detail ? (
                        <div className="rounded-md bg-muted p-3 text-[13px] leading-relaxed text-muted-foreground">
                          {item.detail}
                        </div>
                      ) : (
                        <div className="text-[12px] text-muted-foreground">{item.type}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Box */}
            <CardContent className="border-t p-4">
              <div className="overflow-hidden rounded-md border">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment or reply..."
                  rows={3}
                  className="resize-none border-0 px-4 py-3 text-[13px] focus-visible:ring-0"
                />
                <div className="flex items-center justify-between border-t bg-muted px-3 py-2">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="size-7">
                      <Paperclip className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    className="h-7 gap-1.5 px-3 text-[12px]"
                    onClick={() => {
                      if (!comment.trim()) return;
                      addTicketComment({ ticketId: ticket.id, body: comment.trim(), internal: false, attachments: [] });
                      setComment('');
                    }}
                  >
                    <Send className="w-3 h-3" />
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="w-[260px] shrink-0 overflow-y-auto border-l bg-background">
          <div className="border-b p-4">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Properties</div>

            <div className="space-y-3">
              {/* Status */}
              <div>
                <div className="mb-1 text-[11px] text-muted-foreground">Status</div>
                <Select
                  value={status}
                  onValueChange={(v) => {
                    setStatus(v);
                    updateTicketStatus({ ticketId: ticket.id, status: v as any });
                  }}
                >
                  <SelectTrigger className="h-8 text-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div>
                <div className="mb-1 text-[11px] text-muted-foreground">Priority</div>
                <Select value={priority || 'none'} onValueChange={(v) => setPriority(v === 'none' ? '' : v)}>
                  <SelectTrigger className="h-8 text-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No priority</SelectItem>
                    {priorityOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Client */}
              <div>
                <div className="mb-1 text-[11px] text-muted-foreground">Client</div>
                <Select defaultValue="EPSS Client">
                  <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="EPSS Client">EPSS Client</SelectItem></SelectContent>
                </Select>
              </div>

              {/* Type */}
              <div>
                <div className="mb-1 text-[11px] text-muted-foreground">Type</div>
                <Select defaultValue="Maintenance">
                  <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Incident">Incident</SelectItem>
                    <SelectItem value="Request">Request</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="mb-1 text-[11px] text-muted-foreground">Assigned Engineer</div>
                <Select
                  value={ticket.assignedEngineerId ?? 'unassigned'}
                  onValueChange={(v) => {
                    if (v === 'unassigned') return;
                    assignTicket({ ticketId: ticket.id, engineerId: v });
                  }}
                >
                  <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {engineers.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Deadline */}
              <div>
                <div className="mb-1 text-[11px] text-muted-foreground">Deadline</div>
                <Input
                  type="date"
                  defaultValue="2026-02-04"
                  className="h-8 text-[12px]"
                />
              </div>
            </div>

            <Button className="mt-4 h-8 w-full text-[13px]">Update Ticket</Button>
          </div>

          {/* Edit Subject */}
          <div className="p-4">
            <Button variant="outline" className="h-8 w-full justify-start gap-2 px-3 text-[12px]">
              <Pencil className="w-3.5 h-3.5" />
              Edit Subject & Description
            </Button>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
