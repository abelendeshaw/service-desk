import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, Grid3X3, List, FileSearch, Plus, Pencil } from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { filterTicketsForEngineer } from "../../lib/engineerTickets";
import { getTicketSupportType, supportTypeBadgeClass } from "../../lib/ticketSupportType";
import { useAuth } from "../../store/authStore";
import { useServiceDesk } from "../../store/serviceDeskStore";

const avatarColors = ["#0284c7", "#7c3aed", "#0891b2", "#059669", "#d97706", "#dc2626"];

export function EngineerKnowledgeBase() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tickets, ticketArticles, getOrCreateTicketArticle, slas } = useServiceDesk();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [statusFilter, setStatusFilter] = useState<"all" | "Published" | "Draft">("all");

  const myTickets = useMemo(
    () => filterTicketsForEngineer(tickets, user?.engineerId),
    [tickets, user?.engineerId],
  );

  const filtered = useMemo(() => {
    return myTickets.filter((t) => {
      const article = ticketArticles[t.id] ?? getOrCreateTicketArticle({ ticketId: t.id });
      if (statusFilter !== "all" && article.status !== statusFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        t.subject.toLowerCase().includes(q) ||
        t.id.includes(q) ||
        t.project.toLowerCase().includes(q) ||
        article.title.toLowerCase().includes(q)
      );
    });
  }, [myTickets, search, statusFilter, ticketArticles, getOrCreateTicketArticle]);

  const handleCreateArticle = (ticketId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    getOrCreateTicketArticle({ ticketId });
    navigate(`/engineer/knowledge/edit/${ticketId}`);
  };

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <div className="border-b bg-background px-6 py-4 flex-shrink-0">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight">Knowledge Base</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Articles from your assigned tickets · {myTickets.length} tickets
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 border-b bg-background px-6 py-3 flex-shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tickets or articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 bg-muted pl-9 pr-3 text-[13px]"
          />
        </div>
        <div className="flex items-center gap-1">
          {(["all", "Published", "Draft"] as const).map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-[12px]"
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "All" : s}
            </Button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1 rounded-md border bg-muted p-0.5">
          <Button onClick={() => setViewMode("list")} variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="size-7">
            <List className="w-3.5 h-3.5" />
          </Button>
          <Button onClick={() => setViewMode("grid")} variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="size-7">
            <Grid3X3 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
          <FileSearch className="w-10 h-10 text-muted-foreground" />
          <div className="text-center">
            <div className="text-[14px] font-medium">No articles found</div>
            <div className="mt-1 text-[13px] text-muted-foreground">
              {search ? "Try a different search term" : "Create articles from your assigned tickets"}
            </div>
          </div>
        </div>
      ) : viewMode === "list" ? (
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Ticket / Article</TableHead>
                <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Project</TableHead>
                <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Support</TableHead>
                <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Updated</TableHead>
                <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-background">
              {filtered.map((t, idx) => {
                const article = ticketArticles[t.id] ?? getOrCreateTicketArticle({ ticketId: t.id });
                const supportType = getTicketSupportType(slas, t.project);
                return (
                  <TableRow
                    key={t.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/engineer/knowledge/ticket/${t.id}`)}
                  >
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
                          <div className="max-w-md truncate text-[13px] font-medium">{article.title || t.subject}</div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">#{t.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <Badge variant="secondary" className="text-[11px]">{t.project}</Badge>
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <Badge variant="outline" className={`text-[11px] ${supportTypeBadgeClass[supportType]}`}>
                        {supportType}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${article.status === "Published" ? "text-emerald-600" : "text-muted-foreground"}`}>
                        <span className={`size-1.5 rounded-full ${article.status === "Published" ? "bg-emerald-600" : "bg-muted-foreground"}`} />
                        {article.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-[12px] text-muted-foreground">
                      {article.updatedAt.slice(0, 10)}
                    </TableCell>
                    <TableCell className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 px-2 text-[11px]"
                          onClick={(e) => handleCreateArticle(t.id, e)}
                        >
                          <Pencil className="w-3 h-3" />
                          {article.status === "Draft" ? "Edit" : "Update"}
                        </Button>
                      </div>
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
            {filtered.map((t, idx) => {
              const article = ticketArticles[t.id] ?? getOrCreateTicketArticle({ ticketId: t.id });
              const supportType = getTicketSupportType(slas, t.project);
              return (
                <Card
                  key={t.id}
                  className="group cursor-pointer p-4 transition-all hover:shadow-sm"
                  onClick={() => navigate(`/engineer/knowledge/ticket/${t.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="mb-3 flex items-start justify-between">
                      <Avatar className="size-8 rounded-md">
                        <AvatarFallback
                          className="rounded-md text-[11px] font-semibold text-white"
                          style={{ backgroundColor: avatarColors[idx % avatarColors.length] }}
                        >
                          {t.project.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className={`text-[11px] font-medium ${article.status === "Published" ? "text-emerald-600" : "text-muted-foreground"}`}>
                        {article.status}
                      </span>
                    </div>
                    <h3 className="mb-2 line-clamp-2 text-[13px] leading-snug font-medium">{article.title || t.subject}</h3>
                    <Badge variant="outline" className={`text-[10px] ${supportTypeBadgeClass[supportType]}`}>{supportType}</Badge>
                    <div className="mt-3 flex items-center justify-between border-t pt-2">
                      <span className="text-[11px] text-muted-foreground">#{t.id}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 px-2 text-[11px]"
                        onClick={(e) => handleCreateArticle(t.id, e)}
                      >
                        <Plus className="w-3 h-3" />
                        Article
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
