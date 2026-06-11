import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Search, Grid3X3, List, AlertCircle, FileSearch } from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
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
  const projectNotFound = activeProject !== null && projects.length > 0 && !projects.includes(activeProject);

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

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">Knowledge Base</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Projects → Tickets → Articles</p>
          </div>
        </div>

        {/* Project filter pills */}
        <div className="flex items-center gap-1 flex-wrap">
          <Button
            variant={!activeProject ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate('/knowledge')}
            className="gap-1.5 text-[12px]"
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: !activeProject ? 'white' : '#0b2235' }} />
            All Projects
            <span className="ml-0.5 font-semibold">{tickets.length}</span>
          </Button>
          {projects.map((p, idx) => {
            const count = tickets.filter((t) => t.project === p).length;
            const isActive = activeProject === p;
            return (
              <Button
                key={p}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate(`/knowledge/project/${p}`)}
                className="gap-1.5 text-[12px]"
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive ? 'white' : avatarColors[idx % avatarColors.length] }} />
                {p}
                <span className="ml-0.5 font-semibold">{count}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b bg-background px-6 py-3 flex-shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={activeProject ? "Search tickets in project..." : "Search all ticket articles..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 bg-muted pl-9 pr-3 text-[13px]"
          />
        </div>
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

      {projectNotFound ? (
        <div className="flex-1 overflow-auto p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Project not found</AlertTitle>
            <AlertDescription>
              The project <span className="font-semibold">"{activeProject}"</span> doesn't exist or has been removed.{' '}
              <button className="underline hover:no-underline" onClick={() => navigate('/knowledge')}>
                View all projects
              </button>
            </AlertDescription>
          </Alert>
        </div>
      ) : viewMode === 'list' ? (
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Ticket</TableHead>
                <TableHead className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Support</TableHead>
                <TableHead className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Project</TableHead>
                <TableHead className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Article</TableHead>
                <TableHead className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-background">
              {projectTickets.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileSearch className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <div className="text-[14px] font-medium">No articles found</div>
                        <div className="mt-1 text-[13px] text-muted-foreground">
                          {search ? 'Try a different search term' : 'No tickets in this project yet'}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {projectTickets.map((t, idx) => {
                const article = ticketArticles[t.id] ?? getOrCreateTicketArticle({ ticketId: t.id });
                return (
                  <TableRow key={t.id} className="group cursor-pointer" onClick={() => navigate(`/knowledge/ticket/${t.id}`)}>
                    <TableCell className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8 rounded-md">
                          <AvatarFallback
                            className="rounded-md text-[11px] font-semibold text-white"
                            style={{ backgroundColor: avatarColors[idx % avatarColors.length] }}
                          >
                            {t.project.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="max-w-md truncate text-[13px] font-medium">{t.subject}</div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">#{t.id} · {t.project} · {t.supportType}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <Badge variant="outline" className="text-[11px]">{t.supportType}</Badge>
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <Badge variant="secondary" className="text-[11px]">{t.project}</Badge>
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
            {projectTickets.length === 0 && (
              <div className="col-span-3 py-16 flex flex-col items-center gap-3 text-center">
                <FileSearch className="w-8 h-8 text-muted-foreground" />
                <div>
                  <div className="text-[14px] font-medium">No articles found</div>
                  <div className="mt-1 text-[13px] text-muted-foreground">
                    {search ? 'Try a different search term' : 'No tickets in this project yet'}
                  </div>
                </div>
              </div>
            )}
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
                      <div className={`h-1.5 w-1.5 rounded-full mt-1 ${article.status === 'Published' ? 'bg-emerald-600' : 'bg-muted-foreground'}`} />
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
        </div>
      )}

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-between border-t bg-background px-6 py-3">
        <span className="text-[12px] text-muted-foreground">
          Showing {projectTickets.length} {projectTickets.length === 1 ? 'article' : 'articles'}
          {activeProject ? ` in ${activeProject}` : ''}
        </span>
      </div>
    </div>
  );
}