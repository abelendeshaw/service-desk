import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, Building2, Globe, Mail, Phone,
  User, Plus, ExternalLink, ShieldCheck, FolderKanban,
  CheckCircle2,
  Ticket as TicketIcon,
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { useServiceDesk } from '../store/serviceDeskStore';
import { hasClientContact, type ClientContactInput } from '../lib/clientsData';
import {
  calcSLAStatus, calcRemainingTime, calcDurationLabel,
  calcSupportType, slaStatusConfig,
} from './SLAManagement';

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

// ---------------------------------------------------------------------------
// Tab type
// ---------------------------------------------------------------------------

type Tab = 'overview' | 'projects' | 'tickets';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ContactDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { slas, tickets, clients, updateClientContact } = useServiceDesk();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactForm, setContactForm] = useState<ClientContactInput>({
    name: '',
    email: '',
    phone: '',
    role: 'Primary Contact',
  });
  const [contactFormError, setContactFormError] = useState('');

  const contact = useMemo(
    () => clients.find((c) => c.id === decodeURIComponent(id ?? '')),
    [clients, id],
  );
  const hasContact = contact ? hasClientContact(contact) : false;

  // Match SLAs: exact match or "company startsWith" (handles "IE Innovation Ethiopia" → "IE")
  const contactSLAs = useMemo(() => {
    if (!contact) return [];
    const c = contact.company.toLowerCase();
    return slas.filter((s) => {
      const sc = s.companyName.toLowerCase();
      return sc === c || sc.startsWith(c + ' ');
    });
  }, [slas, contact]);

  const contactTickets = useMemo(
    () =>
      contact
        ? tickets.filter((t) => t.project === contact.company || t.contactName === contact.name)
        : [],
    [tickets, contact],
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

  if (!contact) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-muted/30 p-6">
        <p className="text-[14px] font-medium">Client not found</p>
        <Button variant="link" className="mt-2" onClick={() => navigate('/clients')}>
          Back to Clients
        </Button>
      </div>
    );
  }

  const openAddContact = () => {
    setContactForm({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      role: contact.role || 'Primary Contact',
    });
    setContactFormError('');
    setShowAddContact(true);
  };

  const handleSaveContact = () => {
    if (!contactForm.name.trim() || !contactForm.email.trim()) {
      setContactFormError('Contact name and email are required.');
      return;
    }
    const nextId = updateClientContact(contact.id, {
      name: contactForm.name.trim(),
      email: contactForm.email.trim(),
      phone: contactForm.phone.trim(),
      role: contactForm.role.trim() || 'Primary Contact',
    });
    if (!nextId) return;
    setShowAddContact(false);
    if (nextId !== contact.id) {
      navigate(`/clients/${encodeURIComponent(nextId)}`, { replace: true });
    }
  };

  const tabs = [
    { id: 'overview' as Tab,    label: 'Overview',            icon: User,          count: 0 },
    { id: 'projects' as Tab,   label: 'Projects',            icon: FolderKanban,  count: contactSLAs.length },
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
            onClick={() => navigate('/clients')}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Clients
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
                    {!hasContact ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-muted">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-[13px] font-medium">No contact information</p>
                        <p className="mt-1 max-w-[240px] text-[12px] text-muted-foreground">
                          Add a primary contact for this company when you are ready.
                        </p>
                        <Button size="sm" className="mt-4 gap-1.5 text-[13px]" onClick={openAddContact}>
                          <Plus className="w-3.5 h-3.5" />
                          Add Contact
                        </Button>
                      </div>
                    ) : (
                      <>
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
                        <div className="text-[13px]">{contact.phone || '—'}</div>
                      </div>
                    </div>
                      </>
                    )}
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
                          Active Project
                        </CardTitle>
                        <Button
                          variant="outline" size="sm"
                          className="gap-1.5 text-[12px] h-7 px-2.5"
                          onClick={() => setActiveTab('projects')}
                        >
                          View all projects
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

        {/* ════════ PROJECTS ════════ */}
        {activeTab === 'projects' && (
          <div className="flex flex-col min-h-full">
            {/* Stats row */}
            <div className="flex items-center gap-5 border-b bg-background px-6 py-3 flex-shrink-0">
              <div className="text-[12px] text-muted-foreground">
                <span className="font-semibold text-foreground">{slaStats.total}</span> project{slaStats.total !== 1 ? 's' : ''}
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
                    <FolderKanban className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <div className="text-[14px] font-medium">No projects</div>
                    <div className="mt-1 text-[13px] text-muted-foreground">
                      No projects have been created for {contact.company}
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

      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Add Contact Information</DialogTitle>
            <DialogDescription className="text-[12px]">
              Add a primary contact for {contact.company}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div>
              <Label className="text-[12px]">Contact name <span className="text-red-500">*</span></Label>
              <Input
                className="mt-1.5 h-9 text-[13px]"
                value={contactForm.name}
                onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label className="text-[12px]">Email <span className="text-red-500">*</span></Label>
              <Input
                type="email"
                className="mt-1.5 h-9 text-[13px]"
                value={contactForm.email}
                onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="contact@company.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[12px]">Phone</Label>
                <Input
                  className="mt-1.5 h-9 text-[13px]"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+251 ..."
                />
              </div>
              <div>
                <Label className="text-[12px]">Role</Label>
                <Input
                  className="mt-1.5 h-9 text-[13px]"
                  value={contactForm.role}
                  onChange={(e) => setContactForm((p) => ({ ...p, role: e.target.value }))}
                  placeholder="Primary Contact"
                />
              </div>
            </div>
            {contactFormError && (
              <p className="text-[12px] text-destructive">{contactFormError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAddContact(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveContact}>
              Save Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
