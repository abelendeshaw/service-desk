import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Plus, BookOpen, Folder, Eye, MessageSquare, Grid3X3, List, Tag, FileText, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { RowActionsMenu } from '../components/RowActionsMenu';

const categories = [
  { name: 'Network', count: 5, color: '#2563eb' },
  { name: 'Power & UPS', count: 3, color: '#d97706' },
  { name: 'Servers', count: 4, color: '#0891b2' },
  { name: 'Security', count: 2, color: '#dc2626' },
  { name: 'General', count: 1, color: '#059669' },
];

const articles = [
  { id: 1, title: 'EPSS Backup Clone issue — Dell EMC Data Domain', category: 'Servers', views: 12, comments: 2, author: 'Sisay Shiferaw', initials: 'SS', color: '#7c3aed', date: '2025-10-06', status: 'Published' },
  { id: 2, title: 'ERA DC AC power conditioning and failover', category: 'Power & UPS', views: 7, comments: 0, author: 'Wongel Wondyifraw', initials: 'WW', color: '#1d4ed8', date: '2025-11-05', status: 'Published' },
  { id: 3, title: 'MOF dual AP high availability sync configuration', category: 'Network', views: 9, comments: 1, author: 'Masresha Melese', initials: 'MM', color: '#0891b2', date: '2025-11-09', status: 'Published' },
  { id: 4, title: 'ERA/MOTL FortiNAC configuration and NAC policy', category: 'Security', views: 4, comments: 0, author: 'Abraham Tayu', initials: 'AT', color: '#7c3aed', date: '2025-10-05', status: 'Draft' },
  { id: 5, title: 'EPSS Data Domain — lost volume recovery procedure', category: 'Servers', views: 15, comments: 3, author: 'Sisay Shiferaw', initials: 'SS', color: '#7c3aed', date: '2025-10-06', status: 'Published' },
  { id: 6, title: 'MinT SR MOUI site Power and UPS replacement guide', category: 'Power & UPS', views: 3, comments: 0, author: 'Mebrate Degu', initials: 'MD', color: '#059669', date: '2025-10-06', status: 'Published' },
  { id: 7, title: 'ESLSE Active Directory and DNS Server configuration', category: 'Servers', views: 8, comments: 1, author: 'Wongel Wondyifraw', initials: 'WW', color: '#1d4ed8', date: '2025-10-05', status: 'Published' },
  { id: 8, title: 'ESLSE UAG SSL Certificate Renewal walkthrough', category: 'Security', views: 6, comments: 0, author: 'Abraham Tayu', initials: 'AT', color: '#7c3aed', date: '2025-11-05', status: 'Published' },
  { id: 9, title: 'MinT SR Hawasa site TAP IP address configuration', category: 'Network', views: 2, comments: 0, author: 'Masresha Melese', initials: 'MM', color: '#0891b2', date: '2025-10-06', status: 'Published' },
  { id: 10, title: 'MINT ECA DC WoredaNet network configuration guide', category: 'Network', views: 5, comments: 0, author: 'Masresha Melese', initials: 'MM', color: '#0891b2', date: '2025-10-06', status: 'Published' },
  { id: 11, title: 'MOTI wall mount AC unit replacement procedure', category: 'Power & UPS', views: 1, comments: 0, author: 'Wongel Wondyifraw', initials: 'WW', color: '#1d4ed8', date: '2025-10-06', status: 'Draft' },
  { id: 12, title: 'MOTI core network connectivity and routing issue', category: 'Network', views: 4, comments: 0, author: 'Sisay Shiferaw', initials: 'SS', color: '#7c3aed', date: '2025-10-06', status: 'Published' },
];

export function KnowledgeBase() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const navigate = useNavigate();

  const filtered = articles.filter(a => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  });

  const stats = [
    { label: 'Total Articles', value: articles.length, icon: FileText, color: '#0b2235' },
    { label: 'Published', value: articles.filter(a => a.status === 'Published').length, icon: BookOpen, color: '#059669' },
    { label: 'Total Views', value: articles.reduce((a, b) => a + b.views, 0), icon: Eye, color: '#2563eb' },
    { label: 'Categories', value: categories.length, icon: Tag, color: '#d97706' },
  ];

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">Knowledge Base</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Technical documentation and resolution guides</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-[13px]">
              <Folder className="w-3.5 h-3.5" />
              Categories
            </Button>
            <Button
              onClick={() => navigate('/knowledge/new')}
              size="sm"
              className="gap-1.5 text-[13px]"
            >
              <Plus className="w-3.5 h-3.5" />
              New Article
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
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 bg-muted pl-9 pr-3 text-[13px]"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-8 w-[170px] text-[13px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[140px] text-[13px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
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
          {/* Categories Sidebar */}
          <div className="w-48 flex-shrink-0 space-y-2">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Categories</div>
            <Button
              onClick={() => setCategoryFilter('all')}
              variant={categoryFilter === 'all' ? 'default' : 'ghost'}
              className="h-auto w-full justify-between px-3 py-2 text-[13px]"
            >
              <span>All Articles</span>
              <span className="text-[11px] font-semibold">{articles.length}</span>
            </Button>
            {categories.map(cat => (
              <Button
                key={cat.name}
                onClick={() => setCategoryFilter(cat.name)}
                variant={categoryFilter === cat.name ? 'default' : 'ghost'}
                className="h-auto w-full justify-between px-3 py-2 text-[13px]"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: categoryFilter === cat.name ? 'white' : cat.color }} />
                  <span>{cat.name}</span>
                </div>
                <span className="text-[11px] font-semibold">{cat.count}</span>
              </Button>
            ))}
          </div>

          {/* Articles */}
          <div className="flex-1 min-w-0">
            {viewMode === 'list' ? (
              <Card className="overflow-hidden p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Article</TableHead>
                      <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Category</TableHead>
                      <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Stats</TableHead>
                      <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Date</TableHead>
                      <TableHead className="w-10 pr-4" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((article) => {
                      const cat = categories.find(c => c.name === article.category);
                      return (
                        <TableRow key={article.id} className="group cursor-pointer" onClick={() => navigate(`/knowledge/${article.id}`)}>
                          <TableCell className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-7 rounded-md">
                                <AvatarFallback className="rounded-md text-[10px] font-semibold text-white" style={{ backgroundColor: article.color }}>
                                  {article.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="line-clamp-1 text-[13px] font-medium">{article.title}</div>
                                <div className="mt-0.5 text-[11px] text-muted-foreground">by {article.author}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-3.5">
                            <Badge variant="outline" className="text-[11px]">
                              {article.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-5 py-3.5">
                            <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" /> {article.views}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5" /> {article.comments}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${article.status === 'Published' ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                              <div className={`h-1.5 w-1.5 rounded-full ${article.status === 'Published' ? 'bg-emerald-600' : 'bg-muted-foreground'}`} />
                              {article.status}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-3.5 text-[12px] text-muted-foreground">{article.date}</TableCell>
                          <TableCell className="pr-4 py-3.5" onClick={(event) => event.stopPropagation()}>
                            <RowActionsMenu
                              entityName={article.title}
                              onView={() => navigate(`/knowledge/${article.id}`)}
                              onEdit={() => navigate(`/knowledge/edit/${article.id}`)}
                              onDelete={() => toast.success(`Article "${article.title}" deleted`)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {filtered.map((article) => {
                  const cat = categories.find(c => c.name === article.category);
                  return (
                    <Card key={article.id} className="group cursor-pointer p-4 transition-all hover:shadow-sm" onClick={() => navigate(`/knowledge/${article.id}`)}>
                      <CardContent className="p-0">
                      <div className="flex items-start justify-between mb-3">
                        <Avatar className="size-8 rounded-md">
                          <AvatarFallback className="rounded-md text-[11px] font-semibold text-white" style={{ backgroundColor: article.color }}>
                            {article.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-1">
                          <div className={`h-1.5 w-1.5 rounded-full ${article.status === 'Published' ? 'bg-emerald-600' : 'bg-muted-foreground'}`} />
                        </div>
                      </div>
                      <h3 className="mb-2 line-clamp-2 text-[13px] leading-snug font-medium">{article.title}</h3>
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant="outline" className="text-[10px]">
                          {article.category}
                        </Badge>
                        <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
                          <div className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {article.views}</div>
                          <div className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" /> {article.comments}</div>
                        </div>
                      </div>
                      <div className="mt-2 border-t pt-2 text-[11px] text-muted-foreground">{article.date} · {article.author}</div>
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