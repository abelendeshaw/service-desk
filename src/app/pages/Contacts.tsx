import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Search, Plus, Building2, Mail, AlertCircle,
  ArrowUpDown, CheckCircle2, Users,
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

const tierConfig: Record<string, { badgeClass: string }> = {
  Enterprise: { badgeClass: 'bg-violet-50 text-violet-700 border-violet-200' },
  Premium:    { badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  Standard:   { badgeClass: 'bg-slate-50 text-slate-600 border-slate-200' },
};

export function Contacts() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<'name' | 'company' | 'tickets'>('company');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', company: '', role: 'Primary Contact', status: 'Active' });
  const [companyForm, setCompanyForm] = useState({ name: '', description: '', tier: 'Enterprise', phone: '', website: '' });
  const [savedContact, setSavedContact] = useState(false);
  const [savedCompany, setSavedCompany] = useState(false);

  const updateContact = (k: string, v: string) => setContactForm((p) => ({ ...p, [k]: v }));
  const updateCompany = (k: string, v: string) => setCompanyForm((p) => ({ ...p, [k]: v }));

  const handleSaveContact = () => {
    setSavedContact(true);
    setTimeout(() => { setSavedContact(false); setShowContactModal(false); setContactForm({ name: '', email: '', phone: '', company: '', role: 'Primary Contact', status: 'Active' }); }, 1000);
  };

  const handleSaveCompany = () => {
    setSavedCompany(true);
    setTimeout(() => { setSavedCompany(false); setShowCompanyModal(false); setCompanyForm({ name: '', description: '', tier: 'Enterprise', phone: '', website: '' }); }, 1000);
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const companies = [...new Set(contactsData.map((c) => c.company))];

  const filtered = contactsData
    .filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email.includes(search.toLowerCase()) && !c.company.toLowerCase().includes(search.toLowerCase())) return false;
      if (tierFilter !== 'all' && c.tier !== tierFilter) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const va = sortField === 'tickets' ? a.tickets.toString() : a[sortField];
      const vb = sortField === 'tickets' ? b.tickets.toString() : b[sortField];
      const cmp = sortField === 'tickets' ? a.tickets - b.tickets : va.localeCompare(vb);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const hasFilters = search || tierFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">Contacts</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Client contacts and their organizations · {contactsData.length} contacts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-[13px]" onClick={() => setShowCompanyModal(true)}>
              <Building2 className="w-3.5 h-3.5" />
              New Company
            </Button>
            <Button size="sm" className="gap-1.5 text-[13px]" onClick={() => setShowContactModal(true)}>
              <Plus className="w-3.5 h-3.5" />
              New Contact
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 border-b bg-background px-6 py-3 flex-shrink-0 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts, companies or emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 bg-muted pl-9 pr-3 text-[13px]"
          />
        </div>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="h-8 w-[150px] text-[13px]"><SelectValue placeholder="All Tiers" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="Enterprise">Enterprise</SelectItem>
            <SelectItem value="Premium">Premium</SelectItem>
            <SelectItem value="Standard">Standard</SelectItem>
          </SelectContent>
        </Select>
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
            onClick={() => { setSearch(''); setTierFilter('all'); setStatusFilter('all'); }}>
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
                  onCheckedChange={(checked) => setSelected(checked ? filtered.map((c) => c.email) : [])}
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
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tier</TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <div className="flex cursor-pointer items-center gap-1 hover:text-foreground" onClick={() => toggleSort('tickets')}>
                  Tickets <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead className="w-10 pr-4" />
            </TableRow>
          </TableHeader>
          <TableBody className="bg-background">
            {filtered.map((contact) => {
              const tc = tierConfig[contact.tier];
              const isSelected = selected.includes(contact.email);
              return (
                <TableRow
                  key={contact.email}
                  data-state={isSelected ? 'selected' : undefined}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/contacts/${encodeURIComponent(contact.email)}`)}
                >
                  <TableCell className="w-10 pl-6 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => setSelected((p) => p.includes(contact.email) ? p.filter((x) => x !== contact.email) : [...p, contact.email])}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8 rounded-md">
                        <AvatarFallback className="rounded-md text-[11px] font-bold text-white" style={{ backgroundColor: contact.color }}>
                          {contact.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-[13px] font-semibold">{contact.company}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground truncate max-w-[180px]">{contact.companyDesc}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div className="text-[13px] font-medium">{contact.name}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{contact.role}</div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {contact.email}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <Badge variant="outline" className={`text-[11px] ${tc.badgeClass}`}>{contact.tier}</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div className={`flex items-center gap-1.5 text-[12px] font-medium ${contact.status === 'Active' ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${contact.status === 'Active' ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                      {contact.status}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold">{contact.tickets}</span>
                      <span className="text-[11px] text-muted-foreground">total</span>
                      <Badge variant="outline" className="text-[11px]">{contact.activeTickets} open</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="pr-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <RowActionsMenu
                      entityName={contact.name}
                      onView={() => navigate(`/contacts/${encodeURIComponent(contact.email)}`)}
                      onEdit={() => toast.info(`Edit ${contact.name} coming soon`)}
                      onDelete={() => toast.success(`${contact.name} removed`)}
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
                      <div className="text-[14px] font-medium">No contacts found</div>
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
        <span className="text-[12px] text-muted-foreground">Showing {filtered.length} of {contactsData.length} contacts</span>
        {selected.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-muted-foreground">{selected.length} selected</span>
            <Button variant="destructive" size="sm" className="h-7 px-2.5 text-[12px]">Delete</Button>
          </div>
        )}
      </div>

      {/* New Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogHeader className="border-b px-5 py-4">
            <DialogTitle className="flex items-center gap-2.5 text-[14px]">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                <Users className="w-4 h-4 text-primary" />
              </span>
              New Contact
            </DialogTitle>
            <DialogDescription className="text-[11px]">Add a new client contact to an existing company</DialogDescription>
          </DialogHeader>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block text-[12px]">Full Name <span className="text-red-500">*</span></Label>
                <Input value={contactForm.name} onChange={(e) => updateContact('name', e.target.value)} placeholder="John Doe" className="h-9 text-[13px]" />
              </div>
              <div>
                <Label className="mb-1.5 block text-[12px]">Phone</Label>
                <Input value={contactForm.phone} onChange={(e) => updateContact('phone', e.target.value)} placeholder="0987654321" className="h-9 text-[13px]" />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-[12px]">Email Address <span className="text-red-500">*</span></Label>
              <Input type="email" value={contactForm.email} onChange={(e) => updateContact('email', e.target.value)} placeholder="contact@company.com" className="h-9 text-[13px]" />
            </div>
            <div>
              <Label className="mb-1.5 block text-[12px]">Company <span className="text-red-500">*</span></Label>
              <Select value={contactForm.company || '__none__'} onValueChange={(v) => updateContact('company', v === '__none__' ? '' : v)}>
                <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select company</SelectItem>
                  {companies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block text-[12px]">Role</Label>
                <Select value={contactForm.role} onValueChange={(v) => updateContact('role', v)}>
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Primary Contact">Primary Contact</SelectItem>
                    <SelectItem value="Technical Contact">Technical Contact</SelectItem>
                    <SelectItem value="Billing Contact">Billing Contact</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block text-[12px]">Status</Label>
                <Select value={contactForm.status} onValueChange={(v) => updateContact('status', v)}>
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          {savedContact && (
            <div className="px-5 pb-2">
              <Alert className="border-primary bg-primary text-primary-foreground [&>svg]:text-primary-foreground">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>Contact created successfully</AlertDescription>
              </Alert>
            </div>
          )}
          <div className="flex items-center justify-between border-t bg-muted/40 px-5 py-4">
            <Button variant="outline" size="sm" className="text-[13px]" onClick={() => setShowContactModal(false)}>Cancel</Button>
            <Button size="sm" className="text-[13px]" onClick={handleSaveContact} disabled={!contactForm.name || !contactForm.email || !contactForm.company}>
              Create Contact
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Company Modal */}
      <Dialog open={showCompanyModal} onOpenChange={setShowCompanyModal}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogHeader className="border-b px-5 py-4">
            <DialogTitle className="flex items-center gap-2.5 text-[14px]">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                <Building2 className="w-4 h-4 text-primary" />
              </span>
              New Company
            </DialogTitle>
            <DialogDescription className="text-[11px]">Register a new client company</DialogDescription>
          </DialogHeader>
          <div className="p-5 space-y-4">
            <div>
              <Label className="mb-1.5 block text-[12px]">Company Name <span className="text-red-500">*</span></Label>
              <Input value={companyForm.name} onChange={(e) => updateCompany('name', e.target.value)} placeholder="e.g. EPSS, Abay Bank" className="h-9 text-[13px]" />
            </div>
            <div>
              <Label className="mb-1.5 block text-[12px]">Description</Label>
              <Input value={companyForm.description} onChange={(e) => updateCompany('description', e.target.value)} placeholder="Brief description" className="h-9 text-[13px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block text-[12px]">Tier</Label>
                <Select value={companyForm.tier} onValueChange={(v) => updateCompany('tier', v)}>
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block text-[12px]">Phone</Label>
                <Input value={companyForm.phone} onChange={(e) => updateCompany('phone', e.target.value)} placeholder="+251 11 000 0000" className="h-9 text-[13px]" />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-[12px]">Website</Label>
              <Input value={companyForm.website} onChange={(e) => updateCompany('website', e.target.value)} placeholder="https://company.gov.et" className="h-9 text-[13px]" />
            </div>
          </div>
          {savedCompany && (
            <div className="px-5 pb-2">
              <Alert className="border-primary bg-primary text-primary-foreground [&>svg]:text-primary-foreground">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>Company created successfully</AlertDescription>
              </Alert>
            </div>
          )}
          <div className="flex items-center justify-between border-t bg-muted/40 px-5 py-4">
            <Button variant="outline" size="sm" className="text-[13px]" onClick={() => setShowCompanyModal(false)}>Cancel</Button>
            <Button size="sm" className="text-[13px]" onClick={handleSaveCompany} disabled={!companyForm.name}>
              Create Company
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
