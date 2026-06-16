import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Search, Plus, Mail, AlertCircle,
  ArrowUpDown, CheckCircle2, Users, Building2, FolderKanban,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RowActionsMenu } from '../components/RowActionsMenu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import {
  getAvailablePMCompanies,
  getClientTicketStats,
  getPMCompany,
  hasClientContact,
  type ClientContactInput,
} from '../lib/clientsData';
import { useServiceDesk } from '../store/serviceDeskStore';
import type { SLA } from '../store/types';

function matchSLAs(slas: SLA[], company: string): SLA[] {
  const c = company.toLowerCase();
  return slas.filter((s) => {
    const sc = s.companyName.toLowerCase();
    return sc === c || sc.startsWith(c + ' ');
  });
}

function getCompanyProjects(slas: SLA[], company: string): string[] {
  return matchSLAs(slas, company).map((s) => s.projectName);
}

export function Contacts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { slas, clients, tickets, addClientFromPM } = useServiceDesk();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<'name' | 'company' | 'tickets'>('company');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [selectedPmId, setSelectedPmId] = useState('');
  const [savedCompany, setSavedCompany] = useState(false);
  const [contactForm, setContactForm] = useState<ClientContactInput>({
    name: '',
    email: '',
    phone: '',
    role: '',
  });
  const [contactFormError, setContactFormError] = useState('');

  const availablePMCompanies = useMemo(() => getAvailablePMCompanies(clients), [clients]);
  const selectedPM = useMemo(
    () => (selectedPmId ? getPMCompany(selectedPmId) : undefined),
    [selectedPmId],
  );

  useEffect(() => {
    const openNewCompany = (location.state as { openNewCompany?: boolean } | null)?.openNewCompany;
    if (openNewCompany) {
      setShowCompanyModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (showCompanyModal && availablePMCompanies.length > 0 && !selectedPmId) {
      setSelectedPmId(availablePMCompanies[0].id);
    }
  }, [showCompanyModal, availablePMCompanies, selectedPmId]);

  const resetCompanyModal = () => {
    setSelectedPmId('');
    setSavedCompany(false);
    setContactForm({ name: '', email: '', phone: '', role: '' });
    setContactFormError('');
  };

  const handleAddCompany = () => {
    if (!selectedPmId) return;

    const hasName = Boolean(contactForm.name.trim());
    const hasEmail = Boolean(contactForm.email.trim());
    const hasPhone = Boolean(contactForm.phone.trim());
    const hasRole = Boolean(contactForm.role.trim());
    const hasAnyContactField = hasName || hasEmail || hasPhone || hasRole;

    if (hasAnyContactField && (!hasName || !hasEmail)) {
      setContactFormError('Enter both contact name and email, or leave all contact fields empty.');
      return;
    }

    const clientId = addClientFromPM(
      selectedPmId,
      hasName && hasEmail
        ? {
            name: contactForm.name.trim(),
            email: contactForm.email.trim(),
            phone: contactForm.phone.trim(),
            role: contactForm.role.trim() || 'Contact',
          }
        : undefined,
    );
    if (!clientId) return;
    setSavedCompany(true);
    setTimeout(() => {
      setSavedCompany(false);
      setShowCompanyModal(false);
      resetCompanyModal();
      navigate(`/clients/${encodeURIComponent(clientId)}`);
    }, 700);
  };

  const clientsWithStats = useMemo(
    () =>
      clients.map((client) => ({
        ...client,
        ...getClientTicketStats(tickets, client.company),
      })),
    [clients, tickets],
  );

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const filtered = clientsWithStats
    .filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        const matchesCompany = c.company.toLowerCase().includes(q);
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesEmail = c.email.toLowerCase().includes(q);
        if (!matchesCompany && !matchesName && !matchesEmail) return false;
      }
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const va = sortField === 'tickets' ? a.tickets.toString() : a[sortField];
      const vb = sortField === 'tickets' ? b.tickets.toString() : b[sortField];
      const cmp = sortField === 'tickets' ? a.tickets - b.tickets : va.localeCompare(vb);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const hasFilters = search || statusFilter !== 'all';

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">Clients</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Client companies onboarded from PM · {clients.length} clients
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-1.5 text-[13px]" onClick={() => setShowCompanyModal(true)}>
              <Plus className="w-3.5 h-3.5" />
              New Company
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 border-b bg-background px-6 py-3 flex-shrink-0 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clients, companies or emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 bg-muted pl-9 pr-3 text-[13px]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-[140px] text-[13px]"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-8 text-[12px] text-muted-foreground"
            onClick={() => { setSearch(''); setStatusFilter('all'); }}>
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead className="w-10 pl-6 py-3">
                <Checkbox
                  checked={filtered.length > 0 && selected.length === filtered.length}
                  onCheckedChange={(checked) => setSelected(checked ? filtered.map((c) => c.id) : [])}
                />
              </TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <div className="flex cursor-pointer items-center gap-1 hover:text-foreground" onClick={() => toggleSort('company')}>
                  Company <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <div className="flex cursor-pointer items-center gap-1 hover:text-foreground" onClick={() => toggleSort('name')}>
                  Contact <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Email</TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FolderKanban className="w-3 h-3" /> Projects
                </div>
              </TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <div className="flex cursor-pointer items-center gap-1 hover:text-foreground" onClick={() => toggleSort('tickets')}>
                  Tickets <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead className="w-10 pr-4" />
            </TableRow>
          </TableHeader>
          <TableBody className="bg-background">
            {filtered.map((client) => {
              const isSelected = selected.includes(client.id);
              const hasContact = hasClientContact(client);
              return (
                <TableRow
                  key={client.id}
                  data-state={isSelected ? 'selected' : undefined}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/clients/${encodeURIComponent(client.id)}`)}
                >
                  <TableCell className="w-10 pl-6 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => setSelected((p) => p.includes(client.id) ? p.filter((x) => x !== client.id) : [...p, client.id])}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8 rounded-md">
                        <AvatarFallback className="rounded-md text-[11px] font-bold text-white" style={{ backgroundColor: client.color }}>
                          {client.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-[13px] font-semibold">{client.company}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground truncate max-w-[180px]">{client.companyDesc}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    {hasContact ? (
                      <>
                        <div className="text-[13px] font-medium">{client.name}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">{client.role}</div>
                      </>
                    ) : (
                      <span className="text-[12px] text-muted-foreground italic">No contact</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    {hasContact ? (
                      <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {client.email}
                      </div>
                    ) : (
                      <span className="text-[12px] text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div className={`flex items-center gap-1.5 text-[12px] font-medium ${client.status === 'Active' ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${client.status === 'Active' ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                      {client.status}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    {(() => {
                      const projects = getCompanyProjects(slas, client.company);
                      if (projects.length === 0) {
                        return <span className="text-[12px] text-muted-foreground">—</span>;
                      }
                      return (
                        <div className="space-y-1">
                          {projects.slice(0, 2).map((project) => (
                            <div key={project} className="max-w-[200px] truncate text-[12px] font-medium">
                              {project}
                            </div>
                          ))}
                          {projects.length > 2 && (
                            <div className="text-[11px] text-muted-foreground">+{projects.length - 2} more</div>
                          )}
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold">{client.tickets}</span>
                      <span className="text-[11px] text-muted-foreground">total</span>
                      <Badge variant="outline" className="text-[11px]">{client.activeTickets} open</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="pr-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <RowActionsMenu
                      entityName={hasContact ? client.name : client.company}
                      onView={() => navigate(`/clients/${encodeURIComponent(client.id)}`)}
                      onEdit={() => toast.info(`Edit ${client.company} coming soon`)}
                      onDelete={() => toast.success(`${client.company} removed`)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <AlertCircle className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <div className="text-[14px] font-medium">No clients found</div>
                      <div className="mt-1 text-[13px] text-muted-foreground">Try adjusting your search or filters</div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-between border-t bg-background px-6 py-3">
        <span className="text-[12px] text-muted-foreground">Showing {filtered.length} of {clients.length} clients</span>
        {selected.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-muted-foreground">{selected.length} selected</span>
            <Button variant="destructive" size="sm" className="h-7 px-2.5 text-[12px]">Delete</Button>
          </div>
        )}
      </div>

      {/* New Company Modal */}
      <Dialog open={showCompanyModal} onOpenChange={(open) => {
        setShowCompanyModal(open);
        if (!open) resetCompanyModal();
      }}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <DialogHeader className="border-b px-5 py-4">
            <DialogTitle className="flex items-center gap-2.5 text-[14px]">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                <Building2 className="w-4 h-4 text-primary" />
              </span>
              New Company
            </DialogTitle>
            <DialogDescription className="text-[11px]">
              Select a company to onboard into Service Desk. Contact fields are optional.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-5">
            <div>
              <Label className="mb-1.5 block text-[12px]">Companies <span className="text-red-500">*</span></Label>
              {availablePMCompanies.length === 0 ? (
                <div className="rounded-md border border-dashed px-4 py-6 text-center text-[13px] text-muted-foreground">
                  All companies are already onboarded.
                </div>
              ) : (
                <Select value={selectedPmId || undefined} onValueChange={setSelectedPmId}>
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Select a company" /></SelectTrigger>
                  <SelectContent>
                    {availablePMCompanies.map((pm) => (
                      <SelectItem key={pm.id} value={pm.id}>
                        {pm.name} · {pm.industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {selectedPM && (
              <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                <div>
                  <div className="text-[13px] font-semibold">{selectedPM.name}</div>
                  <div className="mt-0.5 text-[12px] text-muted-foreground">{selectedPM.description}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div><span className="text-muted-foreground">Tier:</span> {selectedPM.tier}</div>
                  <div><span className="text-muted-foreground">Industry:</span> {selectedPM.industry}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Website:</span> {selectedPM.website}</div>
                </div>
              </div>
            )}
            {selectedPM && (
              <div className="rounded-lg border bg-background p-4 space-y-3">
                <div>
                  <Label className="text-[12px]">Contact name</Label>
                  <Input
                    className="mt-1.5 h-9 text-[13px]"
                    value={contactForm.name}
                    onChange={(e) => {
                      setContactFormError('');
                      setContactForm((p) => ({ ...p, name: e.target.value }));
                    }}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label className="text-[12px]">Email</Label>
                  <Input
                    type="email"
                    className="mt-1.5 h-9 text-[13px]"
                    value={contactForm.email}
                    onChange={(e) => {
                      setContactFormError('');
                      setContactForm((p) => ({ ...p, email: e.target.value }));
                    }}
                    placeholder="contact@company.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[12px]">Phone</Label>
                    <Input
                      className="mt-1.5 h-9 text-[13px]"
                      value={contactForm.phone}
                      onChange={(e) => {
                        setContactFormError('');
                        setContactForm((p) => ({ ...p, phone: e.target.value }));
                      }}
                      placeholder="+251 ..."
                    />
                  </div>
                  <div>
                    <Label className="text-[12px]">Role</Label>
                    <Input
                      className="mt-1.5 h-9 text-[13px]"
                      value={contactForm.role}
                      onChange={(e) => {
                        setContactFormError('');
                        setContactForm((p) => ({ ...p, role: e.target.value }));
                      }}
                      placeholder="Role"
                    />
                  </div>
                </div>
                {contactFormError && (
                  <p className="text-[12px] text-destructive">{contactFormError}</p>
                )}
              </div>
            )}
          </div>
          {savedCompany && (
            <div className="px-5 pb-2">
              <Alert className="border-primary bg-primary text-primary-foreground [&>svg]:text-primary-foreground">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>Company added successfully</AlertDescription>
              </Alert>
            </div>
          )}
          <div className="flex items-center justify-between border-t bg-muted/40 px-5 py-4">
            <Button variant="outline" size="sm" className="text-[13px]" onClick={() => setShowCompanyModal(false)}>Cancel</Button>
            <Button
              size="sm"
              className="text-[13px]"
              onClick={handleAddCompany}
              disabled={!selectedPmId || availablePMCompanies.length === 0}
            >
              Add Company
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
