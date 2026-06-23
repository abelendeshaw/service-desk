import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Grid3X3, List, FileSearch } from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { getTicketProjectName, ticketCompany } from '../lib/ticketProjects';
import { useServiceDesk, draftTicketArticle } from '../store/serviceDeskStore';
import { getTicketSupportType, supportTypeBadgeClass } from '../lib/ticketSupportType';

const avatarColors = ['#7c3aed', '#1d4ed8', '#0891b2', '#059669', '#d97706', '#dc2626'];

const supportTypeConfig: Record<string, { badgeClass: string }> = {
  CSAT: { badgeClass: supportTypeBadgeClass.CSAT },
  'Normal Support': { badgeClass: supportTypeBadgeClass['Normal Support'] },
};

export function KnowledgeBase() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const navigate = useNavigate();
  const { tickets, ticketArticles, slas } = useServiceDesk();

  const companies = useMemo(
    () => Array.from(new Set(tickets.map((t) => ticketCompany(t)))).sort(),
    [tickets],
  );

  const projectNames = useMemo(
    () => Array.from(new Set(tickets.map((t) => getTicketProjectName(t, slas)))).sort(),
    [tickets, slas],
  );

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const article = ticketArticles[t.id] ?? draftTicketArticle(t);
      if (companyFilter !== 'all' && ticketCompany(t) !== companyFilter) return false;
      if (projectFilter !== 'all' && getTicketProjectName(t, slas) !== projectFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      const supportType = getTicketSupportType(slas, t.project);
      return (
        article.title.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.id.includes(q) ||
        supportType.toLowerCase().includes(q) ||
        ticketCompany(t).toLowerCase().includes(q) ||
        getTicketProjectName(t, slas).toLowerCase().includes(q)
      );
    });
  }, [tickets, companyFilter, projectFilter, search, slas, ticketArticles]);

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <div className="bg-sidebar border-sidebar-border flex-shrink-0 border-b px-6 py-4">
        <div>
          <h1 className="text-sidebar-foreground text-[20px] font-semibold tracking-tight">Knowledge Base</h1>
          <p className="text-sidebar-muted-foreground mt-0.5 text-[13px]">
            Browse and manage knowledge articles from support tickets
          </p>
        </div>
      </div>

      <div className="flex flex-shrink-0 flex-wrap items-center gap-3 border-b bg-background px-6 py-3">
        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search articles, tickets, companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 bg-muted pl-9 pr-3 text-[13px]"
          />
        </div>
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="h-8 w-[150px] text-[12px]">
            <SelectValue placeholder="Company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[12px]">All companies</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company} value={company} className="text-[12px]">
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="h-8 w-[160px] text-[12px]">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[12px]">All projects</SelectItem>
            {projectNames.map((name) => (
              <SelectItem key={name} value={name} className="text-[12px]">
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-1 rounded-md border bg-muted p-0.5">
          <Button
            onClick={() => setViewMode('list')}
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="size-7"
          >
            <List className="w-3.5 h-3.5" />
          </Button>
          <Button
            onClick={() => setViewMode('grid')}
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="size-7"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Article</TableHead>
                <TableHead className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Support</TableHead>
                <TableHead className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Company</TableHead>
                <TableHead className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Project</TableHead>
                <TableHead className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-background">
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileSearch className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <div className="text-[14px] font-medium">No articles found</div>
                        <div className="mt-1 text-[13px] text-muted-foreground">
                          {search || companyFilter !== 'all' || projectFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'No knowledge articles yet'}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {filteredTickets.map((t, idx) => {
                const article = ticketArticles[t.id] ?? draftTicketArticle(t);
                const supportType = getTicketSupportType(slas, t.project);
                const supportBadge = supportTypeConfig[supportType];
                return (
                  <TableRow key={t.id} className="group cursor-pointer" onClick={() => navigate(`/knowledge/ticket/${t.id}`)}>
                    <TableCell className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8 rounded-md">
                          <AvatarFallback
                            className="rounded-md text-[11px] font-semibold text-white"
                            style={{ backgroundColor: avatarColors[idx % avatarColors.length] }}
                          >
                            {ticketCompany(t).slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="max-w-md truncate text-[13px] font-medium">{article.title}</div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">#{t.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <Badge variant="outline" className={`text-[11px] ${supportBadge.badgeClass}`}>{supportType}</Badge>
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <Badge variant="secondary" className="text-[11px]">{ticketCompany(t)}</Badge>
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <Badge variant="outline" className="text-[11px]">{getTicketProjectName(t, slas)}</Badge>
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${article.status === 'Published' ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${article.status === 'Published' ? 'bg-emerald-600' : 'bg-muted-foreground'}`} />
                        {article.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-[12px] text-muted-foreground">
                      {article.updatedAt.slice(0, 10)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-3 gap-4">
            {filteredTickets.length === 0 && (
              <div className="col-span-3 flex flex-col items-center gap-3 py-16 text-center">
                <FileSearch className="w-8 h-8 text-muted-foreground" />
                <div>
                  <div className="text-[14px] font-medium">No articles found</div>
                  <div className="mt-1 text-[13px] text-muted-foreground">
                    {search || companyFilter !== 'all' || projectFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'No knowledge articles yet'}
                  </div>
                </div>
              </div>
            )}
            {filteredTickets.map((t, idx) => {
              const article = ticketArticles[t.id] ?? draftTicketArticle(t);
              const supportType = getTicketSupportType(slas, t.project);
              const supportBadge = supportTypeConfig[supportType];
              return (
                <Card key={t.id} className="group cursor-pointer p-4 transition-all hover:shadow-sm" onClick={() => navigate(`/knowledge/ticket/${t.id}`)}>
                  <CardContent className="p-0">
                    <div className="mb-3 flex items-start justify-between">
                      <Avatar className="size-8 rounded-md">
                        <AvatarFallback className="rounded-md text-[11px] font-semibold text-white" style={{ backgroundColor: avatarColors[idx % avatarColors.length] }}>
                          {ticketCompany(t).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`mt-1 h-1.5 w-1.5 rounded-full ${article.status === 'Published' ? 'bg-emerald-600' : 'bg-muted-foreground'}`} />
                    </div>
                    <h3 className="mb-2 line-clamp-2 text-[13px] font-medium leading-snug">{article.title}</h3>
                    <div className="mb-2 flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-[10px]">{ticketCompany(t)}</Badge>
                      <Badge variant="outline" className="text-[10px]">{getTicketProjectName(t, slas)}</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="outline" className={`text-[10px] ${supportBadge.badgeClass}`}>{supportType}</Badge>
                      <span className={`text-[11px] font-medium ${article.status === 'Published' ? 'text-emerald-600' : 'text-muted-foreground'}`}>{article.status}</span>
                    </div>
                    <div className="mt-2 border-t pt-2 text-[11px] text-muted-foreground">#{t.id} · {article.updatedAt.slice(0, 10)}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex shrink-0 items-center justify-between border-t bg-background px-6 py-3">
        <span className="text-[12px] text-muted-foreground">
          Showing {filteredTickets.length} {filteredTickets.length === 1 ? 'article' : 'articles'}
        </span>
      </div>
    </div>
  );
}
