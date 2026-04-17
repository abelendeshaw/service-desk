import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowUpDown, Building2, CheckCircle2, Globe, Phone, Plus, Search, Ticket, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { RowActionsMenu } from '../components/RowActionsMenu';

const companies = [
  { name: 'EPSS', description: 'Electric Power Systems Services', contacts: 1, health: 74, tier: 'Enterprise', tickets: 18, active: 12, initials: 'EP', color: '#7c3aed' },
  { name: 'ESLSE', description: 'Ethiopian Shipping and Logistics Services', contacts: 1, health: 99, tier: 'Enterprise', tickets: 6, active: 3, initials: 'ES', color: '#1d4ed8' },
  { name: 'IE', description: 'Innovation Ethiopia', contacts: 1, health: 96, tier: 'Enterprise', tickets: 38, active: 25, initials: 'IE', color: '#0891b2' },
  { name: 'EOTC', description: 'Ethiopian Orthodox Tewahedo Church', contacts: 1, health: 79, tier: 'Standard', tickets: 2, active: 1, initials: 'EO', color: '#7c3aed' },
  { name: 'ERA/MOTL', description: 'Government agency focused on infrastructure', contacts: 1, health: 83, tier: 'Enterprise', tickets: 16, active: 9, initials: 'ER', color: '#059669' },
  { name: 'MinT', description: 'Ministry of Innovation and Technology', contacts: 1, health: 80, tier: 'Enterprise', tickets: 17, active: 11, initials: 'MI', color: '#6b7280' },
  { name: 'MoTI', description: 'Ministry of Trade and Industry', contacts: 1, health: 83, tier: 'Premium', tickets: 10, active: 7, initials: 'MO', color: '#6366f1' },
  { name: 'CSA', description: 'Central Statistics Agency', contacts: 2, health: 93, tier: 'Enterprise', tickets: 6, active: 2, initials: 'CS', color: '#0891b2' },
  { name: 'Abay Bank', description: 'Private commercial bank', contacts: 1, health: 88, tier: 'Premium', tickets: 9, active: 4, initials: 'AB', color: '#dc2626' },
  { name: 'MoWS', description: 'Ministry of Water and Sanitation', contacts: 1, health: 71, tier: 'Standard', tickets: 13, active: 8, initials: 'MW', color: '#d97706' },
];

export function Companies() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'health' | 'tickets'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({
    name: '',
    description: '',
    tier: 'Enterprise',
    industry: '',
    website: '',
    phone: '',
    address: '',
  });
  const [saved, setSaved] = useState(false);

  const updateModal = (key: string, val: string) => setModalForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowModal(false);
      setModalForm({ name: '', description: '', tier: 'Enterprise', industry: '', website: '', phone: '', address: '' });
    }, 1000);
  };

  const filtered = companies
    .filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (tierFilter !== 'all' && c.tier !== tierFilter) return false;
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      if (sortBy === 'health') cmp = a.health - b.health;
      if (sortBy === 'tickets') cmp = a.tickets - b.tickets;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const totalTickets = companies.reduce((acc, company) => acc + company.tickets, 0);
  const avgHealth = Math.round(companies.reduce((acc, company) => acc + company.health, 0) / companies.length);
  const totalContacts = companies.reduce((acc, company) => acc + company.contacts, 0);

  const stats = [
    { label: 'Total Companies', value: companies.length, icon: Building2 },
    { label: 'Total Contacts', value: totalContacts, icon: Users },
    { label: 'Total Tickets', value: totalTickets, icon: Ticket },
    { label: 'Avg. Health Score', value: `${avgHealth}%`, icon: TrendingUp },
  ];

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <div className="border-b bg-background px-6 py-4">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">Companies</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Manage client accounts and health scores</p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            size="sm"
            className="gap-1.5 text-[13px]"
          >
            <Plus data-icon="inline-start" />
            New Company
          </Button>
        </div>

        <div className="mb-4 grid grid-cols-4 gap-3">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                  <s.icon className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 bg-muted pl-9 pr-3 text-[13px]"
            />
          </div>
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="h-8 w-[170px] text-[13px]">
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="Enterprise">Enterprise</SelectItem>
              <SelectItem value="Premium">Premium</SelectItem>
              <SelectItem value="Standard">Standard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead className="w-10 pl-6 py-3">
                <Checkbox />
              </TableHead>
              <TableHead className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-semibold uppercase" onClick={() => toggleSort('name')}>
                  Company
                  <ArrowUpDown data-icon="inline-end" />
                </Button>
              </TableHead>
              <TableHead className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Tier</TableHead>
              <TableHead className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Contacts</TableHead>
              <TableHead className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-semibold uppercase" onClick={() => toggleSort('health')}>
                  Health
                  <ArrowUpDown data-icon="inline-end" />
                </Button>
              </TableHead>
              <TableHead className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-semibold uppercase" onClick={() => toggleSort('tickets')}>
                  Tickets
                  <ArrowUpDown data-icon="inline-end" />
                </Button>
              </TableHead>
              <TableHead className="w-10 pr-4" />
            </TableRow>
          </TableHeader>
          <TableBody className="bg-background">
            {filtered.map((company, i) => {
              return (
                <TableRow
                  key={i}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/companies/${encodeURIComponent(company.name)}`)}
                >
                  <TableCell className="w-10 pl-6 py-3.5">
                    <Checkbox onClick={(e) => e.stopPropagation()} />
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">{company.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-[13px] font-semibold">{company.name}</p>
                        <p className="mt-0.5 max-w-xs truncate text-[11px] text-muted-foreground">{company.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <Badge variant={company.tier === 'Standard' ? 'outline' : 'secondary'}>{company.tier}</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <Badge variant="outline">{company.contacts}</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <Progress value={company.health} className="h-1.5 max-w-24" />
                      <span className="text-[13px] font-semibold">{company.health}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold">{company.tickets}</span>
                      <span className="text-[11px] text-muted-foreground">total</span>
                      <Badge variant="outline">{company.active} open</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="pr-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <RowActionsMenu
                      entityName={company.name}
                      onView={() => navigate(`/companies/${encodeURIComponent(company.name)}`)}
                      onEdit={() => toast.info(`Edit ${company.name} coming soon`)}
                      onDelete={() => toast.success(`${company.name} deleted`)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t bg-background px-6 py-3">
        <span className="text-[12px] text-muted-foreground">Showing {filtered.length} of {companies.length} companies</span>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="size-4" />
              Add New Company
            </DialogTitle>
            <DialogDescription>Register a new client company.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={modalForm.name}
                onChange={(e) => updateModal('name', e.target.value)}
                placeholder="e.g. EPSS, Abay Bank"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="company-description">Description</Label>
              <Input
                id="company-description"
                value={modalForm.description}
                onChange={(e) => updateModal('description', e.target.value)}
                placeholder="Brief description of the company"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="company-tier">Tier</Label>
                <Select value={modalForm.tier} onValueChange={(value) => updateModal('tier', value)}>
                  <SelectTrigger id="company-tier">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="company-industry">Industry</Label>
                <Select value={modalForm.industry || '__none__'} onValueChange={(value) => updateModal('industry', value === '__none__' ? '' : value)}>
                  <SelectTrigger id="company-industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Select industry</SelectItem>
                    <SelectItem value="Government">Government</SelectItem>
                    <SelectItem value="Banking & Finance">Banking & Finance</SelectItem>
                    <SelectItem value="Telecommunications">Telecommunications</SelectItem>
                    <SelectItem value="Energy & Utilities">Energy & Utilities</SelectItem>
                    <SelectItem value="Logistics">Logistics</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="company-website" className="flex items-center gap-1">
                  <Globe className="size-3.5" />
                  Website
                </Label>
                <Input
                  id="company-website"
                  value={modalForm.website}
                  onChange={(e) => updateModal('website', e.target.value)}
                  placeholder="https://company.gov.et"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="company-phone" className="flex items-center gap-1">
                  <Phone className="size-3.5" />
                  Phone
                </Label>
                <Input
                  id="company-phone"
                  value={modalForm.phone}
                  onChange={(e) => updateModal('phone', e.target.value)}
                  placeholder="+251 11 000 0000"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!modalForm.name}>
              {saved ? (
                <>
                  <CheckCircle2 data-icon="inline-start" />
                  Saved!
                </>
              ) : 'Create Company'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}