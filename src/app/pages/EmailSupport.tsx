import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Mail,
  Paperclip,
  Star,
  StarOff,
  Filter,
  ArrowUpDown,
  Ticket,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import { RowActionsMenu } from '../components/RowActionsMenu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { ConvertEmailToTicketDialog } from '../components/ConvertEmailToTicketDialog';
import { useServiceDesk } from '../store/serviceDeskStore';
import type { EmailThread } from '../store/types';

const avatarColors = ['#7c3aed', '#0891b2', '#059669', '#d97706', '#1d4ed8', '#dc2626'];

const priorityConfig: Record<string, { badgeClass: string }> = {
  Critical: { badgeClass: 'bg-red-50 text-red-700 border-red-200' },
  High: { badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' },
  Medium: { badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  Low: { badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const statusConfig: Record<string, { badgeClass: string; dotClass: string }> = {
  Open: { badgeClass: 'bg-blue-50 text-blue-700 border-blue-200', dotClass: 'bg-blue-500' },
  Pending: { badgeClass: 'bg-amber-50 text-amber-700 border-amber-200', dotClass: 'bg-amber-500' },
  Closed: { badgeClass: 'bg-muted text-muted-foreground border-border', dotClass: 'bg-muted-foreground' },
};

const folderColors = {
  All: '#0b2235',
  Open: '#2563eb',
  Pending: '#d97706',
  Closed: '#6c757d',
  Starred: '#eab308',
} as const;

type EmailListItem = {
  id: string;
  from: string;
  fromEmail: string;
  initials: string;
  color: string;
  subject: string;
  preview: string;
  date: string;
  status: string;
  priority: string;
  unread: boolean;
  starred: boolean;
  attachments: number;
  tag: string | null;
  linkedTicketId: string | null;
};

function mapThreadsToEmails(threads: EmailThread[]): EmailListItem[] {
  return threads.map((thread, i) => {
    const first = thread.messages[0];
    return {
      id: thread.id,
      from: first?.from.name ?? 'Unknown',
      fromEmail: first?.from.email ?? '',
      initials: first?.from.initials ?? '??',
      color: avatarColors[i % avatarColors.length],
      subject: first?.subject ?? thread.id,
      preview: (first?.body ?? '').slice(0, 120),
      date: new Date(thread.updatedAt).toLocaleDateString(),
      status: thread.status,
      priority: thread.priority,
      unread: thread.unread,
      starred: thread.starred,
      attachments: first?.attachments.length ?? 0,
      tag: thread.tag,
      linkedTicketId: thread.linkedTicketId,
    };
  });
}

type EmailSupportPanelProps = {
  embedded?: boolean;
};

export function EmailSupportPanel({ embedded = false }: EmailSupportPanelProps) {
  const navigate = useNavigate();
  const { emailThreads } = useServiceDesk();
  const emails = useMemo(() => mapThreadsToEmails(emailThreads), [emailThreads]);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState<'All' | 'Open' | 'Pending' | 'Closed' | 'Starred'>('All');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [starred, setStarred] = useState<Record<string, boolean>>({});
  const [convertThreadId, setConvertThreadId] = useState<string | null>(null);
  const convertOpen = convertThreadId !== null;
  const convertThread = convertThreadId
    ? emailThreads.find((t) => t.id === convertThreadId) ?? null
    : null;

  const openCreateTicket = (threadId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const thread = emailThreads.find((t) => t.id === threadId);
    if (thread?.linkedTicketId) {
      toast.info(`Already linked to ticket #${thread.linkedTicketId}`);
      navigate(`/tickets/${thread.linkedTicketId}`);
      return;
    }
    setConvertThreadId(threadId);
  };

  React.useEffect(() => {
    setStarred((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const e of emails) {
        if (next[e.id] === undefined) {
          next[e.id] = e.starred;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [emails]);

  const folderCounts = useMemo(
    () => ({
      All: emails.length,
      Open: emails.filter((e) => e.status === 'Open').length,
      Pending: emails.filter((e) => e.status === 'Pending').length,
      Closed: emails.filter((e) => e.status === 'Closed').length,
      Starred: emails.filter((e) => starred[e.id]).length,
    }),
    [emails, starred],
  );

  const filtered = emails.filter((e) => {
    if (search && !e.subject.toLowerCase().includes(search.toLowerCase()) && !e.from.toLowerCase().includes(search.toLowerCase())) return false;
    if (folder === 'Starred' && !starred[e.id]) return false;
    if (folder !== 'All' && folder !== 'Starred' && e.status !== folder) return false;
    if (priorityFilter !== 'all' && e.priority !== priorityFilter) return false;
    return true;
  });

  const folderOptions = Object.keys(folderCounts) as Array<keyof typeof folderCounts>;

  return (
    <div className={`flex h-full min-h-0 flex-col ${embedded ? '' : 'bg-muted/30'}`}>
      <div className={`border-b bg-background flex-shrink-0 ${embedded ? 'px-6 py-4' : 'px-6 py-4'}`}>
        {!embedded && (
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-[20px] font-semibold tracking-tight">Email Support</h1>
              <p className="mt-0.5 text-[13px] text-muted-foreground">Client email conversations and support requests</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate('/email-support/new')}
                size="sm"
                className="gap-1.5 text-[13px]"
              >
                <Plus className="w-3.5 h-3.5" />
                Compose
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1">
          {folderOptions.map((f) => {
            const isActive = folder === f;
            return (
              <Button
                key={f}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFolder(f)}
                className="gap-1.5 text-[12px]"
              >
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: isActive ? 'white' : folderColors[f] }}
                />
                {f}
                <span className="ml-0.5 font-semibold">{folderCounts[f]}</span>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 border-b bg-background px-6 py-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 bg-muted pl-9 pr-3 text-[13px]"
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="h-8 w-[150px] text-[13px]">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Email List */}
        <div className="h-full overflow-y-auto">
          {/* Toolbar */}
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background px-4 py-2">
            <Checkbox />
            <Separator orientation="vertical" className="mx-1 h-4" />
            <Button variant="ghost" size="sm" className="h-auto gap-1 p-0 text-[12px] text-muted-foreground">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </Button>
            <Button variant="ghost" size="sm" className="h-auto gap-1 p-0 text-[12px] text-muted-foreground">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort
            </Button>
            <span className="ml-auto text-[12px] text-muted-foreground">
              {filtered.length} conversation{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="bg-background">
            {filtered.map((email, i) => {
              const pc = priorityConfig[email.priority];
              const sc = statusConfig[email.status];
              const isStarred = starred[email.id];
              return (
                <div
                  key={email.id}
                  className={`group flex cursor-pointer items-start gap-3 border-b px-4 py-3.5 transition-colors hover:bg-muted/50 ${
                    email.unread ? 'bg-blue-50/40' : ''
                  }`}
                  onClick={() => navigate(`/email-support/${email.id}`)}
                >
                  <Checkbox className="mt-1 shrink-0" onClick={e => e.stopPropagation()} />

                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-0.5 size-6 shrink-0"
                    onClick={e => {
                      e.stopPropagation();
                      setStarred(prev => ({ ...prev, [email.id]: !prev[email.id] }));
                    }}
                  >
                    {isStarred ? (
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ) : (
                      <StarOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>

                  <Avatar className="size-8">
                    <AvatarFallback className="text-[11px] font-semibold text-white" style={{ backgroundColor: email.color }}>
                      {email.initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`truncate text-[13px] ${email.unread ? 'font-semibold' : 'font-medium'}`}>
                          {email.from}
                        </span>
                        {email.unread && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[11px] text-muted-foreground">{email.date}</span>
                      </div>
                    </div>

                    <div className={`mb-1 truncate text-[13px] ${email.unread ? 'font-medium' : 'text-muted-foreground'}`}>
                      {email.subject}
                    </div>

                    <div className="truncate text-[12px] text-muted-foreground">{email.preview}</div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                        {email.id}
                      </span>
                      <Badge variant="outline" className={`gap-1 text-[11px] ${sc.badgeClass}`}>
                        <span className={`size-1.5 rounded-full ${sc.dotClass}`} />
                        {email.status}
                      </Badge>
                      <Badge variant="outline" className={`text-[11px] ${pc.badgeClass}`}>
                        {email.priority}
                      </Badge>
                      {email.attachments > 0 && (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Paperclip className="w-3 h-3" />
                          {email.attachments}
                        </span>
                      )}
                      {email.linkedTicketId && (
                        <Badge variant="secondary" className="text-[10px]">
                          Ticket #{email.linkedTicketId}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {!email.linkedTicketId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 px-2 text-[11px] opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => openCreateTicket(email.id, e)}
                      >
                        <Ticket className="w-3 h-3" />
                        Create Ticket
                      </Button>
                    )}
                    <RowActionsMenu
                      entityName={email.id}
                      onView={() => navigate(`/email-support/${email.id}`)}
                      onEdit={() => toast.info(`Edit draft for ${email.id} coming soon`)}
                      onDelete={() => toast.success(`${email.id} deleted`)}
                      extraActions={
                        email.linkedTicketId
                          ? [
                              {
                                label: `View Ticket #${email.linkedTicketId}`,
                                onSelect: () => navigate(`/tickets/${email.linkedTicketId}`),
                              },
                            ]
                          : [
                              {
                                label: 'Create Ticket',
                                onSelect: () => openCreateTicket(email.id),
                              },
                            ]
                      }
                    />
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="py-20 text-center">
                <Mail className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <div className="text-[14px] font-medium">No emails found</div>
                <div className="mt-1 text-[13px] text-muted-foreground">Try adjusting your search or filters</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConvertEmailToTicketDialog
        thread={convertThread}
        open={convertOpen}
        onOpenChange={(open) => {
          if (!open) setConvertThreadId(null);
        }}
        onCreated={(ticketId) => {
          setConvertThreadId(null);
          navigate(`/tickets/${ticketId}`);
        }}
      />
    </div>
  );
}

export function EmailSupport() {
  return <EmailSupportPanel />;
}
