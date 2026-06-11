import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, Building2, Globe, Mail, Phone,
  User, Plus, ExternalLink, ShieldCheck,
  CheckCircle2, Paperclip, Inbox,
  Ticket as TicketIcon,
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { useServiceDesk } from '../store/serviceDeskStore';
import {
  calcSLAStatus, calcRemainingTime, calcDurationLabel,
  calcSupportType, slaStatusConfig,
} from './SLAManagement';

// ---------------------------------------------------------------------------
// Shared contact data
// ---------------------------------------------------------------------------

const contactsData = [
  {
    name: 'EPSS Client', email: 'epss@gmail.com', phone: '0987654321',
    role: 'Primary Contact', status: 'Active', initials: 'EP', color: '#7c3aed',
    company: 'EPSS', companyDesc: 'Electric Power Systems Services',
    tier: 'Enterprise', tickets: 18, activeTickets: 12,
    companyPhone: '+251 11 555 0001', companyWebsite: 'https://epss.example.com',
  },
  {
    name: 'ESLSE Client', email: 'eslse@gmail.com', phone: '0987654321',
    role: 'Primary Contact', status: 'Active', initials: 'ES', color: '#1d4ed8',
    company: 'ESLSE', companyDesc: 'Ethiopian Shipping and Logistics Services',
    tier: 'Enterprise', tickets: 6, activeTickets: 3,
    companyPhone: '+251 11 555 0005', companyWebsite: 'https://eslse.example.com',
  },
  {
    name: 'IE Client', email: 'ie@gmail.com', phone: '0987654321',
    role: 'Technical Contact', status: 'Active', initials: 'IE', color: '#0891b2',
    company: 'IE', companyDesc: 'Innovation Ethiopia',
    tier: 'Enterprise', tickets: 38, activeTickets: 25,
    companyPhone: '+251 11 555 0002', companyWebsite: 'https://ie.example.com',
  },
  {
    name: 'EOTC Client', email: 'eotc@gmail.com', phone: '0987654321',
    role: 'Primary Contact', status: 'Active', initials: 'EO', color: '#7c3aed',
    company: 'EOTC', companyDesc: 'Ethiopian Orthodox Tewahedo Church',
    tier: 'Standard', tickets: 2, activeTickets: 1,
    companyPhone: '+251 11 555 0006', companyWebsite: 'https://eotc.example.com',
  },
  {
    name: 'ERA/MOTL Client', email: 'eramotl@gmail.com', phone: '0987654321',
    role: 'Primary Contact', status: 'Active', initials: 'ER', color: '#059669',
    company: 'ERA/MOTL', companyDesc: 'Government agency focused on infrastructure',
    tier: 'Enterprise', tickets: 16, activeTickets: 9,
    companyPhone: '+251 11 555 0007', companyWebsite: 'https://era.example.com',
  },
  {
    name: 'MinT Client', email: 'mint@gmail.com', phone: '0987654321',
    role: 'Technical Contact', status: 'Inactive', initials: 'MI', color: '#6b7280',
    company: 'MinT', companyDesc: 'Ministry of Innovation and Technology',
    tier: 'Enterprise', tickets: 17, activeTickets: 11,
    companyPhone: '+251 11 555 0008', companyWebsite: 'https://mint.example.com',
  },
  {
    name: 'MoTI Client', email: 'moti@gmail.com', phone: '0987654321',
    role: 'Primary Contact', status: 'Active', initials: 'MO', color: '#6366f1',
    company: 'MoTI', companyDesc: 'Ministry of Trade and Industry',
    tier: 'Premium', tickets: 10, activeTickets: 7,
    companyPhone: '+251 11 555 0009', companyWebsite: 'https://moti.example.com',
  },
  {
    name: 'CSA Client', email: 'csa@gmail.com', phone: '0987654321',
    role: 'Technical Contact', status: 'Active', initials: 'CS', color: '#0891b2',
    company: 'CSA', companyDesc: 'Central Statistics Agency',
    tier: 'Enterprise', tickets: 6, activeTickets: 2,
    companyPhone: '+251 11 555 0003', companyWebsite: 'https://csa.example.com',
  },
  {
    name: 'Abay Bank Client', email: 'abaybank@gmail.com', phone: '0987654321',
    role: 'Primary Contact', status: 'Active', initials: 'AB', color: '#dc2626',
    company: 'Abay Bank', companyDesc: 'Private commercial bank',
    tier: 'Premium', tickets: 9, activeTickets: 4,
    companyPhone: '+251 11 555 0004', companyWebsite: 'https://abay.example.com',
  },
  {
    name: 'MoWS Client', email: 'mows@gmail.com', phone: '0987654321',
    role: 'Technical Contact', status: 'Active', initials: 'MW', color: '#d97706',
    company: 'MoWS', companyDesc: 'Ministry of Water and Sanitation',
    tier: 'Standard', tickets: 13, activeTickets: 8,
    companyPhone: '+251 11 555 0010', companyWebsite: 'https://mows.example.com',
  },
];

// ---------------------------------------------------------------------------
// Email support data (mirrored from SLAManagement)
// ---------------------------------------------------------------------------

const emailData = [
  {
    id: 'EM-001', from: 'EPSS Client', fromEmail: 'epss@gmail.com', initials: 'EP', color: '#7c3aed',
    subject: 'Urgent: FortiGate firewall dropping VPN sessions intermittently',
    preview: 'We are experiencing frequent VPN session drops on our FortiGate firewall at the Addis Ababa data center. This is affecting...',
    date: '10:32 AM', status: 'Open', priority: 'Critical', unread: true, starred: false, attachments: 1, tag: 'Network',
  },
  {
    id: 'EM-002', from: 'IE Client', fromEmail: 'ie@gmail.com', initials: 'IE', color: '#0891b2',
    subject: 'Request: New user account creation for 3 staff members',
    preview: 'Good morning, we need to create new Active Directory accounts for 3 new staff joining next Monday. Please find the details attached.',
    date: 'Yesterday', status: 'Pending', priority: 'Low', unread: false, starred: true, attachments: 0, tag: 'Access',
  },
  {
    id: 'EM-003', from: 'MinT Client', fromEmail: 'mint@gmail.com', initials: 'MI', color: '#6b7280',
    subject: 'Follow-up on network latency issue reported last week',
    preview: 'We wanted to follow up on the network latency issue we reported last week. The problem persists during peak hours between 9AM and 12PM.',
    date: 'Yesterday', status: 'Open', priority: 'High', unread: false, starred: false, attachments: 2, tag: 'Network',
  },
  {
    id: 'EM-004', from: 'CSA Client', fromEmail: 'csa@gmail.com', initials: 'CS', color: '#0891b2',
    subject: 'Monthly report request — Q1 2026 system uptime and incident summary',
    preview: 'Please provide the monthly uptime and incident report for Q1 2026. The management team needs this by end of week for their review.',
    date: 'Apr 12', status: 'Closed', priority: 'Medium', unread: false, starred: false, attachments: 0, tag: 'Reporting',
  },
  {
    id: 'EM-005', from: 'ERA/MOTL Client', fromEmail: 'eramotl@gmail.com', initials: 'ER', color: '#059669',
    subject: 'Infrastructure upgrade proposal — need technical review',
    preview: 'We are planning to upgrade our server infrastructure and would like a technical review of our proposed setup before proceeding.',
    date: 'Apr 11', status: 'Open', priority: 'Medium', unread: true, starred: false, attachments: 3, tag: 'Infrastructure',
  },
  {
    id: 'EM-006', from: 'MoWS Client', fromEmail: 'mows@gmail.com', initials: 'MW', color: '#d97706',
    subject: 'CSAT Survey Response — Technical Support Feedback',
    preview: 'Thank you for the recent support engagement. We have completed the CSAT survey and wanted to share our feedback directly as well.',
    date: 'Apr 10', status: 'Closed', priority: 'Low', unread: false, starred: false, attachments: 0, tag: 'CSAT',
  },
  {
    id: 'EM-007', from: 'Abay Bank Client', fromEmail: 'abaybank@gmail.com', initials: 'AB', color: '#dc2626',
    subject: 'Critical: Core banking system cannot connect to backup server',
    preview: 'URGENT — Our core banking application is failing to connect to the backup server since this morning. Transactions are being affected.',
    date: 'Apr 9', status: 'Closed', priority: 'Critical', unread: false, starred: true, attachments: 1, tag: 'Critical',
  },
];

// ---------------------------------------------------------------------------
// Config maps
// ---------------------------------------------------------------------------

const supportTypeConfig: Record<string, { badgeClass: string; dotClass: string }> = {
  'CSAT':           { badgeClass: 'bg-red-50 text-red-700 border-red-200',    dotClass: 'bg-red-400' },
  'Normal Support': { badgeClass: 'bg-blue-50 text-blue-700 border-blue-200', dotClass: 'bg-blue-400' },
};

const ticketStatusConfig: Record<string, { dot: string; badgeClass: string }> = {
  Open:          { dot: 'bg-blue-500',         badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  'In Progress': { dot: 'bg-violet-500',       badgeClass: 'bg-violet-50 text-violet-700 border-violet-200' },
  Escalated:    { dot: 'bg-red-500',          badgeClass: 'bg-red-50 text-red-700 border-red-200' },
  Resolved:     { dot: 'bg-emerald-500',      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Closed:       { dot: 'bg-muted-foreground', badgeClass: 'bg-muted text-muted-foreground border-border' },
};

const ticketPriorityConfig: Record<string, { badgeClass: string }> = {
  Critical: { badgeClass: 'bg-red-50 text-red-700 border-red-200' },
  High:     { badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' },
  Medium:   { badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  Low:      { badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const emailPriorityConfig: Record<string, { badgeClass: string }> = {
  Critical: { badgeClass: 'bg-red-50 text-red-700 border-red-200' },
  High:     { badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' },
  Medium:   { badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  Low:      { badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const emailStatusCfg: Record<string, { badgeClass: string; dotClass: string }> = {
  Open:    { badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',     dotClass: 'bg-blue-500' },
  Pending: { badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',  dotClass: 'bg-amber-500' },
  Closed:  { badgeClass: 'bg-muted text-muted-foreground border-border', dotClass: 'bg-muted-foreground' },
};

// ---------------------------------------------------------------------------
// Tab type
// ---------------------------------------------------------------------------

type Tab = 'overview' | 'agreements' | 'emails' | 'tickets';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ContactDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { slas, tickets } = useServiceDesk();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const contact = useMemo(
    () => contactsData.find((c) => c.email === decodeURIComponent(id ?? '')) ?? contactsData[0],
    [id],
  );

  // Match SLAs: exact match or "company startsWith" (handles "IE Innovation Ethiopia" → "IE")
  const contactSLAs = useMemo(() => {
    const c = contact.company.toLowerCase();
    return slas.filter((s) => {
      const sc = s.companyName.toLowerCase();
      return sc === c || sc.startsWith(c + ' ');
    });
  }, [slas, contact.company]);

  const contactTickets = useMemo(
    () => tickets.filter((t) => t.contactName === contact.name || t.project === contact.company),
    [tickets, contact],
  );

  const contactEmails = useMemo(
    () => emailData.filter((e) => e.fromEmail === contact.email),
    [contact.email],
  );

  const slaStats = useMemo(() => {
    const statuses = contactSLAs.map((s) => calcSLAStatus(s.startDate, s.endDate));
    return {
      total: contactSLAs.length,
      active: statuses.filter((s) => s === 'Active').length,
      expiring: statuses.filter((s) => s === 'Expiring Soon').length,
      expired: statuses.filter((s) => s === 'Expired').length,
      upcoming: statuses.filter((s) => s === 'Upcoming').length,
    };
  }, [contactSLAs]);

  const activeSLA = useMemo(
    () =>
      contactSLAs
        .map((s) => ({ ...s, status: calcSLAStatus(s.startDate, s.endDate) }))
        .find((s) => s.status === 'Active' || s.status === 'Expiring Soon'),
    [contactSLAs],
  );

  const tabs = [
    { id: 'overview' as Tab,    label: 'Overview',            icon: User,          count: 0 },
    { id: 'agreements' as Tab,  label: 'Service Agreements',  icon: ShieldCheck,   count: contactSLAs.length },
    { id: 'emails' as Tab,      label: 'Support Emails',      icon: Mail,          count: contactEmails.length },
    { id: 'tickets' as Tab,     label: 'Tickets',             icon: TicketIcon,    count: contactTickets.length },
  ];

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* ── Header ── */}
      <div className="border-b bg-background px-6 pt-4 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost" size="sm"
            className="gap-1.5 text-[13px] text-muted-foreground -ml-2"
            onClick={() => navigate('/contacts')}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Contacts
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex size-12 items-center justify-center rounded-xl text-[14px] font-bold text-white flex-shrink-0"
              style={{ backgroundColor: contact.color }}
            >
              {contact.initials}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[20px] font-semibold tracking-tight">{contact.company}</h1>
                <Badge
                  variant="outline"
                  className={`text-[11px] ${contact.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-muted text-muted-foreground border-border'}`}
                >
                  <span className={`mr-1 size-1.5 rounded-full inline-block ${contact.status === 'Active' ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                  {contact.status}
                </Badge>
                <Badge variant="outline" className="text-[11px] text-muted-foreground">{contact.tier}</Badge>
              </div>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{contact.companyDesc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-[13px]">
              <Mail className="w-3.5 h-3.5" />
              Send Email
            </Button>
            <Button size="sm" className="gap-1.5 text-[13px]" onClick={() => navigate('/tickets/new')}>
              <Plus className="w-3.5 h-3.5" />
              New Ticket
            </Button>
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex border-b bg-background px-6 flex-shrink-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 mr-6 px-0 py-3 text-[13px] font-medium border-b-2 transition-colors ${
              activeTab === t.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.count > 0 && (
              <span className="ml-0.5 text-[11px] text-muted-foreground">({t.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* ════════ OVERVIEW ════════ */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="max-w-5xl mx-auto space-y-5">

              {/* Contact + Company info cards */}
              <div className="grid grid-cols-2 gap-5">
                <Card className="gap-0 p-0">
                  <CardHeader className="border-b px-5 py-4">
                    <CardTitle className="flex items-center gap-2 text-[14px]">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Contact Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 py-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex size-7 items-center justify-center rounded-md flex-shrink-0"
                        style={{ backgroundColor: contact.color + '20' }}
                      >
                        <User className="w-3.5 h-3.5" style={{ color: contact.color }} />
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground">Name & Role</div>
                        <div className="text-[13px] font-medium">{contact.name}</div>
                        <div className="text-[11px] text-muted-foreground">{contact.role}</div>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <div className="text-[11px] text-muted-foreground">Email</div>
                        <div className="text-[13px]">{contact.email}</div>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <div className="text-[11px] text-muted-foreground">Phone</div>
                        <div className="text-[13px]">{contact.phone}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="gap-0 p-0">
                  <CardHeader className="border-b px-5 py-4">
                    <CardTitle className="flex items-center gap-2 text-[14px]">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      Company Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 py-4 space-y-3">
                    <div>
                      <div className="text-[11px] text-muted-foreground">Organization</div>
                      <div className="text-[13px] font-semibold">{contact.company}</div>
                      <div className="text-[12px] text-muted-foreground mt-0.5">{contact.companyDesc}</div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[11px] text-muted-foreground">Service Tier</div>
                        <div className="text-[13px] font-medium">{contact.tier}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground">Active SLAs</div>
                        <div className={`text-[13px] font-medium ${slaStats.active > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                          {slaStats.active} / {slaStats.total}
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <div className="text-[11px] text-muted-foreground">Phone</div>
                        <div className="text-[13px]">{contact.companyPhone}</div>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <div className="text-[11px] text-muted-foreground">Website</div>
                        <a
                          href={contact.companyWebsite} target="_blank" rel="noreferrer"
                          className="text-[13px] text-primary flex items-center gap-1 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {contact.companyWebsite.replace('https://', '')}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Active SLA banner */}
              {activeSLA && (() => {
                const cfg = slaStatusConfig[activeSLA.status];
                const StatusIcon = cfg.icon;
                return (
                  <Card className="gap-0 p-0">
                    <CardHeader className="border-b px-5 py-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-[14px]">
                          <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                          Active Service Agreement
                        </CardTitle>
                        <Button
                          variant="outline" size="sm"
                          className="gap-1.5 text-[12px] h-7 px-2.5"
                          onClick={() => setActiveTab('agreements')}
                        >
                          View all agreements
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="px-5 py-4">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="flex size-10 items-center justify-center rounded-lg flex-shrink-0"
                            style={{ backgroundColor: cfg.color + '18' }}
                          >
                            <StatusIcon className="w-5 h-5" style={{ color: cfg.color }} />
                          </div>
                          <div>
                            <div className="text-[13px] font-semibold">{activeSLA.projectName}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">{activeSLA.id}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 flex-wrap">
                          <div>
                            <div className="text-[11px] text-muted-foreground">Start Date</div>
                            <div className="text-[13px] font-medium">{activeSLA.startDate}</div>
                          </div>
                          <div>
                            <div className="text-[11px] text-muted-foreground">End Date</div>
                            <div className="text-[13px] font-medium">{activeSLA.endDate}</div>
                          </div>
                          <div>
                            <div className="text-[11px] text-muted-foreground">Remaining</div>
                            <div className="text-[13px] font-medium">{calcRemainingTime(activeSLA.endDate)}</div>
                          </div>
                          <Badge variant="outline" className={`gap-1 text-[11px] ${cfg.badgeClass}`}>
                            <span className={`size-1.5 rounded-full ${cfg.dotClass}`} />
                            {activeSLA.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Recent tickets */}
              <Card className="gap-0 p-0">
                <CardHeader className="border-b px-5 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-[14px]">
                      <TicketIcon className="w-4 h-4 text-muted-foreground" />
                      Recent Tickets
                    </CardTitle>
                    <Button
                      variant="outline" size="sm"
                      className="gap-1.5 text-[12px] h-7 px-2.5"
                      onClick={() => setActiveTab('tickets')}
                    >
                      View all ({contactTickets.length})
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 divide-y">
                  {contactTickets.slice(0, 3).map((ticket) => {
                    const sc = ticketStatusConfig[ticket.status] ?? ticketStatusConfig.Open;
                    return (
                      <div
                        key={ticket.id}
                        className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[11px] text-muted-foreground font-mono">{ticket.id}</span>
                            {ticket.priority && (
                              <span className="text-[11px] text-muted-foreground">· {ticket.priority}</span>
                            )}
                          </div>
                          <div className="text-[13px] font-medium truncate">{ticket.subject}</div>
                        </div>
                        <Badge variant="outline" className={`gap-1 text-[11px] flex-shrink-0 ${sc.badgeClass}`}>
                          <span className={`size-1.5 rounded-full ${sc.dot}`} />
                          {ticket.status}
                        </Badge>
                      </div>
                    );
                  })}
                  {contactTickets.length === 0 && (
                    <div className="py-10 text-center">
                      <CheckCircle2 className="mx-auto mb-2 w-8 h-8 text-emerald-500" />
                      <div className="text-[13px] font-medium">No open tickets</div>
                      <div className="mt-0.5 text-[12px] text-muted-foreground">No support requests yet</div>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        )}

        {/* ════════ SERVICE AGREEMENTS ════════ */}
        {activeTab === 'agreements' && (
          <div className="flex flex-col min-h-full">
            {/* Stats row */}
            <div className="flex items-center gap-5 border-b bg-background px-6 py-3 flex-shrink-0">
              <div className="text-[12px] text-muted-foreground">
                <span className="font-semibold text-foreground">{slaStats.total}</span> agreement{slaStats.total !== 1 ? 's' : ''}
              </div>
              {slaStats.active > 0 && (
                <div className="flex items-center gap-1.5 text-[12px]">
                  <div className="size-1.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-emerald-700">{slaStats.active} Active</span>
                </div>
              )}
              {slaStats.expiring > 0 && (
                <div className="flex items-center gap-1.5 text-[12px]">
                  <div className="size-1.5 rounded-full bg-amber-500" />
                  <span className="font-semibold text-amber-700">{slaStats.expiring} Expiring Soon</span>
                </div>
              )}
              {slaStats.expired > 0 && (
                <div className="flex items-center gap-1.5 text-[12px]">
                  <div className="size-1.5 rounded-full bg-red-500" />
                  <span className="font-semibold text-red-700">{slaStats.expired} Expired</span>
                </div>
              )}
              {slaStats.upcoming > 0 && (
                <div className="flex items-center gap-1.5 text-[12px]">
                  <div className="size-1.5 rounded-full bg-blue-500" />
                  <span className="font-semibold text-blue-700">{slaStats.upcoming} Upcoming</span>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              {contactSLAs.length > 0 ? (
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">SLA ID</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Project</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Start Date</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">End Date</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Duration</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Remaining</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Support Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-background">
                    {contactSLAs.map((sla) => {
                      const status = calcSLAStatus(sla.startDate, sla.endDate);
                      const cfg = slaStatusConfig[status];
                      const supportType = calcSupportType(status);
                      const supCfg = supportTypeConfig[supportType];
                      return (
                        <TableRow key={sla.id} className="hover:bg-muted/30">
                          <TableCell className="px-4 py-3.5 font-mono text-[12px] text-muted-foreground">{sla.id}</TableCell>
                          <TableCell className="px-4 py-3.5">
                            <div className="text-[13px] font-medium">{sla.projectName}</div>
                            {sla.notes && (
                              <div className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[220px]">{sla.notes}</div>
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-3.5 text-[13px] text-muted-foreground whitespace-nowrap">{sla.startDate}</TableCell>
                          <TableCell className="px-4 py-3.5 text-[13px] text-muted-foreground whitespace-nowrap">{sla.endDate}</TableCell>
                          <TableCell className="px-4 py-3.5 text-[13px] text-muted-foreground whitespace-nowrap">{calcDurationLabel(sla.startDate, sla.endDate)}</TableCell>
                          <TableCell className="px-4 py-3.5 text-[12px] text-muted-foreground whitespace-nowrap">{calcRemainingTime(sla.endDate)}</TableCell>
                          <TableCell className="px-4 py-3.5">
                            <Badge variant="outline" className={`gap-1 text-[11px] whitespace-nowrap ${cfg.badgeClass}`}>
                              <span className={`size-1.5 rounded-full ${cfg.dotClass}`} />
                              {status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <Badge variant="outline" className={`gap-1 text-[11px] whitespace-nowrap ${supCfg.badgeClass}`}>
                              <span className={`size-1.5 rounded-full ${supCfg.dotClass}`} />
                              {supportType}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                    <ShieldCheck className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <div className="text-[14px] font-medium">No service agreements</div>
                    <div className="mt-1 text-[13px] text-muted-foreground">
                      No SLAs have been created for {contact.company}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════ SUPPORT EMAILS ════════ */}
        {activeTab === 'emails' && (
          <div className="flex flex-col min-h-full">
            <div className="flex-1 overflow-auto">
              {contactEmails.length > 0 ? (
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Subject</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tag</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Priority</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-background">
                    {contactEmails.map((email) => {
                      const priCfg = emailPriorityConfig[email.priority] ?? emailPriorityConfig.Medium;
                      const stCfg = emailStatusCfg[email.status] ?? emailStatusCfg.Open;
                      return (
                        <TableRow
                          key={email.id}
                          className="cursor-pointer hover:bg-muted/30"
                          onClick={() => navigate(`/email-support/${email.id}`)}
                        >
                          <TableCell className="px-4 py-3.5">
                            <div className="flex items-start gap-2">
                              {email.unread && (
                                <div className="mt-1.5 size-1.5 rounded-full bg-primary flex-shrink-0" />
                              )}
                              <div className="min-w-0">
                                <div className={`text-[13px] ${email.unread ? 'font-semibold' : 'font-medium'}`}>
                                  {email.subject}
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[320px]">
                                  {email.preview}
                                </div>
                                {email.attachments > 0 && (
                                  <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground">
                                    <Paperclip className="w-3 h-3" />
                                    {email.attachments} attachment{email.attachments !== 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <Badge variant="outline" className="text-[11px] text-muted-foreground">{email.tag}</Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <Badge variant="outline" className={`text-[11px] ${priCfg.badgeClass}`}>
                              {email.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <Badge variant="outline" className={`gap-1 text-[11px] ${stCfg.badgeClass}`}>
                              <span className={`size-1.5 rounded-full ${stCfg.dotClass}`} />
                              {email.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3.5 text-[12px] text-muted-foreground whitespace-nowrap">
                            {email.date}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                    <Inbox className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <div className="text-[14px] font-medium">No support emails</div>
                    <div className="mt-1 text-[13px] text-muted-foreground">
                      No email requests from {contact.name}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════ TICKETS ════════ */}
        {activeTab === 'tickets' && (
          <div className="flex flex-col min-h-full">
            <div className="flex-1 overflow-auto">
              {contactTickets.length > 0 ? (
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">ID</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Subject</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Priority</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-background">
                    {contactTickets.map((ticket) => {
                      const sc = ticketStatusConfig[ticket.status] ?? ticketStatusConfig.Open;
                      const pc = ticket.priority ? ticketPriorityConfig[ticket.priority] : null;
                      return (
                        <TableRow
                          key={ticket.id}
                          className="cursor-pointer hover:bg-muted/30"
                          onClick={() => navigate(`/tickets/${ticket.id}`)}
                        >
                          <TableCell className="px-4 py-3.5 font-mono text-[12px] text-muted-foreground whitespace-nowrap">
                            {ticket.id}
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <div className="text-[13px] font-medium">{ticket.subject}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">{ticket.project}</div>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <Badge variant="outline" className={`gap-1 text-[11px] ${sc.badgeClass}`}>
                              <span className={`size-1.5 rounded-full ${sc.dot}`} />
                              {ticket.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            {pc ? (
                              <Badge variant="outline" className={`text-[11px] ${pc.badgeClass}`}>
                                {ticket.priority}
                              </Badge>
                            ) : (
                              <span className="text-[12px] text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-3.5 text-[12px] text-muted-foreground whitespace-nowrap">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                    <TicketIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <div className="text-[14px] font-medium">No tickets</div>
                    <div className="mt-1 text-[13px] text-muted-foreground">
                      No support requests from {contact.company}
                    </div>
                  </div>
                  <Button size="sm" className="gap-1.5 text-[13px]" onClick={() => navigate('/tickets/new')}>
                    <Plus className="w-3.5 h-3.5" />
                    Create Ticket
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
