import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, FileText, Save } from "lucide-react";
import { Button } from "../../components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useAuth } from "../../store/authStore";
import { useServiceDesk } from "../../store/serviceDeskStore";

export function ClientCreateArticle() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createClientArticle } = useServiceDesk();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");

  const handleSave = () => {
    if (!user || !title.trim()) return;
    const id = createClientArticle({
      company: user.company,
      authorId: user.id,
      authorName: user.name,
      title: title.trim(),
      content: content.trim(),
      status,
    });
    navigate(`/client/knowledge/${id}`);
  };

  return (
    <div className="min-h-full bg-muted/30 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="outline" size="icon" className="size-8" onClick={() => navigate("/client/knowledge")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">Create Article</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Add documentation for your organization</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4" />
              Article Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-1.5 block text-[12px]">Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. VPN setup guide for remote staff"
                className="h-9 text-[13px]"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-[12px]">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as "Draft" | "Published")}>
                <SelectTrigger className="h-9 w-full text-[13px] sm:w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-[12px]">Content</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article content here..."
                rows={12}
                className="resize-none text-[13px]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => navigate("/client/knowledge")}>Cancel</Button>
              <Button className="gap-1.5 bg-violet-600 hover:bg-violet-700" disabled={!title.trim()} onClick={handleSave}>
                <Save className="w-3.5 h-3.5" />
                Save Article
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
