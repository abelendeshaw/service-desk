import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, BookOpen, Calendar, Eye, Pencil, User } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { useAuth } from "../../store/authStore";
import { useServiceDesk } from "../../store/serviceDeskStore";

const categories = ["General", "Network", "VPN", "Hardware", "Process", "Security"];

export function ClientArticleDetail() {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const { user } = useAuth();
  const { clientArticles, updateClientArticle, incrementClientArticleViews } = useServiceDesk();
  const article = clientArticles.find((a) => a.id === id);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");

  useEffect(() => {
    if (article && !editing) {
      setTitle(article.title);
      setCategory(article.category);
      setContent(article.content);
      setStatus(article.status);
    }
  }, [article, editing]);

  useEffect(() => {
    if (article && article.company === user?.company) {
      incrementClientArticleViews(article.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.id]);

  if (!article) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTitle>Article not found</AlertTitle>
          <AlertDescription>
            <button className="underline" onClick={() => navigate("/client/knowledge")}>Back to knowledge base</button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (article.company !== user?.company) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Access denied</AlertTitle>
          <AlertDescription>This article belongs to another organization.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleSave = () => {
    updateClientArticle({ id: article.id, title: title.trim(), category, content: content.trim(), status });
    setEditing(false);
  };

  return (
    <div className="min-h-full bg-muted/30">
      <div className="border-b bg-background px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="size-8" onClick={() => navigate("/client/knowledge")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-600" />
                <Badge variant="outline" className="text-[11px]">{article.category}</Badge>
                <Badge variant={article.status === "Published" ? "default" : "secondary"} className="text-[11px]">
                  {article.status}
                </Badge>
              </div>
              {!editing ? (
                <h1 className="mt-1 text-[20px] font-semibold tracking-tight">{article.title}</h1>
              ) : (
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 h-9 text-[16px] font-semibold" />
              )}
            </div>
          </div>
          {!editing ? (
            <Button variant="outline" size="sm" className="gap-1.5 text-[12px]" onClick={() => setEditing(true)}>
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700" onClick={handleSave}>Save</Button>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-6 flex flex-wrap items-center gap-4 text-[12px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{article.authorName}</span>
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Updated {article.updatedAt.slice(0, 10)}</span>
          <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{article.views} views</span>
        </div>

        {editing ? (
          <Card>
            <CardHeader><CardTitle className="text-base">Edit Article</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block text-[12px]">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-[12px]">Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as "Draft" | "Published")}>
                    <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={14} className="resize-none text-[13px]" />
            </CardContent>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="whitespace-pre-wrap text-[14px] leading-relaxed text-muted-foreground">{article.content}</div>
          </Card>
        )}
      </div>
    </div>
  );
}
