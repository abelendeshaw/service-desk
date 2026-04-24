import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Search, Plus,
  ArrowUpDown, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { RowActionsMenu } from '../components/RowActionsMenu';
import { useServiceDesk } from '../store/serviceDeskStore';

const statusConfig: Record<string, { dotClass: string; badgeClass: string }> = {
  Open: { dotClass: 'bg-blue-500', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  "In Progress": { dotClass: 'bg-amber-500', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  Escalated: { dotClass: 'bg-red-500', badgeClass: 'bg-red-50 text-red-700 border-red-200' },
  Resolved: { dotClass: 'bg-emerald-500', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Closed: { dotClass: 'bg-muted-foreground', badgeClass: 'bg-muted text-muted-foreground border-border' },
};

const priorityConfig: Record<string, { dotClass: string; textClass: string }> = {
  Critical: { dotClass: 'bg-red-500', textClass: 'text-red-700' },
  High: { dotClass: 'bg-amber-500', textClass: 'text-amber-700' },
  Medium: { dotClass: 'bg-blue-500', textClass: 'text-blue-700' },
  Low: { dotClass: 'bg-emerald-500', textClass: 'text-emerald-700' },
};

const avatarColors = ['#7c3aed', '#1d4ed8', '#0891b2', '#059669', '#d97706', '#dc2626'];

export function Tickets() {
  const navigate = useNavigate();
  const { tickets, engineers } = useServiceDesk();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [engineerFilter, setEngineerFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const projects = useMemo(() => Array.from(new Set(tickets.map((t) => t.project))).sort(), [tickets]);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (
        search &&
        !t.subject.toLowerCase().includes(search.toLowerCase()) &&
        !t.id.includes(search) &&
        !t.project.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (statusFilter !== 'all' && t.status.toLowerCase() !== statusFilter) return false;
      if (priorityFilter !== 'all') {
        if (priorityFilter === 'none' && t.priority !== null) return false;
        if (priorityFilter !== 'none' && t.priority?.toLowerCase() !== priorityFilter) return false;
      }
      if (projectFilter !== 'all' && t.project !== projectFilter) return false;
      if (engineerFilter !== 'all' && (t.assignedEngineerId ?? 'unassigned') !== engineerFilter) return false;
      if (fromDate && t.createdAt.slice(0, 10) < fromDate) return false;
      if (toDate && t.createdAt.slice(0, 10) > toDate) return false;
      return true;
    });
  }, [engineerFilter, fromDate, priorityFilter, projectFilter, search, statusFilter, tickets, toDate]);

  React.useEffect(() => {
    setSelected((prev) => prev.filter((id) => filtered.some((t) => t.id === id)));
  }, [filtered]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const stats = [
    { label: 'Total', value: tickets.length, color: '#0b2235' },
    { label: 'Open', value: tickets.filter(t => t.status === 'Open').length, color: '#2563eb' },
    { label: 'Escalated', value: tickets.filter(t => t.status === 'Escalated').length, color: '#dc2626' },
    { label: 'In Progress', value: tickets.filter(t => t.status === 'In Progress').length, color: '#d97706' },
    { label: 'Closed', value: tickets.filter(t => t.status === 'Closed').length, color: '#6c757d' },
  ];

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Page Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">Tickets</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Manage and track all support tickets</p>
          </div>
          <Button
            onClick={() => navigate('/tickets/new')}
            size="sm"
            className="text-[13px]"
          >
            <Plus className="w-3.5 h-3.5" />
            New Ticket
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-1">
          {stats.map((s, i) => (
            <Button
              key={s.label}
              variant={(s.label === 'Total' && statusFilter === 'all') || (s.label !== 'Total' && statusFilter === s.label.toLowerCase()) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(s.label === 'Total' ? 'all' : s.label.toLowerCase())}
              className="gap-1.5 text-[12px]"
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: (s.label === 'Total' && statusFilter === 'all') || (s.label !== 'Total' && statusFilter === s.label.toLowerCase()) ? 'white' : s.color }} />
              {s.label}
              <span className={`ml-0.5 font-semibold`}>{s.value}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b bg-background px-6 py-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 bg-muted pl-9 pr-3 text-[13px]"
          />
        </div>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="h-8 w-[160px] text-[13px]">
            <SelectValue placeholder="All Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="none">No Priority</SelectItem>
          </SelectContent>
        </Select>

        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="h-8 w-[140px] text-[13px]">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={engineerFilter} onValueChange={setEngineerFilter}>
          <SelectTrigger className="h-8 w-[170px] text-[13px]">
            <SelectValue placeholder="All Engineers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Engineers</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {engineers.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-8 w-[140px] text-[13px]" />
        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-8 w-[140px] text-[13px]" />

        {selected.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[12px] text-muted-foreground">{selected.length} selected</span>
            <Button variant="destructive" size="sm" className="h-7 px-2.5 text-[12px]">
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead className="w-10 pl-5 py-3">
                <Checkbox
                  onCheckedChange={(checked) => setSelected(checked ? filtered.map(t => t.id) : [])}
                  checked={selected.length === filtered.length && filtered.length > 0}
                />
              </TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <div className="flex cursor-pointer items-center gap-1 hover:text-foreground">
                  Subject <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Priority</TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Assigned</TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <div className="flex cursor-pointer items-center gap-1 hover:text-foreground">
                  Created <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead className="w-10 pr-4" />
            </TableRow>
          </TableHeader>
          <TableBody className="bg-background">
            {filtered.map((ticket, i) => {
              const sc = statusConfig[ticket.status];
              const pc = ticket.priority ? priorityConfig[ticket.priority] : null;
              const isSelected = selected.includes(ticket.id);
              const eng = ticket.assignedEngineerId ? engineers.find((e) => e.id === ticket.assignedEngineerId) : null;
              return (
                <TableRow
                  key={ticket.id}
                  data-state={isSelected ? 'selected' : undefined}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <TableCell className="w-10 pl-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(ticket.id)} />
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 rounded-md">
                        <AvatarFallback
                          className="rounded-md text-[11px] font-semibold text-white"
                          style={{ backgroundColor: avatarColors[i % avatarColors.length] }}
                        >
                          {ticket.project.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="max-w-md truncate text-[13px] font-medium">{ticket.subject}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">#{ticket.id} · {ticket.project} · {ticket.supportType}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <Badge variant="outline" className={`gap-1.5 ${sc?.badgeClass}`}>
                      <span className={`size-1.5 rounded-full ${sc?.dotClass}`} />
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    {pc ? (
                      <div className="flex items-center gap-1.5">
                        <span className={`size-1.5 rounded-full ${pc.dotClass}`} />
                        <span className={`text-[12px] ${pc.textClass}`}>{ticket.priority}</span>
                      </div>
                    ) : (
                      <span className="text-[12px] text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    {eng ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarFallback
                            className="text-[10px] font-semibold text-white"
                            style={{ backgroundColor: avatarColors[(i + 1) % avatarColors.length] }}
                          >
                            {eng.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[12px] text-muted-foreground truncate max-w-[140px]">{eng.name}</span>
                      </div>
                    ) : (
                      <span className="text-[12px] text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div className="text-[12px] text-muted-foreground">{ticket.createdAt.slice(0, 10)}</div>
                    <div className="text-[11px] text-muted-foreground">{ticket.updatedAt.slice(0, 10)}</div>
                  </TableCell>
                  <TableCell className="pr-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <RowActionsMenu
                      entityName={ticket.id}
                      onView={() => navigate(`/tickets/${ticket.id}`)}
                      onEdit={() => toast.info(`Edit ${ticket.id} coming soon`)}
                      onDelete={() => toast.success(`${ticket.id} deleted`)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <AlertCircle className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <div className="text-[14px] font-medium">No tickets found</div>
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
        <span className="text-[12px] text-muted-foreground">Showing {filtered.length} of {tickets.length} tickets</span>
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            {[1, 2, 3].map((p) => (
              <PaginationItem key={p}>
                <PaginationLink href="#" isActive={p === 1}>
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
