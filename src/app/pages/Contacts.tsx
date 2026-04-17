import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Plus, Users, Building2, Tag, Phone, Mail, AlertCircle, ArrowUpDown, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RowActionsMenu } from '../components/RowActionsMenu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

const contacts = [
  { name: 'EPSS Client', email: 'epss@gmail.com', company: 'EPSS', phone: '0987654321', role: 'Primary Contact', teams: [], status: 'Active', initials: 'EP', color: '#7c3aed' },
  { name: 'ESLSE Client', email: 'eslse@gmail.com', company: 'ESLSE', phone: '0987654321', role: 'Primary Contact', teams: [], status: 'Active', initials: 'ES', color: '#1d4ed8' },
  { name: 'IE Client', email: 'ie@gmail.com', company: 'IE', phone: '0987654321', role: 'Technical Contact', teams: ['NOC'], status: 'Active', initials: 'IE', color: '#0891b2' },
  { name: 'EOTC Client', email: 'eotc@gmail.com', company: 'EOTC', phone: '0987654321', role: 'Primary Contact', teams: [], status: 'Active', initials: 'EO', color: '#7c3aed' },
  { name: 'ERA/MOTL Client', email: 'eramotl@gmail.com', company: 'ERA/MOTL', phone: '0987654321', role: 'Primary Contact', teams: [], status: 'Active', initials: 'ER', color: '#059669' },
  { name: 'MinT Client', email: 'mint@gmail.com', company: 'MinT', phone: '0987654321', role: 'Technical Contact', teams: [], status: 'Inactive', initials: 'MI', color: '#6b7280' },
  { name: 'MoTI Client', email: 'moti@gmail.com', company: 'MoTI', phone: '0987654321', role: 'Primary Contact', teams: [], status: 'Active', initials: 'MO', color: '#6366f1' },
  { name: 'CSA Client', email: 'csa@gmail.com', company: 'CSA', phone: '0987654321', role: 'Technical Contact', teams: ['CSD'], status: 'Active', initials: 'CS', color: '#0891b2' },
  { name: 'Abay Bank Client', email: 'abaybank@gmail.com', company: 'Abay Bank', phone: '0987654321', role: 'Primary Contact', teams: [], status: 'Active', initials: 'AB', color: '#dc2626' },
  { name: 'MoWS Client', email: 'mows@gmail.com', company: 'MoWS', phone: '0987654321', role: 'Technical Contact', teams: [], status: 'Active', initials: 'MW', color: '#d97706' },
];

export function Contacts() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: 'Primary Contact',
    status: 'Active',
  });
  const [saved, setSaved] = useState(false);

  const updateModal = (key: string, val: string) => setModalForm(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowModal(false);
      setModalForm({ name: '', email: '', phone: '', company: '', role: 'Primary Contact', status: 'Active' });
    }, 1000);
  };

  const filtered = contacts.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email.includes(search)) return false;
    if (companyFilter !== 'all' && c.company !== companyFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  const companies = [...new Set(contacts.map(c => c.company))];

  const toggleSelected = (email: string) => {
    setSelected((prev) => (
      prev.includes(email) ? prev.filter((item) => item !== email) : [...prev, email]
    ));
  };

  const stats = [
    { label: 'Total Contacts', value: contacts.length, icon: Users, color: '#0b2235' },
    { label: 'Active', value: contacts.filter(c => c.status === 'Active').length, icon: Tag, color: '#059669' },
    { label: 'Companies', value: companies.length, icon: Building2, color: '#2563eb' },
  ];

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">Contacts</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Client contacts and stakeholders</p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            size="sm"
            className="gap-1.5 text-[13px]"
          >
            <Plus className="w-3.5 h-3.5" />
            New Contact
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
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
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 bg-muted pl-9 pr-3 text-[13px]"
            />
          </div>
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="h-8 w-[170px] text-[13px]">
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[140px] text-[13px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead className="w-10 pl-6 py-3">
                <Checkbox
                  checked={filtered.length > 0 && selected.length === filtered.length}
                  onCheckedChange={(checked) => {
                    setSelected(checked ? filtered.map((c) => c.email) : []);
                  }}
                />
              </TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <div className="flex cursor-pointer items-center gap-1 hover:text-foreground">Contact <ArrowUpDown className="w-3 h-3" /></div>
              </TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Company</TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Role</TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Phone</TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="w-10 pr-4" />
            </TableRow>
          </TableHeader>
          <TableBody className="bg-background">
            {filtered.map((contact, i) => (
              <TableRow
                key={i}
                className="group cursor-pointer"
                data-state={selected.includes(contact.email) ? 'selected' : undefined}
                onClick={() => navigate(`/contacts/${encodeURIComponent(contact.email)}`)}
              >
                <TableCell className="w-10 pl-6 py-3.5">
                  <Checkbox
                    checked={selected.includes(contact.email)}
                    onCheckedChange={() => toggleSelected(contact.email)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-[11px] font-semibold text-white" style={{ backgroundColor: contact.color }}>
                        {contact.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-[13px] font-medium">{contact.name}</div>
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {contact.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[13px] font-medium text-primary">{contact.company}</span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <span className="text-[12px] text-muted-foreground">{contact.role}</span>
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    {contact.phone}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <div className={`flex items-center gap-1.5 text-[12px] font-medium ${contact.status === 'Active' ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${contact.status === 'Active' ? 'bg-emerald-600' : 'bg-muted-foreground'}`} />
                    {contact.status}
                  </div>
                </TableCell>
                <TableCell className="pr-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu
                    entityName={contact.name}
                    onView={() => navigate(`/contacts/${encodeURIComponent(contact.email)}`)}
                    onEdit={() => toast.info(`Edit ${contact.name} coming soon`)}
                    onDelete={() => toast.success(`${contact.name} deleted`)}
                  />
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center">
                  <AlertCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <div className="text-[14px] font-medium">No contacts found</div>
                  <div className="mt-1 text-[13px] text-muted-foreground">Try adjusting your filters</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="border-t bg-background px-6 py-3 flex items-center justify-between flex-shrink-0">
        <span className="text-[12px] text-muted-foreground">Showing {filtered.length} of {contacts.length} contacts</span>
      </div>

      {/* Add Contact Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogHeader className="border-b px-5 py-4">
            <DialogTitle className="flex items-center gap-2.5 text-[14px]">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                <Users className="w-4 h-4 text-primary" />
              </span>
              Add New Contact
            </DialogTitle>
            <DialogDescription className="text-[11px]">Create a new client contact</DialogDescription>
          </DialogHeader>

          <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 block text-[12px]">Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    value={modalForm.name}
                    onChange={e => updateModal('name', e.target.value)}
                    placeholder="John Doe"
                    className="h-9 text-[13px]"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-[12px]">Phone</Label>
                  <Input
                    value={modalForm.phone}
                    onChange={e => updateModal('phone', e.target.value)}
                    placeholder="0987654321"
                    className="h-9 text-[13px]"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block text-[12px]">Email Address <span className="text-red-500">*</span></Label>
                <Input
                  type="email"
                  value={modalForm.email}
                  onChange={e => updateModal('email', e.target.value)}
                  placeholder="contact@company.com"
                  className="h-9 text-[13px]"
                />
              </div>

              <div>
                <Label className="mb-1.5 block text-[12px]">Company <span className="text-red-500">*</span></Label>
                <Select value={modalForm.company || '__none__'} onValueChange={(v) => updateModal('company', v === '__none__' ? '' : v)}>
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Select company</SelectItem>
                    {companies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 block text-[12px]">Role</Label>
                  <Select
                    value={modalForm.role}
                    onValueChange={v => updateModal('role', v)}
                  >
                    <SelectTrigger className="h-9 text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
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
                  <Select
                    value={modalForm.status}
                    onValueChange={v => updateModal('status', v)}
                  >
                    <SelectTrigger className="h-9 text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

          <div className="flex items-center justify-between border-t bg-muted px-5 py-4">
              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
                className="h-8 px-4 text-[13px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!modalForm.name || !modalForm.email || !modalForm.company}
                className="h-8 px-4 text-[13px]"
              >
                {saved ? (
                  <><CheckCircle2 className="w-3.5 h-3.5" /> Saved!</>
                ) : (
                  <>Create Contact</>
                )}
              </Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}