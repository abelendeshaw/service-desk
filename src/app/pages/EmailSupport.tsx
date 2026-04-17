import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Mail,
  Inbox,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Star,
  StarOff,
  RefreshCw,
  Filter,
  Tag,
  ArrowUpDown,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import { RowActionsMenu } from '../components/RowActionsMenu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';

const emails = [
  {
    id: 'EM-001',
    from: 'EPSS Client',
    fromEmail: 'epss@gmail.com',
    initials: 'EP',
    color: '#7c3aed',
    subject: 'Urgent: FortiGate firewall dropping VPN sessions intermittently',
    preview: 'We are experiencing frequent VPN session drops on our FortiGate firewall at the Addis Ababa data center. This is affecting...',
    date: '10:32 AM',
    status: 'Open',
    priority: 'Critical',
    unread: true,
    starred: false,
    attachments: 1,
    tag: 'Network',
    agent: 'WW',
  },
  {
    id: 'EM-002',
    from: 'IE Client',
    fromEmail: 'ie@gmail.com',
    initials: 'IE',
    color: '#0891b2',
    subject: 'Request: New user account creation for 3 staff members',
    preview: 'Good morning, we need to create new Active Directory accounts for 3 new staff joining next Monday. Please find the details attached.',
    date: 'Yesterday',
    status: 'Pending',
    priority: 'Low',
    unread: false,
    starred: true,
    attachments: 0,
    tag: 'Access',
    agent: 'SS',
  },
  {
    id: 'EM-003',
    from: 'MinT Client',
    fromEmail: 'mint@gmail.com',
    initials: 'MI',
    color: '#6b7280',
    subject: 'Follow-up on network latency issue reported last week',
    preview: 'We wanted to follow up on the network latency issue we reported last week. The problem persists during peak hours between 9AM and 12PM.',
    date: 'Yesterday',
    status: 'Open',
    priority: 'High',
    unread: false,
    starred: false,
    attachments: 2,
    tag: 'Network',
    agent: 'DB',
  },
  {
    id: 'EM-004',
    from: 'CSA Client',
    fromEmail: 'csa@gmail.com',
    initials: 'CS',
    color: '#0891b2',
    subject: 'Monthly report request — Q1 2026 system uptime and incident summary',
    preview: 'Please provide the monthly uptime and incident report for Q1 2026. The management team needs this by end of week for their review.',
    date: 'Apr 12',
    status: 'Closed',
    priority: 'Medium',
    unread: false,
    starred: false,
    attachments: 0,
    tag: 'Reporting',
    agent: 'AT',
  },
  {
    id: 'EM-005',
    from: 'ERA/MOTL Client',
    fromEmail: 'eramotl@gmail.com',
    initials: 'ER',
    color: '#059669',
    subject: 'Infrastructure upgrade proposal — need technical review',
    preview: 'We are planning to upgrade our server infrastructure and would like a technical review of our proposed setup before proceeding.',
    date: 'Apr 11',
    status: 'Open',
    priority: 'Medium',
    unread: true,
    starred: false,
    attachments: 3,
    tag: 'Infrastructure',
    agent: null,
  },
  {
    id: 'EM-006',
    from: 'MoWS Client',
    fromEmail: 'mows@gmail.com',
    initials: 'MW',
    color: '#d97706',
    subject: 'CSAT Survey Response — Technical Support Feedback',
    preview: 'Thank you for the recent support engagement. We have completed the CSAT survey and wanted to share our feedback directly as well.',
    date: 'Apr 10',
    status: 'Closed',
    priority: 'Low',
    unread: false,
    starred: false,
    attachments: 0,
    tag: 'CSAT',
    agent: 'WW',
  },
  {
    id: 'EM-007',
    from: 'Abay Bank Client',
    fromEmail: 'abaybank@gmail.com',
    initials: 'AB',
    color: '#dc2626',
    subject: 'Critical: Core banking system cannot connect to backup server',
    preview: 'URGENT — Our core banking application is failing to connect to the backup server since this morning. Transactions are being affected.',
    date: 'Apr 9',
    status: 'Closed',
    priority: 'Critical',
    unread: false,
    starred: true,
    attachments: 1,
    tag: 'Critical',
    agent: 'SS',
  },
];

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

const folderCounts = {
  All: emails.length,
  Open: emails.filter(e => e.status === 'Open').length,
  Pending: emails.filter(e => e.status === 'Pending').length,
  Closed: emails.filter(e => e.status === 'Closed').length,
  Starred: emails.filter(e => e.starred).length,
};

export function EmailSupport() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState<'All' | 'Open' | 'Pending' | 'Closed' | 'Starred'>('All');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [starred, setStarred] = useState<Record<string, boolean>>(
    Object.fromEntries(emails.map(e => [e.id, e.starred]))
  );

  const filtered = emails.filter(e => {
    if (search && !e.subject.toLowerCase().includes(search.toLowerCase()) && !e.from.toLowerCase().includes(search.toLowerCase())) return false;
    if (folder === 'Starred' && !starred[e.id]) return false;
    if (folder !== 'All' && folder !== 'Starred' && e.status !== folder) return false;
    if (priorityFilter !== 'all' && e.priority !== priorityFilter) return false;
    return true;
  });

  const unreadCount = emails.filter(e => e.unread).length;

  const stats = [
    { label: 'Total Emails', value: emails.length, icon: Mail, color: '#0b2235' },
    { label: 'Unread', value: unreadCount, icon: Inbox, color: '#2563eb' },
    { label: 'Open', value: folderCounts.Open, icon: AlertCircle, color: '#d97706' },
    { label: 'Resolved Today', value: 4, icon: CheckCircle2, color: '#059669' },
  ];

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">Email Support</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Client email conversations and support requests</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-[13px]">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
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

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {stats.map((s) => (
            <Card key={s.label} className="gap-0 px-4 py-3">
              <CardContent className="flex items-center gap-3 p-0">
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
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Folder Sidebar */}
        <div className="flex w-[180px] shrink-0 flex-col gap-0.5 border-r bg-background px-2 py-3">
          <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Folders</div>
          {(Object.keys(folderCounts) as Array<keyof typeof folderCounts>).map((f) => (
            <Button
              key={f}
              onClick={() => setFolder(f)}
              variant={folder === f ? 'secondary' : 'ghost'}
              className="h-auto justify-between px-2 py-2 text-[13px] font-medium"
            >
              <div className="flex items-center gap-2">
                {f === 'All' && <Inbox className="w-3.5 h-3.5" />}
                {f === 'Open' && <AlertCircle className="w-3.5 h-3.5" />}
                {f === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                {f === 'Closed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {f === 'Starred' && <Star className="w-3.5 h-3.5" />}
                {f}
              </div>
              <span className={`rounded-full px-1.5 py-0.5 text-[11px] ${folder === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {folderCounts[f]}
              </span>
            </Button>
          ))}

          <div className="mt-4 border-t pt-3">
            <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tags</div>
            {['Network', 'Access', 'Infrastructure', 'CSAT', 'Critical'].map((tag) => (
              <Button
                key={tag}
                variant="ghost"
                className="h-auto w-full justify-start gap-2 px-2 py-1.5 text-[12px]"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
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
                      <span className="rounded border bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                        {email.tag}
                      </span>
                      {email.attachments > 0 && (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Paperclip className="w-3 h-3" />
                          {email.attachments}
                        </span>
                      )}
                      {email.agent && (
                        <Avatar className="ml-auto size-5">
                          <AvatarFallback className="text-[9px] font-semibold">{email.agent}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    <RowActionsMenu
                      entityName={email.id}
                      onView={() => navigate(`/email-support/${email.id}`)}
                      onEdit={() => toast.info(`Edit draft for ${email.id} coming soon`)}
                      onDelete={() => toast.success(`${email.id} deleted`)}
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
    </div>
  );
}
