import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle, ArrowUpDown, Check, CheckCircle2, Mail, Phone, Plus, Search, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '../components/ui/alert';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { RowActionsMenu } from '../components/RowActionsMenu';

const employees = [
  { name: 'Abraham Tayu', email: 'abreham.t@ienetworks.co', phone: '0987654321', role: 'Admin', teams: ['CA', 'ITF', 'CSD', 'NOC'], status: 'Active', initials: 'AT', lastSeen: '2 hours ago' },
  { name: 'Masresha Melese', email: 'masresha.melese@ienetworks.co', phone: '0987654321', role: 'Field Engineer', teams: ['ITF'], status: 'Active', initials: 'MM', lastSeen: '1 day ago' },
  { name: 'Wongel Wondyifraw', email: 'wongel@ienetworks.co', phone: '0994247181', role: 'Field Engineer', teams: ['CA'], status: 'Active', initials: 'WW', lastSeen: '3 hours ago' },
  { name: 'Mebrate Degu', email: 'mebrate.d@ienetworks.co', phone: '0987654321', role: 'Admin', teams: ['CA'], status: 'Active', initials: 'MD', lastSeen: '5 hours ago' },
  { name: 'Sisay Shiferaw', email: 'sisay.shiferaw@ienetworks.co', phone: '0987654321', role: 'Support Engineer', teams: ['CSD', 'NOC'], status: 'Active', initials: 'SS', lastSeen: '30 mins ago' },
  { name: 'Abay Bank Client', email: 'abaybank@gmail.com', phone: '0987654321', role: 'External', teams: [], status: 'Inactive', initials: 'AB', lastSeen: '15 days ago' },
  { name: 'MoTI Client', email: 'moti@gmail.com', phone: '0987654321', role: 'External', teams: [], status: 'Active', initials: 'MC', lastSeen: '7 days ago' },
  { name: 'Dawit Bekele', email: 'dawit.b@ienetworks.co', phone: '0987654321', role: 'NOC Engineer', teams: ['NOC'], status: 'Active', initials: 'DB', lastSeen: '1 hour ago' },
];

const EMPLOYEE_POOL = [
  { id: 'pool-1', name: 'Yohannes Girma', email: 'yohannes.g@ienetworks.co', phone: '0911223344', department: 'Network Operations' },
  { id: 'pool-2', name: 'Hiwot Tadesse', email: 'hiwot.t@ienetworks.co', phone: '0922334455', department: 'Customer Support' },
  { id: 'pool-3', name: 'Biruk Alemu', email: 'biruk.a@ienetworks.co', phone: '0933445566', department: 'Field Engineering' },
  { id: 'pool-4', name: 'Tigist Haile', email: 'tigist.h@ienetworks.co', phone: '0944556677', department: 'IT Infrastructure' },
];

export function Employees() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [saved, setSaved] = useState(false);

  // Add user modal state
  const [addSearch, setAddSearch] = useState('');
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [addRole, setAddRole] = useState('Support Engineer');
  const [addStatus, setAddStatus] = useState('Active');
  const [addTeams, setAddTeams] = useState<string[]>([]);
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteDepartment, setInviteDepartment] = useState('');

  const existingEmails = useMemo(() => new Set(employees.map((e) => e.email)), []);
  const poolCandidates = useMemo(
    () => EMPLOYEE_POOL.filter(
      (u) => !existingEmails.has(u.email) &&
        (u.name.toLowerCase().includes(addSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(addSearch.toLowerCase()))
    ),
    [existingEmails, addSearch]
  );

  const looksLikeEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const isUnknownInvite = !selectedPoolId && looksLikeEmail(addSearch);
  const canAddUser = !!selectedPoolId || (isUnknownInvite && inviteName.trim().length > 0);

  const toggleTeam = (team: string) => {
    setAddTeams((prev) => prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team]);
  };

  function closeAddDialog() {
    setShowModal(false);
    setAddSearch('');
    setSelectedPoolId(null);
    setComboboxOpen(false);
    setAddRole('Support Engineer');
    setAddStatus('Active');
    setAddTeams([]);
    setInviteName('');
    setInvitePhone('');
    setInviteDepartment('');
  }

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      closeAddDialog();
    }, 1000);
  };

  const filtered = employees.filter((employee) => {
    if (search && !employee.name.toLowerCase().includes(search.toLowerCase()) && !employee.email.includes(search)) return false;
    if (roleFilter !== 'all' && employee.role !== roleFilter) return false;
    if (statusFilter !== 'all' && employee.status !== statusFilter) return false;
    return true;
  });

  const roles = [...new Set(employees.map((employee) => employee.role))];

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <div className="border-b bg-background px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">User Management</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Team directory and role management · {employees.length} members</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/employees/teams')}>
              Team Management
            </Button>
            <Button size="sm" className="gap-1.5 text-[13px]" onClick={() => setShowModal(true)}>
              <Plus className="w-3.5 h-3.5" />
              New Employee
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-b bg-background px-6 py-3 flex-shrink-0">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-8 bg-muted pl-9 pr-3 text-[13px]"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="h-8 w-[180px] text-[13px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {roles.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-[150px] text-[13px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead className="w-10 pl-6 py-3">
                <Checkbox />
              </TableHead>
              <TableHead className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-semibold uppercase">
                  Employee
                  <ArrowUpDown data-icon="inline-end" />
                </Button>
              </TableHead>
              <TableHead className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Role</TableHead>
              <TableHead className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Teams</TableHead>
              <TableHead className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Phone</TableHead>
              <TableHead className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Last Seen</TableHead>
              <TableHead className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="w-10 pr-4" />
            </TableRow>
          </TableHeader>
          <TableBody className="bg-background">
            {filtered.map((employee, index) => (
              <TableRow
                key={index}
                className="group cursor-pointer"
                onClick={() => navigate(`/employees/${encodeURIComponent(employee.email)}`)}
              >
                <TableCell className="w-10 pl-6 py-3.5">
                  <Checkbox onClick={(event) => event.stopPropagation()} />
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-muted text-[11px] font-semibold text-foreground">{employee.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[13px] font-medium">{employee.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Mail className="size-3" />
                        {employee.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <Badge variant="secondary">{employee.role}</Badge>
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {employee.teams.length > 0 ? employee.teams.map((team) => (
                      <Badge key={team} variant="outline">{team}</Badge>
                    )) : <span className="text-xs text-muted-foreground">—</span>}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="size-3.5" />
                    {employee.phone}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <span className="text-xs text-muted-foreground">{employee.lastSeen}</span>
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <Badge variant={employee.status === 'Active' ? 'secondary' : 'outline'}>{employee.status}</Badge>
                </TableCell>
                <TableCell className="pr-4 py-3.5" onClick={(event) => event.stopPropagation()}>
                  <RowActionsMenu
                    entityName={employee.name}
                    onView={() => navigate(`/employees/${encodeURIComponent(employee.email)}`)}
                    onEdit={() => toast.info(`Edit ${employee.name} coming soon`)}
                    onDelete={() => toast.success(`${employee.name} deleted`)}
                  />
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-16 text-center">
                  <AlertCircle className="mx-auto mb-3 size-8 text-muted-foreground" />
                  <p className="text-[14px] font-medium">No employees found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t bg-background px-6 py-3">
        <span className="text-[12px] text-muted-foreground">Showing {filtered.length} of {employees.length} employees</span>
      </div>

      <Dialog open={showModal} onOpenChange={(open) => { if (!open) closeAddDialog(); else setShowModal(true); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle className="size-4" />
              Add New Employee
            </DialogTitle>
            <DialogDescription>
              Search for a known employee or type an email address to invite someone new.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-1">
            {/* Employee search combobox */}
            <div>
              <Label className="mb-1.5 block text-xs font-medium">
                Employee <span className="text-destructive">*</span>
              </Label>
              <div
                className="relative"
                onBlurCapture={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                    window.setTimeout(() => setComboboxOpen(false), 120);
                  }
                }}
              >
                <Input
                  value={addSearch}
                  placeholder="Search by name or type an email address…"
                  className="h-10 pr-9"
                  onFocus={() => setComboboxOpen(true)}
                  onClick={() => setComboboxOpen(true)}
                  onChange={(e) => {
                    setAddSearch(e.target.value);
                    setSelectedPoolId(null);
                    setComboboxOpen(true);
                  }}
                />
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                {comboboxOpen && (
                  <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-background p-1 shadow-md">
                    {poolCandidates.length === 0 ? (
                      <div className="px-3 py-2.5 text-xs text-muted-foreground">
                        {looksLikeEmail(addSearch)
                          ? `No match found — fill in the details below to invite ${addSearch.trim()}.`
                          : 'No matching employees. Type an email address to invite someone new.'}
                      </div>
                    ) : (
                      poolCandidates.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSelectedPoolId(u.id);
                            setAddSearch(u.name);
                            setComboboxOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-muted ${selectedPoolId === u.id ? 'bg-muted ring-1 ring-ring' : ''}`}
                        >
                          <Avatar className="size-8 shrink-0">
                            <AvatarFallback className="bg-muted text-[11px] font-semibold">
                              {u.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="text-sm font-medium leading-tight">{u.name}</div>
                            <div className="text-xs text-muted-foreground">{u.email} · {u.department}</div>
                          </div>
                          {selectedPoolId === u.id && <Check className="ml-auto h-4 w-4 shrink-0 text-primary" />}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Unknown invitee details — shown only when typed value is an email not in the pool */}
            {isUnknownInvite && (
              <div className="rounded-lg border bg-muted/40 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">New invitee details</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="mb-1.5 block text-xs font-medium">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="e.g. Sisay Shiferaw"
                      className="h-10 bg-background"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-1.5 block text-xs font-medium">Phone</Label>
                      <Input
                        value={invitePhone}
                        onChange={(e) => setInvitePhone(e.target.value)}
                        placeholder="0987654321"
                        className="h-10 bg-background"
                      />
                    </div>
                    <div>
                      <Label className="mb-1.5 block text-xs font-medium">Department / Team</Label>
                      <Input
                        value={inviteDepartment}
                        onChange={(e) => setInviteDepartment(e.target.value)}
                        placeholder="e.g. Network Operations"
                        className="h-10 bg-background"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Role + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block text-xs font-medium">Role</Label>
                <Select value={addRole} onValueChange={setAddRole}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Field Engineer">Field Engineer</SelectItem>
                    <SelectItem value="Support Engineer">Support Engineer</SelectItem>
                    <SelectItem value="NOC Engineer">NOC Engineer</SelectItem>
                    <SelectItem value="External">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs font-medium">Status</Label>
                <Select value={addStatus} onValueChange={setAddStatus}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Teams */}
            <div>
              <Label className="mb-2 block text-xs font-medium">Teams</Label>
              <div className="flex flex-wrap gap-2">
                {['CA', 'ITF', 'CSD', 'NOC', 'END'].map((team) => (
                  <Button
                    key={team}
                    type="button"
                    variant={addTeams.includes(team) ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => toggleTeam(team)}
                  >
                    {team}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {saved && (
            <Alert className="border-primary bg-primary text-primary-foreground [&>svg]:text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{isUnknownInvite ? 'Invite sent successfully' : 'Employee added successfully'}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={closeAddDialog}>Cancel</Button>
            <Button onClick={handleSave} disabled={!canAddUser}>
              {isUnknownInvite ? 'Send Invite' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}