import React, { useState, useRef, useEffect, type ReactNode } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router';
import { toast } from 'sonner';
import {
  Plus, FileText, Folder, PenLine, Bold, Italic, Underline,
  Strikethrough, Undo2, Redo2, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Link as LinkIcon, ChevronDown,
  Type, Highlighter, MoreHorizontal, X, Ticket, Building2, User, Clock,
  ExternalLink, AlertCircle, ArrowLeft,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { useServiceDesk, draftTicketArticle } from '../store/serviceDeskStore';
import { getTicketSupportType, supportTypeBadgeClass } from '../lib/ticketSupportType';
import { getKnowledgeBasePaths } from '../lib/portalPaths';

const existingCategories = [
  'Uncategorized',
  'Network',
  'Power & UPS',
  'Servers',
  'Security',
  'General',
];

type BlockType = 'Paragraph' | 'Heading 1' | 'Heading 2' | 'Heading 3' | 'Quote' | 'Code';

const blockTypes: BlockType[] = ['Paragraph', 'Heading 1', 'Heading 2', 'Heading 3', 'Quote', 'Code'];

const statusColors: Record<string, { className: string; dotClass: string }> = {
  Open: { className: 'bg-blue-50 text-blue-700 border-blue-200', dotClass: 'bg-blue-500' },
  'In Progress': { className: 'bg-amber-50 text-amber-700 border-amber-200', dotClass: 'bg-amber-500' },
  Escalated: { className: 'bg-red-50 text-red-700 border-red-200', dotClass: 'bg-red-500' },
  Resolved: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotClass: 'bg-emerald-500' },
  Closed: { className: 'bg-gray-50 text-gray-600 border-gray-200', dotClass: 'bg-gray-400' },
};

export function CreateArticle() {
  const navigate = useNavigate();
  const location = useLocation();
  const paths = getKnowledgeBasePaths(location.pathname);
  const { ticketId: rawTicketId } = useParams<{ ticketId: string }>();
  const ticketId = (rawTicketId ?? '').replace('#', '');
  const {
    tickets,
    ticketArticles,
    getOrCreateTicketArticle,
    updateTicketArticle,
    slas,
  } = useServiceDesk();
  const ticket = tickets.find((t) => t.id === ticketId);

  useEffect(() => {
    if (ticketId && ticket && !ticketArticles[ticketId]) {
      getOrCreateTicketArticle({ ticketId });
    }
  }, [ticketId, ticket, ticketArticles, getOrCreateTicketArticle]);

  const article = ticketId && ticket
    ? (ticketArticles[ticketId] ?? draftTicketArticle(ticket))
    : null;
  const supportType = ticket ? getTicketSupportType(slas, ticket.project) : null;

  const editorRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Uncategorized');
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState(existingCategories);
  const [activeBlock, setActiveBlock] = useState<BlockType>('Paragraph');
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (initializedRef.current || !article) return;
    initializedRef.current = true;
    setTitle(article.title);
    const projectCategory = article.project || 'Uncategorized';
    setCategories((prev) =>
      prev.includes(projectCategory) ? prev : [...prev, projectCategory],
    );
    setCategory(projectCategory);
    if (editorRef.current && article.content) {
      editorRef.current.innerHTML = article.content;
      const text = editorRef.current.innerText || '';
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    }
  }, [article]);

  const execCmd = (cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
  };

  const handleEditorInput = () => {
    const text = editorRef.current?.innerText || '';
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  };

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(prev => [...prev, newCategory.trim()]);
      setCategory(newCategory.trim());
    }
    setNewCategory('');
    setShowAddCategory(false);
  };

  const handlePublish = () => {
    if (!ticketId || !title.trim()) return;
    const content = editorRef.current?.innerHTML ?? '';
    updateTicketArticle({
      ticketId,
      title: title.trim(),
      content,
      status: 'Published',
    });
    toast.success('Article published');
    navigate(paths.ticketView(ticketId));
  };

  const handleBack = () => {
    if (ticket) {
      navigate(paths.ticketView(ticket.id));
      return;
    }
    navigate(paths.ticketsRoot);
  };

  const handleCancel = () => {
    if (ticket) {
      navigate(paths.ticketView(ticket.id));
      return;
    }
    navigate(paths.ticketsRoot);
  };

  const sc = ticket ? statusColors[ticket.status] : null;

  const ToolbarBtn = ({
    onClick, children, tip, active
  }: {
    onClick: () => void;
    children: ReactNode;
    tip?: string;
    active?: boolean;
  }) => (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={tip}
      className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
        active ? 'bg-[#0b2235] text-white' : 'text-[#4b5563] hover:bg-[#f1f3f5] hover:text-[#0b2235]'
      }`}
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => (
    <div className="w-px h-5 bg-[#e1e4e8] mx-0.5" />
  );

  return (
    <div className="min-h-full bg-[#f8f9fa] flex flex-col">
      {/* Header */}
      <div className="bg-sidebar border-sidebar-border flex-shrink-0 border-b px-6 py-5">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex size-8 flex-shrink-0 items-center justify-center rounded-md border border-violet-400/25 bg-white text-[#6c757d] transition-colors hover:text-[#0b2235]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sidebar-foreground text-[20px] font-semibold tracking-tight">
              {ticket ? `Create Article from Ticket #${ticket.id}` : 'Create New Article'}
            </h1>
            <p className="text-sidebar-muted-foreground mt-0.5 text-[13px]">
              {ticket
                ? 'Document the resolution and publish to the knowledge base'
                : 'Fill in the details to publish a new article'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">

          {!ticket && ticketId ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ticket not found</AlertTitle>
              <AlertDescription>
                Ticket <span className="font-semibold">#{ticketId}</span> does not exist.{' '}
                <button
                  type="button"
                  className="font-medium underline hover:no-underline"
                  onClick={() => navigate(paths.ticketsRoot)}
                >
                  Go back to tickets
                </button>
              </AlertDescription>
            </Alert>
          ) : null}

          {ticket && sc ? (
            <div className="bg-white border border-[#e1e4e8] rounded-lg p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <label className="flex items-center gap-2 text-[12px] font-semibold text-[#4b5563]">
                  <Ticket className="w-3.5 h-3.5 text-[#9ca3af]" />
                  Linked Ticket
                </label>
                <Link
                  to={paths.ticketView(ticket.id)}
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  View ticket
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded bg-[#f1f3f5] px-1.5 py-0.5 font-mono text-[11px] text-[#6c757d]">
                  #{ticket.id}
                </span>
                <Badge variant="outline" className={`gap-1.5 text-[11px] ${sc.className}`}>
                  <span className={`size-1.5 rounded-full ${sc.dotClass}`} />
                  {ticket.status}
                </Badge>
                {ticket.priority ? (
                  <Badge variant="outline" className="text-[11px]">
                    {ticket.priority}
                  </Badge>
                ) : null}
                {supportType ? (
                  <Badge variant="outline" className={`text-[11px] ${supportTypeBadgeClass[supportType] ?? ''}`}>
                    {supportType}
                  </Badge>
                ) : null}
              </div>

              <h2 className="text-[15px] font-semibold text-[#1a1d21] leading-snug mb-3">
                {ticket.subject}
              </h2>

              <div className="grid gap-2 sm:grid-cols-2 mb-4">
                <div className="flex items-center gap-2 text-[12px] text-[#6c757d]">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{ticket.project}</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-[#6c757d]">
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{ticket.contactName}</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-[#6c757d]">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-[#6c757d]">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Updated {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {ticket.description ? (
                <div className="rounded-md border border-[#f1f3f5] bg-[#fafafa] px-3 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af] mb-1">
                    Description
                  </p>
                  <p className="text-[13px] text-[#4b5563] leading-relaxed line-clamp-4 whitespace-pre-wrap">
                    {ticket.description}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Article Title */}
          <div className="bg-white border border-[#e1e4e8] rounded-lg p-5">
            <label className="flex items-center gap-2 text-[12px] font-semibold text-[#4b5563] mb-3">
              <FileText className="w-3.5 h-3.5 text-[#9ca3af]" />
              Article Title
              <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter a descriptive title for your article..."
              className="w-full h-10 px-3 border border-[#e1e4e8] rounded-md text-[14px] text-[#1a1d21] placeholder-[#c4c9d0] focus:outline-none focus:ring-2 focus:ring-[#0b2235]/15 focus:border-[#0b2235] transition-all"
            />
          </div>

          {/* Category */}
          <div className="bg-white border border-[#e1e4e8] rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-[12px] font-semibold text-[#4b5563]">
                <Folder className="w-3.5 h-3.5 text-[#9ca3af]" />
                Category
              </label>
              {!showAddCategory ? (
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="flex items-center gap-1 text-[12px] text-primary hover:text-primary-hover font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add category
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCategory()}
                    placeholder="Category name..."
                    autoFocus
                    className="h-7 px-2.5 text-[12px] border border-[#0b2235] rounded-md focus:outline-none w-36"
                  />
                  <button onClick={addCategory} className="h-7 px-2.5 text-[12px] text-white bg-[#0b2235] rounded-md hover:bg-[#0f2d45] transition-colors">
                    Add
                  </button>
                  <button onClick={() => { setShowAddCategory(false); setNewCategory(''); }} className="text-[#9ca3af] hover:text-[#6c757d]">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full h-10 px-3 pr-8 border border-[#e1e4e8] rounded-md text-[13px] text-[#1a1d21] bg-white focus:outline-none focus:ring-2 focus:ring-[#0b2235]/15 focus:border-[#0b2235] appearance-none transition-all"
              >
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af] pointer-events-none" />
            </div>
          </div>

          {/* Article Content */}
          <div className="bg-white border border-[#e1e4e8] rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f1f3f5]">
              <label className="flex items-center gap-2 text-[12px] font-semibold text-[#4b5563]">
                <PenLine className="w-3.5 h-3.5 text-[#9ca3af]" />
                Article Content
                <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Rich Text Toolbar */}
            <div className="px-3 py-2 border-b border-[#f1f3f5] flex items-center gap-0.5 flex-wrap bg-[#fafafa]">
              {/* Undo/Redo */}
              <ToolbarBtn onClick={() => execCmd('undo')} tip="Undo">
                <Undo2 className="w-3.5 h-3.5" />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => execCmd('redo')} tip="Redo">
                <Redo2 className="w-3.5 h-3.5" />
              </ToolbarBtn>

              <ToolbarDivider />

              {/* Block Type */}
              <div className="relative">
                <button
                  onMouseDown={(e) => { e.preventDefault(); setShowBlockMenu(!showBlockMenu); }}
                  className="flex items-center gap-1.5 h-7 px-2.5 rounded text-[12px] text-[#4b5563] hover:bg-[#f1f3f5] transition-colors"
                >
                  {activeBlock}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showBlockMenu && (
                  <div className="absolute top-8 left-0 bg-white border border-[#e1e4e8] rounded-lg shadow-lg z-20 py-1 min-w-[140px]">
                    {blockTypes.map(bt => (
                      <button
                        key={bt}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setActiveBlock(bt);
                          setShowBlockMenu(false);
                          const tagMap: Record<BlockType, string> = {
                            'Paragraph': 'p', 'Heading 1': 'h1', 'Heading 2': 'h2',
                            'Heading 3': 'h3', 'Quote': 'blockquote', 'Code': 'pre'
                          };
                          document.execCommand('formatBlock', false, tagMap[bt]);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#f8f9fa] transition-colors ${activeBlock === bt ? 'text-[#0b2235] font-medium' : 'text-[#4b5563]'}`}
                      >
                        {bt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <ToolbarDivider />

              {/* Format */}
              <ToolbarBtn onClick={() => execCmd('bold')} tip="Bold">
                <Bold className="w-3.5 h-3.5" />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => execCmd('italic')} tip="Italic">
                <Italic className="w-3.5 h-3.5" />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => execCmd('underline')} tip="Underline">
                <Underline className="w-3.5 h-3.5" />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => execCmd('strikeThrough')} tip="Strikethrough">
                <Strikethrough className="w-3.5 h-3.5" />
              </ToolbarBtn>

              <ToolbarDivider />

              {/* Color */}
              <div className="relative group">
                <button
                  className="flex items-center gap-0.5 h-7 px-1.5 rounded text-[#4b5563] hover:bg-[#f1f3f5] transition-colors"
                  title="Text color"
                >
                  <Type className="w-3.5 h-3.5" />
                  <div className="w-3.5 h-1 rounded-sm bg-[#1a1d21] mt-0.5" />
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>
              </div>

              <div className="relative group">
                <button
                  className="flex items-center gap-0.5 h-7 px-1.5 rounded text-[#4b5563] hover:bg-[#f1f3f5] transition-colors"
                  title="Highlight"
                >
                  <Highlighter className="w-3.5 h-3.5" />
                  <div className="w-3.5 h-1 rounded-sm bg-yellow-300 mt-0.5" />
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>
              </div>

              <ToolbarDivider />

              {/* Lists */}
              <ToolbarBtn onClick={() => execCmd('insertUnorderedList')} tip="Bullet list">
                <List className="w-3.5 h-3.5" />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => execCmd('insertOrderedList')} tip="Numbered list">
                <ListOrdered className="w-3.5 h-3.5" />
              </ToolbarBtn>

              <ToolbarDivider />

              {/* Align */}
              <ToolbarBtn onClick={() => execCmd('justifyLeft')} tip="Align left">
                <AlignLeft className="w-3.5 h-3.5" />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => execCmd('justifyCenter')} tip="Align center">
                <AlignCenter className="w-3.5 h-3.5" />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => execCmd('justifyRight')} tip="Align right">
                <AlignRight className="w-3.5 h-3.5" />
              </ToolbarBtn>

              <ToolbarDivider />

              {/* Link / Image */}
              <ToolbarBtn
                onClick={() => {
                  const url = prompt('Enter URL:');
                  if (url) execCmd('createLink', url);
                }}
                tip="Insert link"
              >
                <LinkIcon className="w-3.5 h-3.5" />
              </ToolbarBtn>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    title="More options"
                    className="w-7 h-7 flex items-center justify-center rounded transition-colors text-[#4b5563] hover:bg-[#f1f3f5] hover:text-[#0b2235]"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => toast.success('Draft duplicated')}>
                    Duplicate draft
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => toast.success('Draft exported')}>
                    Export markdown
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => toast.success('Draft archived')} variant="destructive">
                    Archive draft
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Editor Area */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditorInput}
              onClick={() => setShowBlockMenu(false)}
              data-placeholder="Start writing your article content here..."
              className="min-h-[320px] p-5 text-[14px] text-[#1a1d21] leading-relaxed focus:outline-none"
              style={{
                fontFamily: "'Inter', sans-serif",
              }}
            />

            {/* Editor Footer */}
            <div className="px-5 py-2.5 border-t border-[#f1f3f5] bg-[#fafafa] flex items-center justify-between">
              <span className="text-[11px] text-[#9ca3af]">{wordCount} words</span>
              <span className="text-[11px] text-[#9ca3af]">Auto-saved</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pb-4">
            <button
              onClick={handleCancel}
              className="h-9 px-5 text-[13px] font-medium text-[#4b5563] border border-[#e1e4e8] rounded-md bg-white hover:border-[#0b2235] hover:text-[#0b2235] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              className="h-9 px-5 text-[13px] font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              disabled={!title.trim() || !ticketId}
            >
              Publish Article
            </button>
          </div>
        </div>
      </div>

      {/* Inline editor styles */}
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #c4c9d0;
          pointer-events: none;
        }
        [contenteditable] h1 { font-size: 1.5em; font-weight: 700; margin: 0.75em 0 0.25em; color: #0b2235; }
        [contenteditable] h2 { font-size: 1.25em; font-weight: 600; margin: 0.75em 0 0.25em; color: #0b2235; }
        [contenteditable] h3 { font-size: 1.1em; font-weight: 600; margin: 0.5em 0 0.25em; color: #0b2235; }
        [contenteditable] p { margin: 0.25em 0; }
        [contenteditable] blockquote { border-left: 3px solid #0b2235; padding-left: 1em; color: #6c757d; font-style: italic; margin: 0.5em 0; }
        [contenteditable] pre { background: #f8f9fa; border: 1px solid #e1e4e8; border-radius: 4px; padding: 0.75em 1em; font-family: monospace; font-size: 0.875em; }
        [contenteditable] ul { list-style: disc; padding-left: 1.5em; }
        [contenteditable] ol { list-style: decimal; padding-left: 1.5em; }
        [contenteditable] a { color: #2563eb; text-decoration: underline; }
        [contenteditable] strong { font-weight: 600; }
      `}</style>
    </div>
  );
}
