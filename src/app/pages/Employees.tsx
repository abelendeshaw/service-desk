import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle, ArrowUpDown, CheckCircle2, Mail, Phone, Plus, Search, Shield, UserCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
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

export function Employees() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Support Engineer',
    teams: [] as string[],
    status: 'Active',
  });
  const [saved, setSaved] = useState(false);

  const updateModal = (key: string, val: string) => setModalForm((prev) => ({ ...prev, [key]: val }));

  const toggleTeam = (team: string) => {
    setModalForm((prev) => ({
      ...prev,
      teams: prev.teams.includes(team) ? prev.teams.filter((t) => t !== team) : [...prev.teams, team],
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowModal(false);
      setModalForm({ name: '', email: '', phone: '', role: 'Support Engineer', teams: [], status: 'Active' });
    }, 1000);
  };

  const filtered = employees.filter((employee) => {
    if (search && !employee.name.toLowerCase().includes(search.toLowerCase()) && !employee.email.includes(search)) return false;
    if (roleFilter !== 'all' && employee.role !== roleFilter) return false;
    if (statusFilter !== 'all' && employee.status !== statusFilter) return false;
    return true;
  });

  const roles = [...new Set(employees.map((employee) => employee.role))];

  const stats = [
    { label: 'Total Employees', value: employees.length, icon: UserCircle },
    { label: 'Active', value: employees.filter((employee) => employee.status === 'Active').length, icon: Users },
    { label: 'Roles', value: roles.length, icon: Shield },
    { label: 'Teams', value: 5, icon: Users },
  ];

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <div className="border-b bg-background px-6 py-4">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">Employees</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Team directory and role management</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/employees/teams')}>
              Team Management
            </Button>
            <Button size="sm" className="gap-1.5 text-[13px]" onClick={() => setShowModal(true)}>
              <Plus data-icon="inline-start" />
              New Employee
            </Button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-4 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                  <stat.icon className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center gap-3">
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

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle className="size-4" />
              Add New Employee
            </DialogTitle>
            <DialogDescription>Register a new team member.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="employee-name">Full Name</Label>
              <Input
                id="employee-name"
                value={modalForm.name}
                onChange={(event) => updateModal('name', event.target.value)}
                placeholder="e.g. Sisay Shiferaw"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="employee-email">Work Email</Label>
                <Input
                  id="employee-email"
                  type="email"
                  value={modalForm.email}
                  onChange={(event) => updateModal('email', event.target.value)}
                  placeholder="name@ienetworks.co"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="employee-phone">Phone</Label>
                <Input
                  id="employee-phone"
                  value={modalForm.phone}
                  onChange={(event) => updateModal('phone', event.target.value)}
                  placeholder="0987654321"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="employee-role">Role</Label>
                <Select value={modalForm.role} onValueChange={(value) => updateModal('role', value)}>
                  <SelectTrigger id="employee-role">
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
              <div className="grid gap-1.5">
                <Label htmlFor="employee-status">Status</Label>
                <Select value={modalForm.status} onValueChange={(value) => updateModal('status', value)}>
                  <SelectTrigger id="employee-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Teams</Label>
              <div className="flex flex-wrap gap-2">
                {['CA', 'ITF', 'CSD', 'NOC', 'END'].map((team) => (
                  <Button
                    key={team}
                    type="button"
                    variant={modalForm.teams.includes(team) ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => toggleTeam(team)}
                  >
                    {team}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!modalForm.name || !modalForm.email}>
              {saved ? (
                <>
                  <CheckCircle2 data-icon="inline-start" />
                  Saved!
                </>
              ) : 'Add Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}