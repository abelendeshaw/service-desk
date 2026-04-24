import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Search, BookOpen, Folder, Grid3X3, List, FileText } from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { useServiceDesk } from '../store/serviceDeskStore';

const avatarColors = ['#7c3aed', '#1d4ed8', '#0891b2', '#059669', '#d97706', '#dc2626'];

export function KnowledgeBase() {
  const { project } = useParams<{ project?: string }>();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const navigate = useNavigate();
  const { tickets, ticketArticles, getOrCreateTicketArticle } = useServiceDesk();

  const projects = useMemo(
    () => Array.from(new Set(tickets.map((t) => t.project))).sort(),
    [tickets],
  );

  const activeProject = project ?? null;

  const projectTickets = useMemo(() => {
    const pool = activeProject ? tickets.filter((t) => t.project === activeProject) : tickets;
    return pool.filter((t) => {
      if (!search) return true;
      return (
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.id.includes(search) ||
        t.supportType.toLowerCase().includes(search.toLowerCase()) ||
        t.project.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [activeProject, search, tickets]);

  const stats = [
    { label: 'Projects', value: projects.length, icon: Folder, color: '#0b2235' },
    { label: 'Tickets', value: activeProject ? projectTickets.length : tickets.length, icon: FileText, color: '#2563eb' },
    { label: 'Articles', value: Object.keys(ticketArticles).length, icon: BookOpen, color: '#059669' },
    { label: 'View', value: activeProject ? activeProject : 'All', icon: Grid3X3, color: '#d97706' },
  ];

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">Knowledge Base</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Projects → Tickets → Articles</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-[13px]">
              <Folder className="w-3.5 h-3.5" />
              Projects
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
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
              placeholder={activeProject ? "Search tickets in project..." : "Search all ticket articles..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 bg-muted pl-9 pr-3 text-[13px]"
            />
          </div>
          <Select value={activeProject ?? "all"} onValueChange={(v) => navigate(v === "all" ? "/knowledge" : `/knowledge/project/${v}`)}>
            <SelectTrigger className="h-8 w-[180px] text-[13px]">
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
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="flex gap-5">
          {/* Projects Sidebar */}
          <div className="w-52 flex-shrink-0 space-y-2">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Projects</div>
            <Button
              onClick={() => navigate("/knowledge")}
              variant={!activeProject ? 'default' : 'ghost'}
              className="h-auto w-full justify-between px-3 py-2 text-[13px]"
            >
              <span>All Projects</span>
              <span className="text-[11px] font-semibold">{projects.length}</span>
            </Button>
            {projects.map((p, idx) => {
              const count = tickets.filter((t) => t.project === p).length;
              return (
                <Button
                  key={p}
                  onClick={() => navigate(`/knowledge/project/${p}`)}
                  variant={activeProject === p ? 'default' : 'ghost'}
                  className="h-auto w-full justify-between px-3 py-2 text-[13px]"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: activeProject === p ? 'white' : avatarColors[idx % avatarColors.length] }} />
                    <span>{p}</span>
                  </div>
                  <span className="text-[11px] font-semibold">{count}</span>
                </Button>
              );
            })}
          </div>

          {/* Tickets */}
          <div className="flex-1 min-w-0">
            {viewMode === 'list' ? (
              <Card className="overflow-hidden p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Ticket</TableHead>
                      <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Support</TableHead>
                      <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Project</TableHead>
                      <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Article</TableHead>
                      <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectTickets.map((t, idx) => {
                      const article = ticketArticles[t.id] ?? getOrCreateTicketArticle({ ticketId: t.id });
                      return (
                        <TableRow
                          key={t.id}
                          className="group cursor-pointer"
                          onClick={() => navigate(`/knowledge/ticket/${t.id}`)}
                        >
                          <TableCell className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-7 rounded-md">
                                <AvatarFallback
                                  className="rounded-md text-[10px] font-semibold text-white"
                                  style={{ backgroundColor: avatarColors[idx % avatarColors.length] }}
                                >
                                  {t.project.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="line-clamp-1 text-[13px] font-medium">{t.subject}</div>
                                <div className="mt-0.5 text-[11px] text-muted-foreground">#{t.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-3.5">
                            <Badge variant="outline" className="text-[11px]">
                              {t.supportType}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-5 py-3.5">
                            <Badge variant="secondary" className="text-[11px]">
                              {t.project}
                            </Badge>
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
              </Card>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {projectTickets.map((t, idx) => {
                  const article = ticketArticles[t.id] ?? getOrCreateTicketArticle({ ticketId: t.id });
                  return (
                    <Card key={t.id} className="group cursor-pointer p-4 transition-all hover:shadow-sm" onClick={() => navigate(`/knowledge/ticket/${t.id}`)}>
                      <CardContent className="p-0">
                        <div className="flex items-start justify-between mb-3">
                          <Avatar className="size-8 rounded-md">
                            <AvatarFallback className="rounded-md text-[11px] font-semibold text-white" style={{ backgroundColor: avatarColors[idx % avatarColors.length] }}>
                              {t.project.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center gap-1">
                            <div className={`h-1.5 w-1.5 rounded-full ${article.status === 'Published' ? 'bg-emerald-600' : 'bg-muted-foreground'}`} />
                          </div>
                        </div>
                        <h3 className="mb-2 line-clamp-2 text-[13px] leading-snug font-medium">{t.subject}</h3>
                        <div className="flex items-center justify-between mt-3">
                          <Badge variant="outline" className="text-[10px]">{t.supportType}</Badge>
                          <span className={`text-[11px] font-medium ${article.status === 'Published' ? 'text-emerald-600' : 'text-muted-foreground'}`}>{article.status}</span>
                        </div>
                        <div className="mt-2 border-t pt-2 text-[11px] text-muted-foreground">{t.project} · #{t.id} · {article.updatedAt.slice(0, 10)}</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}