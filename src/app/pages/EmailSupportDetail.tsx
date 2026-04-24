import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ChevronRight,
  Mail,
  Reply,
  ReplyAll,
  Forward,
  Trash2,
  Paperclip,
  Send,
  CheckCircle2,
  Clock,
  Star,
  StarOff,
  Ticket,
  Tag,
  ChevronDown,
  X,
  Bold,
  Italic,
  Link,
  List,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Textarea } from '../components/ui/textarea';
import { RowActionsMenu } from '../components/RowActionsMenu';
import { useServiceDesk } from '../store/serviceDeskStore';

const avatarColors = ['#7c3aed', '#1d4ed8', '#0891b2', '#059669', '#d97706', '#dc2626'];

const statusOptions = ['Open', 'Pending', 'Closed'];
const priorityOptions = ['Critical', 'High', 'Medium', 'Low'];

export function EmailSupportDetail() {
  const navigate = useNavigate();
  const params = useParams();
  const emailId = params.id ?? '';
  const { emailThreads, convertEmailToTicket } = useServiceDesk();
  const thread = emailThreads.find((t) => t.id === emailId);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [status, setStatus] = useState('Open');
  const [priority, setPriority] = useState('Critical');
  const [starred, setStarred] = useState(false);
  const [collapsedEmails, setCollapsedEmails] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string) => {
    setCollapsedEmails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  React.useEffect(() => {
    if (!thread) return;
    setStatus(thread.status);
    setPriority(thread.priority);
    setStarred(thread.starred);
  }, [thread]);

  const statusColors: Record<string, { badgeClass: string; dotClass: string }> = {
    Open: { badgeClass: 'bg-blue-50 text-blue-700 border-blue-200', dotClass: 'bg-blue-500' },
    Pending: { badgeClass: 'bg-amber-50 text-amber-700 border-amber-200', dotClass: 'bg-amber-500' },
    Closed: { badgeClass: 'bg-muted text-muted-foreground border-border', dotClass: 'bg-muted-foreground' },
  };

  const sc = statusColors[status];
  const messages = thread?.messages ?? [];
  const subject = messages[0]?.subject ?? 'Email thread';

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {!thread ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-[13px] text-muted-foreground">Email thread not found.</div>
        </div>
      ) : (
      <>
      {/* Top Action Bar */}
      <div className="flex h-[48px] shrink-0 items-center gap-1 border-b bg-background px-6">
        <Button
          onClick={() => navigate('/email-support')}
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2.5 text-[12px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Email Support
        </Button>
        <Separator orientation="vertical" className="mx-1 h-4" />
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="px-1 text-[12px] text-muted-foreground">{thread.id}</span>
        <Separator orientation="vertical" className="mx-1 h-4" />

        <Badge variant="outline" className={`gap-1.5 text-[11px] ${sc.badgeClass}`}>
          <span className={`size-1.5 rounded-full ${sc.dotClass}`} />
          {status}
        </Badge>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setStarred(s => !s)}
            className="size-7 text-muted-foreground hover:text-amber-500"
          >
            {starred ? <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> : <StarOff className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2.5 text-[12px]"
            onClick={() => {
              const ticketId = convertEmailToTicket({ emailId: thread.id, project: "EPSS", supportType: "Technical Support" });
              navigate(`/tickets/${ticketId}`);
            }}
          >
            <Ticket className="w-3.5 h-3.5" />
            Convert to Ticket
          </Button>
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2.5 text-[12px] text-red-700 hover:text-red-800">
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </Button>
          <Button
            onClick={() => setStatus('Closed')}
            size="sm"
            className="h-7 gap-1.5 bg-emerald-600 px-2.5 text-[12px] hover:bg-emerald-700"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Close Thread
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Main Thread */}
        <div className="min-w-0 flex-1 space-y-4 overflow-y-auto p-6">
          {/* Subject */}
          <Card className="px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-[16px] leading-snug font-semibold">
                  {subject}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
                  <span className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{thread.id}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Opened {new Date(thread.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {messages.length} messages
                  </div>
                  <Badge variant="outline" className="text-[11px] bg-red-50 text-red-700 border-red-200">
                    {priority}
                  </Badge>
                  <Badge variant="outline" className="text-[11px]">
                    {thread.tag ?? "—"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="outline" size="sm" className="h-7 gap-1.5 px-2.5 text-[12px]">
                  <Reply className="w-3.5 h-3.5" />
                  Reply
                </Button>
              </div>
            </div>
          </Card>

          {/* Email Thread */}
          {messages.map((email, i) => {
            const isCollapsed = collapsedEmails[email.id];
            const isLast = i === messages.length - 1;
            return (
              <Card key={email.id} className="overflow-hidden p-0">
                {/* Email Header */}
                <div
                  className="flex cursor-pointer items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/50"
                  onClick={() => !isLast && toggleCollapse(email.id)}
                >
                  <Avatar className="size-8">
                    <AvatarFallback
                      className="text-[11px] font-semibold text-white"
                      style={{ backgroundColor: avatarColors[i % avatarColors.length] }}
                    >
                      {email.from.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold">{email.from.name}</span>
                      <span className="text-[12px] text-muted-foreground">&lt;{email.from.email}&gt;</span>
                    </div>
                    {isCollapsed && (
                      <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
                        {email.body.split('\n')[0]}...
                      </div>
                    )}
                    {!isCollapsed && (
                      <div className="text-[12px] text-muted-foreground">to {email.to.map((t) => t.email).join(", ")}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] text-muted-foreground">{new Date(email.createdAt).toLocaleString()}</span>
                    {email.attachments.length > 0 && (
                      <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    {!isLast && (
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                      />
                    )}
                    {!isCollapsed && (
                      <div className="flex items-center gap-1 ml-1">
                        <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" onClick={e => e.stopPropagation()}>
                          <Reply className="w-3.5 h-3.5" />
                        </Button>
                        <div onClick={(e) => e.stopPropagation()}>
                          <RowActionsMenu
                            entityName={`message-${email.id}`}
                            onView={() => toast.info(`Viewing message ${email.id}`)}
                            onEdit={() => toast.info(`Edit reply template for message ${email.id} coming soon`)}
                            onDelete={() => toast.success(`Message ${email.id} deleted`)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Body */}
                {!isCollapsed && (
                  <div className="px-5 pb-5">
                    <div className="border-t pt-4">
                      <pre className="font-sans whitespace-pre-wrap text-[13px] leading-relaxed text-muted-foreground">
                        {email.body}
                      </pre>

                      {email.attachments.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Attachments</div>
                          <div className="flex flex-wrap gap-2">
                            {email.attachments.map((att, ai) => (
                              <div key={ai} className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 transition-colors hover:border-primary">
                                <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                                <div>
                                  <div className="text-[12px] font-medium">{att.name}</div>
                                  <div className="text-[11px] text-muted-foreground">{Math.round(att.sizeBytes / 1024)} KB</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}

          {/* Reply Composer */}
          {replyOpen ? (
            <Card className="overflow-hidden border-primary/20 shadow-sm">
              <CardHeader className="flex-row items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <Reply className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[13px] font-medium text-muted-foreground">Reply to EPSS Client</span>
                </div>
                <Button onClick={() => setReplyOpen(false)} variant="ghost" size="icon" className="size-7 text-muted-foreground">
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>

              <div className="flex items-center gap-2 border-b px-4 py-2 text-[12px]">
                <span className="w-8 text-muted-foreground">To:</span>
                <span className="font-medium">epss@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 border-b px-4 py-2 text-[12px]">
                <span className="w-8 text-muted-foreground">Re:</span>
                <span>Urgent: FortiGate firewall dropping VPN sessions intermittently</span>
              </div>

              {/* Formatting toolbar */}
              <div className="flex items-center gap-1 border-b px-4 py-2">
                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
                  <Bold className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
                  <Italic className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
                  <Link className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
                  <List className="w-3.5 h-3.5" />
                </Button>
              </div>

              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply..."
                rows={6}
                className="resize-none border-0 px-4 py-3 text-[13px] focus-visible:ring-0"
                autoFocus
              />

              <div className="flex items-center justify-between border-t bg-muted px-4 py-3">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="size-8">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setReplyOpen(false)}
                    variant="outline"
                    className="h-8 px-3 text-[13px]"
                  >
                    Cancel
                  </Button>
                  <Button className="h-8 gap-1.5 px-4 text-[13px]">
                    <Send className="w-3.5 h-3.5" />
                    Send Reply
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-7">
                  <AvatarFallback className="text-[11px] font-semibold">AT</AvatarFallback>
                </Avatar>
                <Button
                  onClick={() => setReplyOpen(true)}
                  variant="outline"
                  className="h-9 flex-1 justify-start px-4 text-[13px] text-muted-foreground"
                >
                  Reply to EPSS Client...
                </Button>
                <Button variant="outline" className="h-9 gap-1.5 px-3 text-[13px]">
                  <ReplyAll className="w-3.5 h-3.5" />
                  Reply All
                </Button>
                <Button variant="outline" className="h-9 gap-1.5 px-3 text-[13px]">
                  <Forward className="w-3.5 h-3.5" />
                  Forward
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-[260px] shrink-0 overflow-y-auto border-l bg-background">
          <Card className="rounded-none border-0 border-b p-0">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-[11px] uppercase tracking-wider text-muted-foreground">Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4 pt-0">
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-[11px] text-muted-foreground">Status</div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <div className="mb-1 text-[11px] text-muted-foreground">Priority</div>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{priorityOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <div className="mb-1 text-[11px] text-muted-foreground">Assigned Agent</div>
                <Select defaultValue="Wongel Wondyifraw">
                  <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wongel Wondyifraw">Wongel Wondyifraw</SelectItem>
                    <SelectItem value="Sisay Shiferaw">Sisay Shiferaw</SelectItem>
                    <SelectItem value="Masresha Melese">Masresha Melese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="mb-1 text-[11px] text-muted-foreground">Tag</div>
                <Select defaultValue="Network">
                  <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Network">Network</SelectItem>
                    <SelectItem value="Access">Access</SelectItem>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="CSAT">CSAT</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="mt-4 h-8 w-full text-[13px]">Update</Button>
          </CardContent>
          </Card>

          <Card className="rounded-none border-0 border-b p-0">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-[11px] uppercase tracking-wider text-muted-foreground">Sender Info</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="size-9">
                <AvatarFallback className="text-[11px] font-semibold text-white bg-violet-600">EP</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-[13px] font-medium">EPSS Client</div>
                <div className="text-[11px] text-muted-foreground">epss@gmail.com</div>
              </div>
            </div>
            <div className="space-y-1.5 text-[12px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Company</span>
                <span className="font-medium">EPSS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Tickets</span>
                <span className="font-medium">18</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Emails</span>
                <span className="font-medium">5</span>
              </div>
            </div>
          </CardContent>
          </Card>

          <Card className="rounded-none border-0 p-0">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-[11px] uppercase tracking-wider text-muted-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 px-4 pb-4 pt-0">
              <Button variant="outline" className="h-8 w-full justify-start gap-2 px-3 text-[12px]">
                <Ticket className="w-3.5 h-3.5" />
                Convert to Ticket
              </Button>
              <Button variant="outline" className="h-8 w-full justify-start gap-2 px-3 text-[12px]">
                <Tag className="w-3.5 h-3.5" />
                Add Tag
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
